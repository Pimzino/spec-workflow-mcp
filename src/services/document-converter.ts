/**
 * 文档转换服务
 *
 * 协调转换策略和配置，提供统一的文档转换接口
 * 支持 Pandoc 本地转换和 API 远程转换的自动降级
 */

import {
  ConversionType,
  ConversionConfig,
  ConversionOptions,
  ConversionResult,
  ConversionError,
  ConversionErrorCode,
} from "../types/converter-types.js";
import {
  IConversionStrategy,
  StrategyRegistry,
} from "./strategies/conversion-strategy.js";
import { Word2MdStrategy } from "./strategies/word2md-strategy.js";
import { Md2WordStrategy } from "./strategies/md2word-strategy.js";
import { PandocExecutor } from "../utils/pandoc-executor.js";

/**
 * 文档转换服务类
 *
 * 负责协调转换策略、配置管理和降级逻辑
 */
export class DocumentConverter {
  private config: ConversionConfig;
  private strategies: StrategyRegistry;
  private pandocExecutor: PandocExecutor;

  /**
   * 构造函数
   *
   * @param config - 转换器配置
   */
  constructor(config: ConversionConfig) {
    this.config = config;
    this.pandocExecutor = new PandocExecutor(config.pandocPath || "pandoc");
    this.strategies = new Map();

    // 注册内置策略
    this.registerStrategies();
  }

  /**
   * 执行文档转换
   *
   * @param type - 转换类型
   * @param inputPath - 输入文件路径
   * @param outputPath - 输出文件路径
   * @param options - 转换选项
   * @returns 转换结果
   */
  async convert(
    type: ConversionType,
    inputPath: string,
    outputPath: string,
    options?: ConversionOptions
  ): Promise<ConversionResult> {
    console.error(`[DocumentConverter] 开始转换: ${type}`);
    console.error(`  输入: ${inputPath}`);
    console.error(`  输出: ${outputPath}`);

    try {
      // 获取对应的转换策略
      const strategy = this.getStrategy(type);

      // 判断使用 Pandoc 还是 API
      const usePandoc = await this.shouldUsePandoc(options);

      if (usePandoc) {
        console.error("[DocumentConverter] 使用 Pandoc 本地转换");
        return await strategy.convertWithPandoc(
          inputPath,
          outputPath,
          options,
          this.config.pandocPath
        );
      } else {
        console.error("[DocumentConverter] 使用 API 远程转换");

        // 检查是否配置了 API URL
        if (!this.config.converterApiUrl) {
          throw new ConversionError(
            "Pandoc 不可用且未配置 API URL",
            ConversionErrorCode.API_NOT_AVAILABLE
          ).setContext({
            suggestion: "请安装 Pandoc 或配置 converterApiUrl",
          });
        }

        return await strategy.convertWithApi(
          inputPath,
          outputPath,
          options,
          this.config.converterApiUrl,
          this.config.apiTimeout
        );
      }
    } catch (error) {
      if (error instanceof ConversionError) {
        console.error(`[DocumentConverter] 转换失败: ${error.message}`);
        throw error;
      }

      console.error("[DocumentConverter] 转换异常:", error);
      throw new ConversionError(
        `文档转换失败: ${
          error instanceof Error ? error.message : String(error)
        }`,
        ConversionErrorCode.UNKNOWN_ERROR,
        error instanceof Error ? error : undefined
      ).setContext({
        type,
        inputPath,
        outputPath,
      });
    }
  }

  /**
   * 判断是否应该使用 Pandoc
   *
   * 配置优先级：
   * 1. 选项中明确指定 forcePandoc 或 forceApi
   * 2. 检查 Pandoc 是否可用
   * 3. 检查是否配置了 API URL
   *
   * @param options - 转换选项
   * @returns 是否使用 Pandoc
   * @private
   */
  private async shouldUsePandoc(options?: ConversionOptions): Promise<boolean> {
    // 如果强制使用 API
    if (options?.forceApi) {
      console.error("[DocumentConverter] 选项强制使用 API (forceApi=true)");
      return false;
    }

    // 如果强制使用 Pandoc
    if (options?.forcePandoc) {
      console.error(
        "[DocumentConverter] 选项强制使用 Pandoc (forcePandoc=true)"
      );
      const available = await this.pandocExecutor.checkAvailability();
      if (!available) {
        throw new ConversionError(
          "强制使用 Pandoc 但 Pandoc 不可用",
          ConversionErrorCode.PANDOC_NOT_AVAILABLE
        ).setContext({
          pandocPath: this.config.pandocPath || "pandoc",
        });
      }
      return true;
    }

    // 检查 Pandoc 可用性
    const pandocAvailable = await this.pandocExecutor.checkAvailability();

    if (pandocAvailable) {
      console.error("[DocumentConverter] Pandoc 可用，优先使用本地转换");
      return true;
    }

    // Pandoc 不可用，检查是否有 API 配置
    if (this.config.converterApiUrl) {
      console.error("[DocumentConverter] Pandoc 不可用，降级到 API 转换");
      return false;
    }

    // 既没有 Pandoc 也没有 API
    throw new ConversionError(
      "Pandoc 不可用且未配置 API URL",
      ConversionErrorCode.PANDOC_NOT_AVAILABLE
    ).setContext({
      pandocPath: this.config.pandocPath || "pandoc",
      converterApiUrl: this.config.converterApiUrl,
      suggestion:
        "请安装 Pandoc (https://pandoc.org/installing.html) 或配置 converterApiUrl",
    });
  }

  /**
   * 获取转换策略
   *
   * @param type - 转换类型
   * @returns 转换策略实例
   * @throws ConversionError - 当找不到对应策略时
   * @private
   */
  private getStrategy(type: ConversionType): IConversionStrategy {
    const strategyFactory = this.strategies.get(type);

    if (!strategyFactory) {
      throw new ConversionError(
        `不支持的转换类型: ${type}`,
        ConversionErrorCode.UNSUPPORTED_FORMAT
      ).setContext({
        type,
        supportedTypes: Array.from(this.strategies.keys()),
      });
    }

    return strategyFactory();
  }

  /**
   * 注册内置转换策略
   *
   * @private
   */
  private registerStrategies(): void {
    // 注册 Word2Md 策略
    this.strategies.set(ConversionType.WORD_TO_MD, () => new Word2MdStrategy());

    // 注册 Md2Word 策略
    this.strategies.set(ConversionType.MD_TO_WORD, () => new Md2WordStrategy());

    console.error(
      `[DocumentConverter] 已注册 ${this.strategies.size} 个转换策略`
    );
  }

  /**
   * 注册自定义转换策略
   *
   * @param type - 转换类型
   * @param strategyFactory - 策略工厂函数
   */
  registerStrategy(
    type: string,
    strategyFactory: () => IConversionStrategy
  ): void {
    this.strategies.set(type, strategyFactory);
    console.error(`[DocumentConverter] 注册自定义策略: ${type}`);
  }

  /**
   * 检查是否支持某种转换类型
   *
   * @param type - 转换类型
   * @returns 是否支持
   */
  supportsType(type: string): boolean {
    return this.strategies.has(type);
  }

  /**
   * 获取所有支持的转换类型
   *
   * @returns 转换类型列表
   */
  getSupportedTypes(): string[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * 更新配置
   *
   * @param config - 新的配置（部分）
   */
  updateConfig(config: Partial<ConversionConfig>): void {
    this.config = { ...this.config, ...config };

    // 如果更新了 Pandoc 路径，重新创建执行器
    if (config.pandocPath) {
      this.pandocExecutor = new PandocExecutor(config.pandocPath);
      console.error(
        `[DocumentConverter] Pandoc 路径已更新: ${config.pandocPath}`
      );
    }
  }

  /**
   * 获取当前配置
   *
   * @returns 配置副本
   */
  getConfig(): Readonly<ConversionConfig> {
    return { ...this.config };
  }

  /**
   * 检查 Pandoc 是否可用
   *
   * @returns Pandoc 是否可用
   */
  async checkPandocAvailability(): Promise<boolean> {
    return await this.pandocExecutor.checkAvailability();
  }

  /**
   * 获取 Pandoc 版本信息
   *
   * @returns Pandoc 版本字符串，如果不可用则返回 null
   */
  async getPandocVersion(): Promise<string | null> {
    return await this.pandocExecutor.getVersion();
  }

  /**
   * 检查 API 是否可用
   *
   * @returns API 是否可用
   */
  async checkApiAvailability(): Promise<boolean> {
    if (!this.config.converterApiUrl) {
      return false;
    }

    try {
      // 发送健康检查请求
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        this.config.apiTimeout || 5000
      );

      const response = await fetch(this.config.converterApiUrl + "/health", {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeout);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * 获取转换器状态信息
   *
   * @returns 状态信息
   */
  async getStatus(): Promise<{
    pandoc: {
      available: boolean;
      version: string | null;
      path: string;
    };
    api: {
      available: boolean;
      url: string | null;
    };
    supportedTypes: string[];
  }> {
    const pandocAvailable = await this.checkPandocAvailability();
    const pandocVersion = pandocAvailable
      ? await this.getPandocVersion()
      : null;
    const apiAvailable = await this.checkApiAvailability();

    return {
      pandoc: {
        available: pandocAvailable,
        version: pandocVersion,
        path: this.config.pandocPath || "pandoc",
      },
      api: {
        available: apiAvailable,
        url: this.config.converterApiUrl || null,
      },
      supportedTypes: this.getSupportedTypes(),
    };
  }
}

/**
 * 创建文档转换服务实例
 *
 * @param config - 转换器配置
 * @returns DocumentConverter 实例
 */
export function createDocumentConverter(
  config: ConversionConfig
): DocumentConverter {
  return new DocumentConverter(config);
}
