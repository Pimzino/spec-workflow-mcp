/**
 * Word 转 Markdown 转换策略
 *
 * 实现从 Word 文档（.doc, .docx）到 Markdown 的转换
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
  cleanDirectory,
  getTempDirectory,
  getFilesInDirectory,
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
 * Word2Md 转换策略类
 *
 * 实现 Word 文档到 Markdown 的转换逻辑
 */
export class Word2MdStrategy implements IConversionStrategy {
  /**
   * 使用 Pandoc 进行 Word 到 Markdown 的转换
   *
   * @param inputPath - 输入 Word 文件路径
   * @param outputPath - 输出 Markdown 文件路径
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
      console.error("[Word2MdStrategy] 开始 Pandoc 转换");
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

      // 准备输出目录结构
      const outputDir = dirname(outputPath);
      await ensureDirectoryExists(outputDir);

      // 获取文件名（不含扩展名）
      const filename = basename(inputPath, extname(inputPath));

      // 创建临时目录结构 .temp/{filename}/
      const tempDir = getTempDirectory(outputDir, filename);
      await ensureDirectoryExists(tempDir);

      // 设置媒体目录
      const extractMedia = options?.extractMedia !== false; // 默认提取媒体
      const mediaDir = options?.mediaDir || "media";
      const mediaPath = extractMedia ? join(tempDir, mediaDir) : undefined;

      // 输出文件路径（在临时目录中）
      const tempOutputPath = join(tempDir, `${filename}.md`);

      // 构建 Pandoc 命令参数
      const args = [
        "-f",
        "docx", // 输入格式
        "-t",
        "gfm", // GitHub Flavored Markdown
        "--wrap=none", // 不自动换行
      ];

      // 如果提取媒体文件
      if (mediaPath) {
        args.push(`--extract-media=${tempDir}`);
        // Pandoc 会自动创建 media 子目录
      }

      // 添加自定义 Pandoc 参数
      if (options?.pandocArgs) {
        args.push(...options.pandocArgs);
      }

      // 输出文件
      args.push("-o", tempOutputPath);

      // 输入文件
      args.push(inputPath);

      // 执行转换
      console.error(
        `[Word2MdStrategy] 执行 Pandoc: ${pandocPath} ${args.join(" ")}`
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
      if (!(await fileExists(tempOutputPath))) {
        throw new ConversionError(
          `输出文件未生成: ${tempOutputPath}`,
          ConversionErrorCode.OUTPUT_FILE_CREATION_FAILED
        );
      }

      // 收集媒体文件信息
      let mediaFiles: string[] = [];
      if (mediaPath && (await fileExists(mediaPath))) {
        mediaFiles = await getFilesInDirectory(mediaPath, { recursive: true });
        console.error(
          `[Word2MdStrategy] 提取了 ${mediaFiles.length} 个媒体文件`
        );
      }

      // 获取文件大小
      const inputSize = await validateFileSize(inputPath, Infinity);
      const outputSize = await validateFileSize(tempOutputPath, Infinity);

      const duration = Date.now() - startTime;

      // 清理选项
      const shouldCleanup = !options?.keepTemp;
      if (shouldCleanup) {
        console.error("[Word2MdStrategy] 保留临时文件用于后续使用（不清理）");
      }

      console.error(`[Word2MdStrategy] 转换成功，耗时: ${duration}ms`);

      return {
        success: true,
        outputPath: tempOutputPath,
        method: "pandoc",
        tempPath: tempDir,
        mediaFiles: mediaFiles.length > 0 ? mediaFiles : undefined,
        message: `成功将 Word 文档转换为 Markdown (${(
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
        console.error(`[Word2MdStrategy] 转换失败: ${error.message}`);
        throw error;
      }

      console.error("[Word2MdStrategy] 转换异常:", error);
      throw new ConversionError(
        `Word 转 Markdown 失败: ${
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
   * 使用 API 进行 Word 到 Markdown 的转换
   *
   * @param inputPath - 输入 Word 文件路径
   * @param outputPath - 输出 Markdown 文件路径
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
      console.error("[Word2MdStrategy] 开始 API 转换");
      console.error(`  输入: ${inputPath}`);
      console.error(`  输出: ${outputPath}`);
      console.error(`  API: ${apiUrl}`);

      // 验证输入文件
      await this.validateInput(inputPath);

      // 准备输出目录
      const outputDir = dirname(outputPath);
      await ensureDirectoryExists(outputDir);

      // 获取文件名
      const filename = basename(inputPath, extname(inputPath));

      // 创建临时目录
      const tempDir = getTempDirectory(outputDir, filename);
      await ensureDirectoryExists(tempDir);

      // 读取文件内容
      const { readFile } = await import("fs/promises");
      const fileBuffer = await readFile(inputPath);
      const fileContent = fileBuffer.toString("base64");

      // 构建 API 请求
      const requestBody = {
        type: "word2md",
        fileContent,
        fileName: basename(inputPath),
        options: {
          extractMedia: options?.extractMedia !== false,
          pandocArgs: options?.pandocArgs,
        },
      };

      console.error("[Word2MdStrategy] 发送 API 请求...");

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
        if (contentType.includes("application/zip")) {
          // ZIP 响应 - 包含 Markdown 和媒体文件
          console.error("[Word2MdStrategy] 接收到 ZIP 响应");

          const zipBuffer = Buffer.from(await response.arrayBuffer());
          const zipPath = join(tempDir, "result.zip");

          // 保存 ZIP 文件
          const { writeFile } = await import("fs/promises");
          await writeFile(zipPath, zipBuffer);

          // 解压（这里需要 ZIP 库支持，当前简化处理）
          throw new ConversionError(
            "API 返回 ZIP 格式，需要添加 ZIP 解压支持",
            ConversionErrorCode.UNSUPPORTED_FORMAT
          ).setContext({
            suggestion: "请安装 pandoc 在本地使用，或联系管理员升级 API 支持",
          });
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
          const markdownContent = Buffer.from(
            apiResult.data,
            "base64"
          ).toString("utf-8");

          // 保存 Markdown 文件
          const tempOutputPath = join(tempDir, `${filename}.md`);
          const { writeFile } = await import("fs/promises");
          await writeFile(tempOutputPath, markdownContent, "utf-8");

          const duration = Date.now() - startTime;
          const inputSize = await validateFileSize(inputPath, Infinity);
          const outputSize = await validateFileSize(tempOutputPath, Infinity);

          console.error(`[Word2MdStrategy] API 转换成功，耗时: ${duration}ms`);

          return {
            success: true,
            outputPath: tempOutputPath,
            method: "api",
            tempPath: tempDir,
            message: `成功通过 API 将 Word 文档转换为 Markdown`,
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
        console.error(`[Word2MdStrategy] API 转换失败: ${error.message}`);
        throw error;
      }

      console.error("[Word2MdStrategy] API 转换异常:", error);
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
    if (!SUPPORTED_EXTENSIONS.word.includes(ext)) {
      throw new ConversionError(
        `不支持的文件格式: ${ext} (支持: ${SUPPORTED_EXTENSIONS.word.join(
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
 * 创建 Word2Md 策略实例
 *
 * @returns Word2MdStrategy 实例
 */
export function createWord2MdStrategy(): Word2MdStrategy {
  return new Word2MdStrategy();
}
