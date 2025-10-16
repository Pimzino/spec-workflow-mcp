/**
 * Markdown 转 Word 转换策略
 *
 * 实现从 Markdown 到 Word 文档（.docx）的转换
 * 支持本地 Pandoc 转换和远程 API 转换两种方式
 */

import { join, dirname, basename, extname } from "path";
import {
  ConversionResult,
  ConversionOptions,
  ConversionError,
  ConversionErrorCode,
} from "../../types/converter-types.js";
import { IConversionStrategy } from "./conversion-strategy.js";
import { PandocExecutor } from "../../utils/pandoc-executor.js";
import {
  validatePath,
  validateFileSize,
  fileExists,
  ensureDirectoryExists,
  SUPPORTED_EXTENSIONS,
} from "../../utils/file-utils.js";

/**
 * API 响应接口
 */
interface ApiResponse {
  success: boolean;
  data?: string; // Base64 编码的内容
  error?: string;
  message?: string;
}

/**
 * Md2Word 转换策略类
 *
 * 实现 Markdown 到 Word 文档的转换逻辑
 */
export class Md2WordStrategy implements IConversionStrategy {
  /**
   * 使用 Pandoc 进行 Markdown 到 Word 的转换
   *
   * @param inputPath - 输入 Markdown 文件路径
   * @param outputPath - 输出 Word 文件路径
   * @param options - 转换选项
   * @param pandocPath - Pandoc 路径
   * @returns 转换结果
   */
  async convertWithPandoc(
    inputPath: string,
    outputPath: string,
    options?: ConversionOptions,
    pandocPath: string = "pandoc"
  ): Promise<ConversionResult> {
    const startTime = Date.now();

    try {
      console.error("[Md2WordStrategy] 开始 Pandoc 转换");
      console.error(`  输入: ${inputPath}`);
      console.error(`  输出: ${outputPath}`);

      // 验证输入文件
      await this.validateInput(inputPath);

      // 创建 Pandoc 执行器
      const executor = new PandocExecutor(pandocPath);

      // 检查 Pandoc 可用性
      const available = await executor.checkAvailability();
      if (!available) {
        throw new ConversionError(
          "Pandoc 不可用",
          ConversionErrorCode.PANDOC_NOT_AVAILABLE
        );
      }

      // 准备输出目录
      const outputDir = dirname(outputPath);
      await ensureDirectoryExists(outputDir);

      // 确定输出文件路径
      let finalOutputPath = outputPath;
      if (!outputPath.toLowerCase().endsWith(".docx")) {
        // 如果输出路径没有 .docx 扩展名，添加它
        const baseName = basename(inputPath, extname(inputPath));
        finalOutputPath = join(outputDir, `${baseName}.docx`);
      }

      // 构建 Pandoc 命令参数
      const args = [
        "-f",
        "gfm", // GitHub Flavored Markdown
        "-t",
        "docx", // 输出格式为 Word
      ];

      // 添加自定义 Pandoc 参数
      if (options?.pandocArgs) {
        args.push(...options.pandocArgs);
      }

      // 输出文件
      args.push("-o", finalOutputPath);

      // 输入文件
      args.push(inputPath);

      // 执行转换
      console.error(
        `[Md2WordStrategy] 执行 Pandoc: ${pandocPath} ${args.join(" ")}`
      );
      const result = await executor.execute({
        executable: pandocPath,
        args,
      });

      if (!result.success) {
        throw new ConversionError(
          `Pandoc 转换失败: ${result.stderr}`,
          ConversionErrorCode.PANDOC_EXECUTION_FAILED
        ).setContext({
          command: result.command,
          stderr: result.stderr,
          stdout: result.stdout,
        });
      }

      // 验证输出文件
      if (!(await fileExists(finalOutputPath))) {
        throw new ConversionError(
          `输出文件未生成: ${finalOutputPath}`,
          ConversionErrorCode.OUTPUT_FILE_CREATION_FAILED
        );
      }

      // 验证输出文件有内容
      const outputSize = await validateFileSize(finalOutputPath, Infinity);
      if (outputSize === 0) {
        throw new ConversionError(
          "生成的 Word 文件为空",
          ConversionErrorCode.OUTPUT_FILE_CREATION_FAILED
        );
      }

      const duration = Date.now() - startTime;
      const inputSize = await validateFileSize(inputPath, Infinity);

      console.error(`[Md2WordStrategy] 转换成功，耗时: ${duration}ms`);
      console.error(
        `[Md2WordStrategy] 输出文件: ${finalOutputPath} (${(
          outputSize / 1024
        ).toFixed(2)}KB)`
      );

      return {
        success: true,
        outputPath: finalOutputPath,
        method: "pandoc",
        message: `成功将 Markdown 转换为 Word 文档 (${(
          outputSize / 1024
        ).toFixed(2)}KB)`,
        duration,
        fileSize: {
          input: inputSize,
          output: outputSize,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof ConversionError) {
        console.error(`[Md2WordStrategy] 转换失败: ${error.message}`);
        throw error;
      }

      console.error("[Md2WordStrategy] 转换异常:", error);
      throw new ConversionError(
        `Markdown 转 Word 失败: ${
          error instanceof Error ? error.message : String(error)
        }`,
        ConversionErrorCode.PANDOC_EXECUTION_FAILED,
        error instanceof Error ? error : undefined
      ).setContext({
        inputPath,
        outputPath,
        duration,
      });
    }
  }

  /**
   * 使用 API 进行 Markdown 到 Word 的转换
   *
   * @param inputPath - 输入 Markdown 文件路径
   * @param outputPath - 输出 Word 文件路径
   * @param options - 转换选项
   * @param apiUrl - API URL
   * @param apiTimeout - 超时时间
   * @returns 转换结果
   */
  async convertWithApi(
    inputPath: string,
    outputPath: string,
    options: ConversionOptions | undefined,
    apiUrl: string,
    apiTimeout: number = 30000
  ): Promise<ConversionResult> {
    const startTime = Date.now();

    try {
      console.error("[Md2WordStrategy] 开始 API 转换");
      console.error(`  输入: ${inputPath}`);
      console.error(`  输出: ${outputPath}`);
      console.error(`  API: ${apiUrl}`);

      // 验证输入文件
      await this.validateInput(inputPath);

      // 准备输出目录
      const outputDir = dirname(outputPath);
      await ensureDirectoryExists(outputDir);

      // 确定输出文件路径
      let finalOutputPath = outputPath;
      if (!outputPath.toLowerCase().endsWith(".docx")) {
        const baseName = basename(inputPath, extname(inputPath));
        finalOutputPath = join(outputDir, `${baseName}.docx`);
      }

      // 读取 Markdown 文件内容
      const { readFile, writeFile } = await import("fs/promises");
      const markdownContent = await readFile(inputPath, "utf-8");
      const fileContent = Buffer.from(markdownContent).toString("base64");

      // 构建 API 请求
      const requestBody = {
        type: "md2word",
        fileContent,
        fileName: basename(inputPath),
        options: {
          pandocArgs: options?.pandocArgs,
        },
      };

      console.error("[Md2WordStrategy] 发送 API 请求...");

      // 发送 HTTP 请求
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), apiTimeout);

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new ConversionError(
            `API 请求失败: ${response.status} ${response.statusText}`,
            ConversionErrorCode.API_REQUEST_FAILED
          ).setContext({
            status: response.status,
            statusText: response.statusText,
          });
        }

        const contentType = response.headers.get("content-type") || "";

        // 处理响应
        if (
          contentType.includes("application/vnd.openxmlformats") ||
          contentType.includes("application/octet-stream")
        ) {
          // 二进制 Word 文件响应
          console.error("[Md2WordStrategy] 接收到 Word 文件响应");

          const wordBuffer = Buffer.from(await response.arrayBuffer());

          // 保存 Word 文件
          await writeFile(finalOutputPath, wordBuffer);

          // 验证文件大小
          const outputSize = await validateFileSize(finalOutputPath, Infinity);
          if (outputSize === 0) {
            throw new ConversionError(
              "接收到的 Word 文件为空",
              ConversionErrorCode.OUTPUT_FILE_CREATION_FAILED
            );
          }

          const duration = Date.now() - startTime;
          const inputSize = await validateFileSize(inputPath, Infinity);

          console.error(`[Md2WordStrategy] API 转换成功，耗时: ${duration}ms`);

          return {
            success: true,
            outputPath: finalOutputPath,
            method: "api",
            message: `成功通过 API 将 Markdown 转换为 Word 文档`,
            duration,
            fileSize: {
              input: inputSize,
              output: outputSize,
            },
          };
        } else if (contentType.includes("application/json")) {
          // JSON 响应
          const apiResult = (await response.json()) as ApiResponse;

          if (!apiResult.success) {
            throw new ConversionError(
              `API 转换失败: ${apiResult.error || "未知错误"}`,
              ConversionErrorCode.API_REQUEST_FAILED
            ).setContext({ apiResult });
          }

          // 验证 data 字段存在
          if (!apiResult.data) {
            throw new ConversionError(
              "API 响应缺少 data 字段",
              ConversionErrorCode.API_INVALID_RESPONSE
            ).setContext({ apiResult });
          }

          // 解码 Base64 内容
          const wordBuffer = Buffer.from(apiResult.data, "base64");

          // 保存 Word 文件
          await writeFile(finalOutputPath, wordBuffer);

          // 验证文件大小
          const outputSize = await validateFileSize(finalOutputPath, Infinity);
          if (outputSize === 0) {
            throw new ConversionError(
              "接收到的 Word 文件为空",
              ConversionErrorCode.OUTPUT_FILE_CREATION_FAILED
            );
          }

          const duration = Date.now() - startTime;
          const inputSize = await validateFileSize(inputPath, Infinity);

          console.error(`[Md2WordStrategy] API 转换成功，耗时: ${duration}ms`);

          return {
            success: true,
            outputPath: finalOutputPath,
            method: "api",
            message: `成功通过 API 将 Markdown 转换为 Word 文档`,
            duration,
            fileSize: {
              input: inputSize,
              output: outputSize,
            },
          };
        } else {
          throw new ConversionError(
            `不支持的 API 响应类型: ${contentType}`,
            ConversionErrorCode.API_INVALID_RESPONSE
          );
        }
      } catch (error) {
        clearTimeout(timeoutId);

        if ((error as any).name === "AbortError") {
          throw new ConversionError(
            `API 请求超时 (${apiTimeout}ms)`,
            ConversionErrorCode.CONVERSION_TIMEOUT
          );
        }

        throw error;
      }
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof ConversionError) {
        console.error(`[Md2WordStrategy] API 转换失败: ${error.message}`);
        throw error;
      }

      console.error("[Md2WordStrategy] API 转换异常:", error);
      throw new ConversionError(
        `API 转换失败: ${
          error instanceof Error ? error.message : String(error)
        }`,
        ConversionErrorCode.API_REQUEST_FAILED,
        error instanceof Error ? error : undefined
      ).setContext({
        inputPath,
        outputPath,
        apiUrl,
        duration,
      });
    }
  }

  /**
   * 验证输入文件
   *
   * @param inputPath - 输入文件路径
   * @private
   */
  private async validateInput(inputPath: string): Promise<void> {
    // 验证路径安全性
    await validatePath(inputPath);

    // 检查文件是否存在
    if (!(await fileExists(inputPath))) {
      throw new ConversionError(
        `输入文件不存在: ${inputPath}`,
        ConversionErrorCode.FILE_NOT_FOUND
      );
    }

    // 检查文件扩展名
    const ext = extname(inputPath).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.markdown.includes(ext)) {
      throw new ConversionError(
        `不支持的文件格式: ${ext} (支持: ${SUPPORTED_EXTENSIONS.markdown.join(
          ", "
        )})`,
        ConversionErrorCode.UNSUPPORTED_FORMAT
      );
    }

    // 验证文件大小
    await validateFileSize(inputPath);
  }
}

/**
 * 创建 Md2Word 策略实例
 *
 * @returns Md2WordStrategy 实例
 */
export function createMd2WordStrategy(): Md2WordStrategy {
  return new Md2WordStrategy();
}
