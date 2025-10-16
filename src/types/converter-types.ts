/**
 * 文档转换器类型定义
 *
 * 此文件定义了文档转换系统的所有 TypeScript 类型和接口，
 * 包括配置、结果、命令参数等核心数据结构。
 */

/**
 * 转换类型枚举
 *
 * 定义系统支持的文档转换类型
 */
export enum ConversionType {
  /** Word 文档转 Markdown */
  WORD_TO_MD = "word2md",
  /** Markdown 转 Word 文档 */
  MD_TO_WORD = "md2word",
}

/**
 * 转换器配置接口
 *
 * 定义文档转换器的全局配置选项
 */
export interface ConversionConfig {
  /**
   * Pandoc 可执行文件路径
   *
   * - 未指定时，系统将在 PATH 环境变量中查找
   * - 指定路径时，必须是有效的 Pandoc 可执行文件
   *
   * @example "/usr/local/bin/pandoc"
   * @example "C:\\Program Files\\Pandoc\\pandoc.exe"
   */
  pandocPath?: string;

  /**
   * 转换 API 服务地址
   *
   * 当本地 Pandoc 不可用时，作为降级方案使用的 API 服务
   *
   * @example "https://converter-api.example.com"
   */
  converterApiUrl?: string;

  /**
   * API 请求超时时间（毫秒）
   *
   * @default 30000 (30秒)
   */
  apiTimeout?: number;

  /**
   * 临时文件目录
   *
   * 用于存储转换过程中的临时文件
   *
   * @default ".temp"
   */
  tempDir: string;

  /**
   * 是否在转换后自动清理临时文件
   *
   * @default true
   */
  autoCleanup?: boolean;
}

/**
 * 转换选项接口
 *
 * 定义单次转换操作的特定选项
 */
export interface ConversionOptions {
  /**
   * 是否强制使用 Pandoc（即使 API 可用）
   *
   * @default false
   */
  forcePandoc?: boolean;

  /**
   * 是否强制使用 API（即使 Pandoc 可用）
   *
   * @default false
   */
  forceApi?: boolean;

  /**
   * 是否提取媒体文件到独立目录
   *
   * 仅适用于 word2md 转换
   *
   * @default true
   */
  extractMedia?: boolean;

  /**
   * 媒体文件输出目录名称
   *
   * 相对于输出目录的路径
   *
   * @default "media"
   */
  mediaDir?: string;

  /**
   * 自定义 Pandoc 参数
   *
   * 额外的 Pandoc 命令行参数
   */
  pandocArgs?: string[];

  /**
   * 是否保留临时文件（调试用）
   *
   * @default false
   */
  keepTemp?: boolean;
}

/**
 * 转换结果接口
 *
 * 描述文档转换操作的结果
 */
export interface ConversionResult {
  /**
   * 转换是否成功
   */
  success: boolean;

  /**
   * 输出文件的完整路径
   */
  outputPath: string;

  /**
   * 转换使用的方法
   */
  method: "pandoc" | "api";

  /**
   * 临时文件目录路径
   *
   * 仅在生成了临时文件时存在
   */
  tempPath?: string;

  /**
   * 提取的媒体文件路径列表
   *
   * 仅适用于 word2md 转换且 extractMedia 为 true
   */
  mediaFiles?: string[];

  /**
   * 结果消息
   *
   * 成功时为描述性信息，失败时为错误信息
   */
  message: string;

  /**
   * 错误对象
   *
   * 仅在转换失败时存在
   */
  error?: ConversionError;

  /**
   * 转换耗时（毫秒）
   */
  duration?: number;

  /**
   * 文件大小信息
   */
  fileSize?: {
    /** 输入文件大小（字节） */
    input: number;
    /** 输出文件大小（字节） */
    output: number;
  };
}

/**
 * 转换任务接口
 *
 * 描述一个完整的转换任务
 */
export interface ConversionTask {
  /**
   * 任务唯一标识
   */
  id: string;

  /**
   * 转换类型
   */
  type: ConversionType;

  /**
   * 输入文件路径
   */
  inputPath: string;

  /**
   * 输出文件路径
   */
  outputPath: string;

  /**
   * 转换选项
   */
  options?: ConversionOptions;

  /**
   * 任务状态
   */
  status: "pending" | "processing" | "completed" | "failed";

  /**
   * 创建时间
   */
  createdAt: Date;

  /**
   * 完成时间
   */
  completedAt?: Date;

  /**
   * 转换结果
   *
   * 仅在任务完成或失败后存在
   */
  result?: ConversionResult;
}

/**
 * Pandoc 命令接口
 *
 * 描述一个 Pandoc 命令的完整信息
 */
export interface PandocCommand {
  /**
   * Pandoc 可执行文件路径
   */
  executable: string;

  /**
   * 命令行参数列表
   */
  args: string[];

  /**
   * 工作目录
   */
  cwd?: string;

  /**
   * 环境变量
   */
  env?: Record<string, string>;

  /**
   * 命令超时时间（毫秒）
   *
   * @default 60000 (60秒)
   */
  timeout?: number;
}

/**
 * Pandoc 选项接口
 *
 * Pandoc 命令的通用选项
 */
export interface PandocOptions {
  /**
   * 输入格式
   *
   * @example "docx", "markdown", "gfm"
   */
  from?: string;

  /**
   * 输出格式
   *
   * @example "docx", "markdown", "gfm", "html"
   */
  to?: string;

  /**
   * 输出文件路径
   */
  output?: string;

  /**
   * 是否生成独立文档
   *
   * @default false
   */
  standalone?: boolean;

  /**
   * 媒体提取目录
   *
   * 用于 --extract-media 参数
   */
  extractMedia?: string;

  /**
   * 文本换行模式
   *
   * @default "none"
   */
  wrap?: "auto" | "none" | "preserve";

  /**
   * 是否使用 ATX 样式标题（# 格式）
   *
   * @default true
   */
  atxHeaders?: boolean;

  /**
   * 自定义模板文件路径
   */
  template?: string;

  /**
   * 元数据文件路径
   */
  metadata?: string;

  /**
   * 其他自定义参数
   */
  additionalArgs?: string[];
}

/**
 * Pandoc 执行结果接口
 */
export interface PandocExecutionResult {
  /**
   * 是否执行成功
   */
  success: boolean;

  /**
   * 标准输出内容
   */
  stdout: string;

  /**
   * 标准错误输出内容
   */
  stderr: string;

  /**
   * 退出代码
   */
  exitCode: number;

  /**
   * 执行耗时（毫秒）
   */
  duration: number;

  /**
   * 执行的完整命令
   */
  command: string;

  /**
   * 错误对象（如果失败）
   */
  error?: Error;
}

/**
 * 转换错误类
 *
 * 扩展标准 Error 类，添加转换特定的错误信息
 */
export class ConversionError extends Error {
  /**
   * 错误代码
   */
  code: ConversionErrorCode;

  /**
   * 原始错误对象
   */
  originalError?: Error;

  /**
   * 错误上下文信息
   */
  context?: Record<string, any>;

  constructor(
    message: string,
    code: ConversionErrorCode,
    originalError?: Error
  ) {
    super(message);
    this.name = "ConversionError";
    this.code = code;
    this.originalError = originalError;

    // 保持正确的堆栈跟踪（仅在 V8 引擎中可用）
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConversionError);
    }
  }

  /**
   * 设置错误上下文
   */
  setContext(context: Record<string, any>): this {
    this.context = context;
    return this;
  }

  /**
   * 转换为 JSON 格式
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      stack: this.stack,
      originalError: this.originalError
        ? {
            name: this.originalError.name,
            message: this.originalError.message,
          }
        : undefined,
    };
  }
}

/**
 * 转换错误代码枚举
 */
export enum ConversionErrorCode {
  /** 文件未找到 */
  FILE_NOT_FOUND = "FILE_NOT_FOUND",
  /** 文件大小超出限制 */
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  /** 不支持的文件格式 */
  UNSUPPORTED_FORMAT = "UNSUPPORTED_FORMAT",
  /** Pandoc 未安装或不可用 */
  PANDOC_NOT_AVAILABLE = "PANDOC_NOT_AVAILABLE",
  /** Pandoc 执行失败 */
  PANDOC_EXECUTION_FAILED = "PANDOC_EXECUTION_FAILED",
  /** API 服务不可用 */
  API_NOT_AVAILABLE = "API_NOT_AVAILABLE",
  /** API 请求失败 */
  API_REQUEST_FAILED = "API_REQUEST_FAILED",
  /** API 响应无效 */
  API_INVALID_RESPONSE = "API_INVALID_RESPONSE",
  /** 输出文件创建失败 */
  OUTPUT_FILE_CREATION_FAILED = "OUTPUT_FILE_CREATION_FAILED",
  /** 临时文件清理失败 */
  TEMP_CLEANUP_FAILED = "TEMP_CLEANUP_FAILED",
  /** 无效的配置 */
  INVALID_CONFIG = "INVALID_CONFIG",
  /** 无效的输入参数 */
  INVALID_INPUT = "INVALID_INPUT",
  /** 转换超时 */
  CONVERSION_TIMEOUT = "CONVERSION_TIMEOUT",
  /** 未知错误 */
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * API 转换请求接口
 *
 * 发送到转换 API 的请求格式
 */
export interface ApiConversionRequest {
  /**
   * 转换类型
   */
  type: ConversionType;

  /**
   * 文件内容（Base64 编码）
   */
  fileContent: string;

  /**
   * 原始文件名
   */
  fileName: string;

  /**
   * 转换选项
   */
  options?: {
    extractMedia?: boolean;
    pandocArgs?: string[];
  };
}

/**
 * API 转换响应接口
 *
 * 从转换 API 接收的响应格式
 */
export interface ApiConversionResponse {
  /**
   * 是否成功
   */
  success: boolean;

  /**
   * 输出文件内容（Base64 编码）或 ZIP 包
   */
  data: string;

  /**
   * 文件类型
   */
  contentType: "application/zip" | "application/octet-stream" | "text/markdown";

  /**
   * 消息
   */
  message?: string;

  /**
   * 错误信息
   */
  error?: string;
}

/**
 * 文件验证结果接口
 */
export interface FileValidationResult {
  /**
   * 是否有效
   */
  valid: boolean;

  /**
   * 错误消息（如果无效）
   */
  error?: string;

  /**
   * 文件信息
   */
  fileInfo?: {
    /** 文件大小（字节） */
    size: number;
    /** 文件扩展名 */
    extension: string;
    /** 文件 MIME 类型 */
    mimeType?: string;
  };
}

/**
 * 转换统计信息接口
 */
export interface ConversionStatistics {
  /**
   * 总转换次数
   */
  totalConversions: number;

  /**
   * 成功次数
   */
  successCount: number;

  /**
   * 失败次数
   */
  failureCount: number;

  /**
   * 使用 Pandoc 的次数
   */
  pandocCount: number;

  /**
   * 使用 API 的次数
   */
  apiCount: number;

  /**
   * 平均转换时间（毫秒）
   */
  averageDuration: number;

  /**
   * 各类型转换次数
   */
  byType: {
    [K in ConversionType]: number;
  };
}
