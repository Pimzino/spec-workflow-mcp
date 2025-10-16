/**
 * 转换策略接口
 *
 * 定义文档转换策略的统一契约，遵循策略模式设计
 * 支持 Pandoc 本地转换和 API 远程转换两种实现方式
 */

import {
  ConversionResult,
  ConversionOptions,
} from "../../types/converter-types.js";

/**
 * 转换策略接口
 *
 * 所有具体的转换策略（如 Word2Md, Md2Word）都应实现此接口
 * 这样可以确保策略的可互换性和一致性
 *
 * @example
 * ```typescript
 * class Word2MdStrategy implements IConversionStrategy {
 *   async convertWithPandoc(inputPath, outputPath, options) {
 *     // 实现 Pandoc 转换逻辑
 *   }
 *
 *   async convertWithApi(inputPath, outputPath, options) {
 *     // 实现 API 转换逻辑
 *   }
 * }
 * ```
 */
export interface IConversionStrategy {
  /**
   * 使用 Pandoc 进行本地转换
   *
   * 此方法应该：
   * 1. 构建适当的 Pandoc 命令参数
   * 2. 调用 PandocExecutor 执行命令
   * 3. 验证输出文件的生成
   * 4. 返回详细的转换结果
   *
   * @param inputPath - 输入文件的完整路径
   * @param outputPath - 输出文件的完整路径
   * @param options - 转换选项配置
   * @param pandocPath - Pandoc 可执行文件路径（可选）
   * @returns Promise<ConversionResult> - 转换结果，包含成功状态、输出路径等信息
   *
   * @throws ConversionError - 当转换过程中发生错误时
   *
   * @remarks
   * - 应该处理临时文件的创建和清理
   * - 对于 word2md，需要提取媒体文件到指定目录
   * - 对于 md2word，应保持 Markdown 格式的完整性
   *
   * @example
   * ```typescript
   * const result = await strategy.convertWithPandoc(
   *   '/path/to/input.docx',
   *   '/path/to/output.md',
   *   { extractMedia: true, mediaDir: 'media' },
   *   '/usr/local/bin/pandoc'
   * );
   * ```
   */
  convertWithPandoc(
    inputPath: string,
    outputPath: string,
    options?: ConversionOptions,
    pandocPath?: string
  ): Promise<ConversionResult>;

  /**
   * 使用远程 API 进行转换
   *
   * 此方法应该：
   * 1. 读取输入文件内容
   * 2. 构建 API 请求（可能需要 Base64 编码）
   * 3. 发送 HTTP 请求到转换 API
   * 4. 处理 API 响应（可能是 ZIP 文件或单个文件）
   * 5. 保存转换结果到输出路径
   * 6. 返回详细的转换结果
   *
   * @param inputPath - 输入文件的完整路径
   * @param outputPath - 输出文件的完整路径
   * @param options - 转换选项配置
   * @param apiUrl - 转换 API 的完整 URL
   * @param apiTimeout - API 请求超时时间（毫秒）
   * @returns Promise<ConversionResult> - 转换结果，包含成功状态、输出路径等信息
   *
   * @throws ConversionError - 当转换过程中发生错误时
   *
   * @remarks
   * - 应该实现适当的超时机制
   * - 对于大文件，考虑分块上传或流式处理
   * - word2md 可能返回 ZIP 包，需要解压处理
   * - md2word 通常返回单个 DOCX 文件
   * - 应该验证 API 响应的有效性
   *
   * @example
   * ```typescript
   * const result = await strategy.convertWithApi(
   *   '/path/to/input.docx',
   *   '/path/to/output.md',
   *   { extractMedia: true },
   *   'https://api.example.com/convert/word2md',
   *   30000
   * );
   * ```
   */
  convertWithApi(
    inputPath: string,
    outputPath: string,
    options: ConversionOptions | undefined,
    apiUrl: string,
    apiTimeout?: number
  ): Promise<ConversionResult>;
}

/**
 * 策略工厂函数类型
 *
 * 用于创建特定类型的转换策略实例
 */
export type StrategyFactory = () => IConversionStrategy;

/**
 * 策略注册表类型
 *
 * 将转换类型映射到对应的策略工厂函数
 */
export type StrategyRegistry = Map<string, StrategyFactory>;
