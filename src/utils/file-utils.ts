/**
 * 文件工具模块
 *
 * 提供文件操作相关的工具函数，包括路径验证、文件大小检查、
 * ZIP 处理和目录清理等功能
 */

import { stat, access, readdir, rm, readFile, writeFile } from "fs/promises";
import { constants, createReadStream, createWriteStream } from "fs";
import { join, resolve, normalize, sep } from "path";
import { pipeline } from "stream/promises";
import { createGunzip } from "zlib";
import {
  ConversionError,
  ConversionErrorCode,
  FileValidationResult,
} from "../types/converter-types.js";

/**
 * 文件大小限制（50MB）
 */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * 支持的文件扩展名
 */
export const SUPPORTED_EXTENSIONS = {
  word: [".doc", ".docx"],
  markdown: [".md", ".markdown"],
  all: [".doc", ".docx", ".md", ".markdown"],
};

/**
 * 验证文件路径
 *
 * 检查路径是否安全，防止路径遍历攻击
 *
 * @param filePath - 要验证的文件路径
 * @param basePath - 基准路径（可选），验证 filePath 是否在 basePath 内
 * @returns 规范化后的绝对路径
 * @throws ConversionError - 当路径不安全时
 */
export async function validatePath(
  filePath: string,
  basePath?: string
): Promise<string> {
  try {
    // 基本验证
    if (!filePath || typeof filePath !== "string") {
      throw new ConversionError(
        "无效的文件路径",
        ConversionErrorCode.INVALID_INPUT
      );
    }

    // 解析为绝对路径
    const absolutePath = resolve(filePath);
    const normalizedPath = normalize(absolutePath);

    // 检查路径遍历
    if (filePath.includes("..") || filePath.includes("~")) {
      // 确保规范化后的路径不会逃逸到意外目录
      const pathParts = normalizedPath.split(sep);
      if (pathParts.includes("..")) {
        throw new ConversionError(
          `检测到路径遍历: ${filePath}`,
          ConversionErrorCode.INVALID_INPUT
        );
      }
    }

    // 如果提供了基准路径，验证文件在基准路径内
    if (basePath) {
      const absoluteBasePath = resolve(basePath);
      if (!normalizedPath.startsWith(absoluteBasePath)) {
        throw new ConversionError(
          `文件路径超出允许范围: ${filePath}`,
          ConversionErrorCode.INVALID_INPUT
        ).setContext({
          filePath: normalizedPath,
          basePath: absoluteBasePath,
        });
      }
    }

    // 检查系统目录（额外的安全层）
    const dangerousPaths = [
      "/etc",
      "/usr/bin",
      "/bin",
      "/sbin",
      "/var",
      "/sys",
      "/proc",
      "C:\\Windows",
      "C:\\Program Files",
    ];

    for (const dangerousPath of dangerousPaths) {
      if (
        normalizedPath.toLowerCase().startsWith(dangerousPath.toLowerCase())
      ) {
        console.error(`[FileUtils] 警告: 尝试访问系统目录 ${normalizedPath}`);
        throw new ConversionError(
          `不允许访问系统目录: ${normalizedPath}`,
          ConversionErrorCode.INVALID_INPUT
        );
      }
    }

    return normalizedPath;
  } catch (error) {
    if (error instanceof ConversionError) {
      throw error;
    }

    throw new ConversionError(
      `路径验证失败: ${error instanceof Error ? error.message : String(error)}`,
      ConversionErrorCode.INVALID_INPUT,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * 验证文件大小
 *
 * @param filePath - 文件路径
 * @param maxSize - 最大文件大小（字节），默认 10MB
 * @returns 文件大小（字节）
 * @throws ConversionError - 当文件不存在或超过大小限制时
 */
export async function validateFileSize(
  filePath: string,
  maxSize: number = MAX_FILE_SIZE
): Promise<number> {
  try {
    const stats = await stat(filePath);

    if (!stats.isFile()) {
      throw new ConversionError(
        `路径不是文件: ${filePath}`,
        ConversionErrorCode.INVALID_INPUT
      );
    }

    const fileSize = stats.size;

    if (fileSize > maxSize) {
      const sizeMB = (fileSize / (1024 * 1024)).toFixed(2);
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
      throw new ConversionError(
        `文件大小超出限制: ${sizeMB}MB (限制: ${maxSizeMB}MB)`,
        ConversionErrorCode.FILE_TOO_LARGE
      ).setContext({
        fileSize,
        maxSize,
        filePath,
      });
    }

    return fileSize;
  } catch (error) {
    if (error instanceof ConversionError) {
      throw error;
    }

    if ((error as any).code === "ENOENT") {
      throw new ConversionError(
        `文件不存在: ${filePath}`,
        ConversionErrorCode.FILE_NOT_FOUND
      );
    }

    throw new ConversionError(
      `文件大小验证失败: ${
        error instanceof Error ? error.message : String(error)
      }`,
      ConversionErrorCode.INVALID_INPUT,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * 检查文件是否存在
 *
 * @param filePath - 文件路径
 * @returns 文件是否存在
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * 检查文件是否可读
 *
 * @param filePath - 文件路径
 * @returns 文件是否可读
 */
export async function isReadable(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * 检查文件是否可写
 *
 * @param filePath - 文件路径
 * @returns 文件是否可写
 */
export async function isWritable(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取文件扩展名
 *
 * @param filePath - 文件路径
 * @returns 小写的扩展名（包含点号）
 */
export function getExtension(filePath: string): string {
  const parts = filePath.split(".");
  if (parts.length < 2) return "";
  return `.${parts[parts.length - 1].toLowerCase()}`;
}

/**
 * 验证文件格式
 *
 * @param filePath - 文件路径
 * @param allowedExtensions - 允许的扩展名列表
 * @returns 验证结果
 */
export async function validateFile(
  filePath: string,
  allowedExtensions: string[]
): Promise<FileValidationResult> {
  try {
    // 检查文件是否存在
    if (!(await fileExists(filePath))) {
      return {
        valid: false,
        error: `文件不存在: ${filePath}`,
      };
    }

    // 检查文件扩展名
    const extension = getExtension(filePath);
    if (!allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `不支持的文件格式: ${extension} (支持: ${allowedExtensions.join(
          ", "
        )})`,
      };
    }

    // 获取文件信息
    const stats = await stat(filePath);
    const fileSize = stats.size;

    // 检查文件大小
    if (fileSize > MAX_FILE_SIZE) {
      const sizeMB = (fileSize / (1024 * 1024)).toFixed(2);
      const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(2);
      return {
        valid: false,
        error: `文件大小超出限制: ${sizeMB}MB (限制: ${maxSizeMB}MB)`,
        fileInfo: {
          size: fileSize,
          extension,
        },
      };
    }

    return {
      valid: true,
      fileInfo: {
        size: fileSize,
        extension,
      },
    };
  } catch (error) {
    return {
      valid: false,
      error: `文件验证失败: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

/**
 * 清理目录
 *
 * 递归删除目录及其内容
 *
 * @param dirPath - 目录路径
 * @param options - 清理选项
 */
export async function cleanDirectory(
  dirPath: string,
  options: {
    recursive?: boolean;
    force?: boolean;
    onlyContents?: boolean;
  } = {}
): Promise<void> {
  const { recursive = true, force = true, onlyContents = false } = options;

  try {
    // 验证路径
    const validatedPath = await validatePath(dirPath);

    // 检查目录是否存在
    if (!(await fileExists(validatedPath))) {
      console.error(`[FileUtils] 目录不存在，跳过清理: ${validatedPath}`);
      return;
    }

    // 检查是否为目录
    const stats = await stat(validatedPath);
    if (!stats.isDirectory()) {
      throw new ConversionError(
        `路径不是目录: ${validatedPath}`,
        ConversionErrorCode.INVALID_INPUT
      );
    }

    if (onlyContents) {
      // 只删除目录内容，保留目录本身
      const entries = await readdir(validatedPath);
      for (const entry of entries) {
        const entryPath = join(validatedPath, entry);
        await rm(entryPath, { recursive, force });
      }
      console.error(`[FileUtils] 已清理目录内容: ${validatedPath}`);
    } else {
      // 删除整个目录
      await rm(validatedPath, { recursive, force });
      console.error(`[FileUtils] 已删除目录: ${validatedPath}`);
    }
  } catch (error) {
    if (error instanceof ConversionError) {
      throw error;
    }

    throw new ConversionError(
      `目录清理失败: ${error instanceof Error ? error.message : String(error)}`,
      ConversionErrorCode.TEMP_CLEANUP_FAILED,
      error instanceof Error ? error : undefined
    ).setContext({ dirPath });
  }
}

/**
 * 简单的 ZIP 文件解压
 *
 * 注意：这是一个简化版本，仅支持基本的 ZIP 文件
 * 对于复杂的 ZIP 文件，建议使用专门的库如 adm-zip
 *
 * @param zipPath - ZIP 文件路径
 * @param outputDir - 输出目录
 * @throws ConversionError - 当解压失败时
 */
export async function extractZip(
  zipPath: string,
  outputDir: string
): Promise<void> {
  try {
    console.error(`[FileUtils] 解压 ZIP: ${zipPath} -> ${outputDir}`);

    // 验证 ZIP 文件存在
    if (!(await fileExists(zipPath))) {
      throw new ConversionError(
        `ZIP 文件不存在: ${zipPath}`,
        ConversionErrorCode.FILE_NOT_FOUND
      );
    }

    // 注意：Node.js 原生不支持 ZIP 解压
    // 这里我们抛出一个错误，提示需要安装额外的依赖
    // 在实际实现中，应该使用 adm-zip 或其他 ZIP 库

    throw new ConversionError(
      "ZIP 解压功能需要安装 adm-zip 依赖。请在 API 模式下使用此功能。",
      ConversionErrorCode.UNSUPPORTED_FORMAT
    ).setContext({
      zipPath,
      outputDir,
      suggestion: "npm install adm-zip",
    });
  } catch (error) {
    if (error instanceof ConversionError) {
      throw error;
    }

    throw new ConversionError(
      `ZIP 解压失败: ${error instanceof Error ? error.message : String(error)}`,
      ConversionErrorCode.UNKNOWN_ERROR,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * 获取目录中的所有文件
 *
 * @param dirPath - 目录路径
 * @param options - 选项
 * @returns 文件路径列表
 */
export async function getFilesInDirectory(
  dirPath: string,
  options: {
    recursive?: boolean;
    extensions?: string[];
  } = {}
): Promise<string[]> {
  const { recursive = false, extensions } = options;
  const files: string[] = [];

  try {
    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (recursive) {
          const subFiles = await getFilesInDirectory(fullPath, options);
          files.push(...subFiles);
        }
      } else if (entry.isFile()) {
        // 如果指定了扩展名过滤，则检查
        if (extensions && extensions.length > 0) {
          const ext = getExtension(entry.name);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        } else {
          files.push(fullPath);
        }
      }
    }

    return files;
  } catch (error) {
    throw new ConversionError(
      `读取目录失败: ${error instanceof Error ? error.message : String(error)}`,
      ConversionErrorCode.INVALID_INPUT,
      error instanceof Error ? error : undefined
    ).setContext({ dirPath });
  }
}

/**
 * 复制文件
 *
 * @param sourcePath - 源文件路径
 * @param destPath - 目标文件路径
 */
export async function copyFile(
  sourcePath: string,
  destPath: string
): Promise<void> {
  try {
    // 验证源文件存在
    if (!(await fileExists(sourcePath))) {
      throw new ConversionError(
        `源文件不存在: ${sourcePath}`,
        ConversionErrorCode.FILE_NOT_FOUND
      );
    }

    // 使用流复制文件（更高效）
    const readStream = createReadStream(sourcePath);
    const writeStream = createWriteStream(destPath);

    await pipeline(readStream, writeStream);

    console.error(`[FileUtils] 文件已复制: ${sourcePath} -> ${destPath}`);
  } catch (error) {
    throw new ConversionError(
      `文件复制失败: ${error instanceof Error ? error.message : String(error)}`,
      ConversionErrorCode.OUTPUT_FILE_CREATION_FAILED,
      error instanceof Error ? error : undefined
    ).setContext({ sourcePath, destPath });
  }
}

/**
 * 读取文件内容（文本）
 *
 * @param filePath - 文件路径
 * @param encoding - 编码格式
 * @returns 文件内容
 */
export async function readTextFile(
  filePath: string,
  encoding: BufferEncoding = "utf-8"
): Promise<string> {
  try {
    const content = await readFile(filePath, encoding);
    return content;
  } catch (error) {
    if ((error as any).code === "ENOENT") {
      throw new ConversionError(
        `文件不存在: ${filePath}`,
        ConversionErrorCode.FILE_NOT_FOUND
      );
    }

    throw new ConversionError(
      `读取文件失败: ${error instanceof Error ? error.message : String(error)}`,
      ConversionErrorCode.INVALID_INPUT,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * 写入文件内容（文本）
 *
 * @param filePath - 文件路径
 * @param content - 文件内容
 * @param encoding - 编码格式
 */
export async function writeTextFile(
  filePath: string,
  content: string,
  encoding: BufferEncoding = "utf-8"
): Promise<void> {
  try {
    await writeFile(filePath, content, encoding);
    console.error(`[FileUtils] 文件已写入: ${filePath}`);
  } catch (error) {
    throw new ConversionError(
      `写入文件失败: ${error instanceof Error ? error.message : String(error)}`,
      ConversionErrorCode.OUTPUT_FILE_CREATION_FAILED,
      error instanceof Error ? error : undefined
    ).setContext({ filePath });
  }
}

/**
 * 确保目录存在
 *
 * 如果目录不存在，则创建（包括父目录）
 *
 * @param dirPath - 目录路径
 */
export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    if (!(await fileExists(dirPath))) {
      const { mkdir } = await import("fs/promises");
      await mkdir(dirPath, { recursive: true });
      console.error(`[FileUtils] 目录已创建: ${dirPath}`);
    }
  } catch (error) {
    throw new ConversionError(
      `创建目录失败: ${error instanceof Error ? error.message : String(error)}`,
      ConversionErrorCode.OUTPUT_FILE_CREATION_FAILED,
      error instanceof Error ? error : undefined
    ).setContext({ dirPath });
  }
}

/**
 * 获取临时目录路径
 *
 * @param basePath - 基准路径
 * @param identifier - 标识符（如文件名）
 * @returns 临时目录路径
 */
export function getTempDirectory(basePath: string, identifier: string): string {
  // 移除不安全的字符
  const safeIdentifier = identifier
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .substring(0, 100);

  return join(basePath, ".temp", safeIdentifier);
}

/**
 * 清理临时文件
 *
 * 清理所有临时文件和目录
 *
 * @param basePath - 基准路径
 * @param olderThan - 只清理早于指定时间的文件（毫秒），可选
 */
export async function cleanupTempFiles(
  basePath: string,
  olderThan?: number
): Promise<void> {
  const tempDir = join(basePath, ".temp");

  try {
    if (!(await fileExists(tempDir))) {
      return;
    }

    const entries = await readdir(tempDir, { withFileTypes: true });
    let cleanedCount = 0;

    for (const entry of entries) {
      const fullPath = join(tempDir, entry.name);

      try {
        // 如果指定了时间限制，检查文件修改时间
        if (olderThan) {
          const stats = await stat(fullPath);
          const age = Date.now() - stats.mtimeMs;

          if (age < olderThan) {
            continue; // 跳过新文件
          }
        }

        await rm(fullPath, { recursive: true, force: true });
        cleanedCount++;
      } catch (error) {
        console.error(
          `[FileUtils] 清理临时文件失败: ${fullPath}`,
          error instanceof Error ? error.message : String(error)
        );
        // 继续清理其他文件
      }
    }

    if (cleanedCount > 0) {
      console.error(`[FileUtils] 已清理 ${cleanedCount} 个临时文件/目录`);
    }
  } catch (error) {
    console.error(
      `[FileUtils] 临时文件清理失败:`,
      error instanceof Error ? error.message : String(error)
    );
    // 不抛出错误，因为临时文件清理失败不应该影响主流程
  }
}
