/**
 * Pandoc 执行器
 *
 * 封装 Pandoc 命令的执行逻辑，提供安全的命令执行和错误处理
 */

import { spawn } from "child_process";
import {
  PandocCommand,
  PandocExecutionResult,
  ConversionError,
  ConversionErrorCode,
} from "../types/converter-types.js";

/**
 * Pandoc 执行器类
 *
 * 负责检查 Pandoc 可用性、构建和执行 Pandoc 命令
 */
export class PandocExecutor {
  private pandocPath: string;
  private readonly defaultTimeout: number = 60000; // 60 秒

  /**
   * 构造函数
   *
   * @param pandocPath - Pandoc 可执行文件路径，默认为 "pandoc"（从 PATH 查找）
   */
  constructor(pandocPath: string = "pandoc") {
    this.pandocPath = pandocPath;
  }

  /**
   * 检查 Pandoc 是否可用
   *
   * 通过执行 `pandoc --version` 命令来验证 Pandoc 是否已安装且可执行
   *
   * @returns Promise<boolean> - Pandoc 是否可用
   */
  async checkAvailability(): Promise<boolean> {
    try {
      console.error("[PandocExecutor] 检查 Pandoc 可用性...");

      const result = await this.executeCommand({
        executable: this.pandocPath,
        args: ["--version"],
        timeout: 5000, // 5 秒超时
      });

      if (result.success && result.stdout.toLowerCase().includes("pandoc")) {
        const version = result.stdout.split("\n")[0];
        console.error(`[PandocExecutor] Pandoc 可用: ${version}`);
        return true;
      }

      console.error("[PandocExecutor] Pandoc 不可用或版本信息无效");
      return false;
    } catch (error) {
      console.error(
        "[PandocExecutor] Pandoc 检查失败:",
        error instanceof Error ? error.message : String(error)
      );
      return false;
    }
  }

  /**
   * 执行 Pandoc 转换命令
   *
   * @param command - Pandoc 命令配置
   * @returns Promise<PandocExecutionResult> - 执行结果
   * @throws ConversionError - 当命令执行失败时
   */
  async execute(command: PandocCommand): Promise<PandocExecutionResult> {
    // 验证命令参数安全性
    this.validateCommandSecurity(command);

    console.error("[PandocExecutor] 执行 Pandoc 命令:", {
      executable: command.executable,
      args: command.args.join(" "),
      cwd: command.cwd || process.cwd(),
    });

    try {
      const result = await this.executeCommand(command);

      if (!result.success) {
        throw new ConversionError(
          `Pandoc 执行失败: ${result.stderr || "未知错误"}`,
          ConversionErrorCode.PANDOC_EXECUTION_FAILED
        ).setContext({
          command: result.command,
          exitCode: result.exitCode,
          stderr: result.stderr,
          stdout: result.stdout,
        });
      }

      console.error(
        `[PandocExecutor] Pandoc 执行成功，耗时: ${result.duration}ms`
      );
      return result;
    } catch (error) {
      if (error instanceof ConversionError) {
        throw error;
      }

      throw new ConversionError(
        `Pandoc 执行异常: ${
          error instanceof Error ? error.message : String(error)
        }`,
        ConversionErrorCode.PANDOC_EXECUTION_FAILED,
        error instanceof Error ? error : undefined
      ).setContext({
        command: `${command.executable} ${command.args.join(" ")}`,
      });
    }
  }

  /**
   * 执行命令（底层实现）
   *
   * @param command - 命令配置
   * @returns Promise<PandocExecutionResult> - 执行结果
   * @private
   */
  private executeCommand(
    command: PandocCommand
  ): Promise<PandocExecutionResult> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const timeout = command.timeout || this.defaultTimeout;
      const fullCommand = `${command.executable} ${command.args.join(" ")}`;

      let stdout = "";
      let stderr = "";
      let timedOut = false;

      // 使用 spawn 执行命令（不使用 shell，避免注入风险）
      const proc = spawn(command.executable, command.args, {
        cwd: command.cwd || process.cwd(),
        env: { ...process.env, ...command.env },
        shell: false, // 明确禁用 shell，提高安全性
      });

      // 设置超时
      const timeoutHandle = setTimeout(() => {
        timedOut = true;
        proc.kill("SIGTERM");

        // 如果 SIGTERM 在 5 秒内无效，强制杀死
        setTimeout(() => {
          if (!proc.killed) {
            proc.kill("SIGKILL");
          }
        }, 5000);
      }, timeout);

      // 收集 stdout
      proc.stdout?.on("data", (data: Buffer) => {
        stdout += data.toString();
      });

      // 收集 stderr
      proc.stderr?.on("data", (data: Buffer) => {
        stderr += data.toString();
      });

      // 处理进程退出
      proc.on("close", (code: number | null, signal: string | null) => {
        clearTimeout(timeoutHandle);
        const duration = Date.now() - startTime;
        const exitCode = code ?? -1;

        const result: PandocExecutionResult = {
          success: exitCode === 0 && !timedOut,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode,
          duration,
          command: fullCommand,
        };

        if (timedOut) {
          result.success = false;
          result.error = new Error(`命令执行超时（${timeout}ms）`);
          console.error(`[PandocExecutor] 命令超时: ${fullCommand}`);
        } else if (exitCode !== 0) {
          result.error = new Error(`命令退出码: ${exitCode}`);
          console.error(
            `[PandocExecutor] 命令失败 (退出码 ${exitCode}): ${
              stderr || stdout
            }`
          );
        }

        resolve(result);
      });

      // 处理进程错误
      proc.on("error", (error: Error) => {
        clearTimeout(timeoutHandle);
        const duration = Date.now() - startTime;

        // 特殊处理 ENOENT 错误（命令不存在）
        if ((error as any).code === "ENOENT") {
          console.error(`[PandocExecutor] 命令不存在: ${command.executable}`);
          reject(
            new ConversionError(
              `Pandoc 未找到: ${command.executable}`,
              ConversionErrorCode.PANDOC_NOT_AVAILABLE,
              error
            ).setContext({
              executable: command.executable,
              path: process.env.PATH,
            })
          );
        } else {
          console.error(`[PandocExecutor] 进程错误:`, error);
          reject(error);
        }
      });
    });
  }

  /**
   * 验证命令安全性
   *
   * 防止命令注入和危险参数
   *
   * @param command - 命令配置
   * @throws ConversionError - 当检测到不安全的参数时
   * @private
   */
  private validateCommandSecurity(command: PandocCommand): void {
    // 危险字符和模式列表
    const dangerousPatterns = [
      /[;&|`$()]/, // Shell 特殊字符
      /\$\{/, // 变量替换
      /\$\(/, // 命令替换
      />\s*\/dev/, // 设备文件重定向
      /^\s*-.*script/i, // 脚本相关参数
      /--lua-filter.*\.\./, // 路径遍历的 Lua 过滤器
    ];

    // 检查可执行文件路径
    if (!command.executable || typeof command.executable !== "string") {
      throw new ConversionError(
        "无效的可执行文件路径",
        ConversionErrorCode.INVALID_INPUT
      );
    }

    // 检查每个参数
    for (const arg of command.args) {
      if (typeof arg !== "string") {
        throw new ConversionError(
          `无效的参数类型: ${typeof arg}`,
          ConversionErrorCode.INVALID_INPUT
        ).setContext({ argument: String(arg) });
      }

      // 检查危险模式
      for (const pattern of dangerousPatterns) {
        if (pattern.test(arg)) {
          throw new ConversionError(
            `检测到不安全的参数: ${arg}`,
            ConversionErrorCode.INVALID_INPUT
          ).setContext({
            argument: arg,
            pattern: pattern.source,
          });
        }
      }

      // 检查路径遍历
      if (arg.includes("..")) {
        // 只允许在特定参数中使用 ..（如 --resource-path）
        const allowedParams = ["--resource-path", "--data-dir"];
        const isAllowed = command.args.some(
          (a, i) => i < command.args.indexOf(arg) && allowedParams.includes(a)
        );

        if (!isAllowed) {
          console.error(`[PandocExecutor] 警告: 参数包含路径遍历: ${arg}`);
          // 注意：这里只是警告，不抛出错误，因为某些合法用例可能需要 ..
        }
      }
    }

    // 限制参数数量（防止 DoS）
    if (command.args.length > 100) {
      throw new ConversionError(
        `参数数量过多: ${command.args.length}`,
        ConversionErrorCode.INVALID_INPUT
      );
    }

    // 检查超时设置
    if (command.timeout !== undefined) {
      if (command.timeout < 1000 || command.timeout > 600000) {
        throw new ConversionError(
          `无效的超时设置: ${command.timeout}ms (允许范围: 1000-600000)`,
          ConversionErrorCode.INVALID_CONFIG
        );
      }
    }
  }

  /**
   * 设置 Pandoc 路径
   *
   * @param path - 新的 Pandoc 路径
   */
  setPandocPath(path: string): void {
    if (!path || typeof path !== "string") {
      throw new ConversionError(
        "无效的 Pandoc 路径",
        ConversionErrorCode.INVALID_CONFIG
      );
    }
    this.pandocPath = path;
    console.error(`[PandocExecutor] Pandoc 路径已更新: ${path}`);
  }

  /**
   * 获取当前 Pandoc 路径
   *
   * @returns string - Pandoc 路径
   */
  getPandocPath(): string {
    return this.pandocPath;
  }

  /**
   * 获取 Pandoc 版本信息
   *
   * @returns Promise<string | null> - 版本信息，如果无法获取则返回 null
   */
  async getVersion(): Promise<string | null> {
    try {
      const result = await this.executeCommand({
        executable: this.pandocPath,
        args: ["--version"],
        timeout: 5000,
      });

      if (result.success) {
        return result.stdout.split("\n")[0].trim();
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * 检查特定 Pandoc 功能是否可用
   *
   * @param feature - 功能名称（如 "gfm", "docx"）
   * @returns Promise<boolean> - 功能是否可用
   */
  async checkFeature(feature: string): Promise<boolean> {
    try {
      const result = await this.executeCommand({
        executable: this.pandocPath,
        args: ["--list-input-formats"],
        timeout: 5000,
      });

      if (result.success) {
        const formats = result.stdout
          .toLowerCase()
          .split("\n")
          .map((f) => f.trim());
        return formats.includes(feature.toLowerCase());
      }

      return false;
    } catch {
      return false;
    }
  }
}

/**
 * 创建默认 Pandoc 执行器实例
 *
 * @param pandocPath - 可选的 Pandoc 路径
 * @returns PandocExecutor 实例
 */
export function createPandocExecutor(pandocPath?: string): PandocExecutor {
  return new PandocExecutor(pandocPath);
}
