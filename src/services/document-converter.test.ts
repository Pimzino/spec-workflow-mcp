/**
 * DocumentConverter 单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  DocumentConverter,
  createDocumentConverter,
} from "./document-converter.js";
import {
  ConversionType,
  ConversionError,
  ConversionErrorCode,
} from "../types/converter-types.js";
import type { ConversionConfig } from "../types/converter-types.js";

describe("DocumentConverter", () => {
  let converter: DocumentConverter;
  let mockConfig: ConversionConfig;

  beforeEach(() => {
    mockConfig = {
      pandocPath: "pandoc",
      tempDir: "/tmp/test",
      cleanTempFiles: true,
    };

    converter = new DocumentConverter(mockConfig);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("构造函数", () => {
    it("应该创建 DocumentConverter 实例", () => {
      expect(converter).toBeInstanceOf(DocumentConverter);
    });

    it("应该接受完整配置", () => {
      const config: ConversionConfig = {
        pandocPath: "/custom/pandoc",
        converterApiUrl: "https://api.example.com",
        apiTimeout: 60000,
        tempDir: "/custom/temp",
        cleanTempFiles: false,
      };

      const customConverter = new DocumentConverter(config);
      expect(customConverter).toBeInstanceOf(DocumentConverter);
    });

    it("应该使用默认配置", () => {
      const defaultConverter = new DocumentConverter({});
      expect(defaultConverter).toBeInstanceOf(DocumentConverter);
    });
  });

  describe("convert", () => {
    it("应该成功转换 Word 到 Markdown", async () => {
      // Mock strategy
      const mockStrategy = {
        convertWithPandoc: vi.fn().mockResolvedValue({
          success: true,
          outputPath: "/output.md",
          method: "pandoc",
          message: "Conversion successful",
        }),
        convertWithApi: vi.fn(),
      };

      // Replace strategy
      (converter as any).strategies.set(
        ConversionType.WORD_TO_MD,
        mockStrategy
      );

      const result = await converter.convert(
        ConversionType.WORD_TO_MD,
        "/input.docx",
        "/output.md"
      );

      expect(result.success).toBe(true);
      expect(result.method).toBe("pandoc");
      expect(mockStrategy.convertWithPandoc).toHaveBeenCalled();
    });

    it("应该成功转换 Markdown 到 Word", async () => {
      const mockStrategy = {
        convertWithPandoc: vi.fn().mockResolvedValue({
          success: true,
          outputPath: "/output.docx",
          method: "pandoc",
          message: "Conversion successful",
        }),
        convertWithApi: vi.fn(),
      };

      (converter as any).strategies.set(
        ConversionType.MD_TO_WORD,
        mockStrategy
      );

      const result = await converter.convert(
        ConversionType.MD_TO_WORD,
        "/input.md",
        "/output.docx"
      );

      expect(result.success).toBe(true);
      expect(result.method).toBe("pandoc");
      expect(mockStrategy.convertWithPandoc).toHaveBeenCalled();
    });

    it("应该在强制使用 Pandoc 时仅使用 Pandoc", async () => {
      const mockStrategy = {
        convertWithPandoc: vi.fn().mockResolvedValue({
          success: true,
          outputPath: "/output.md",
          method: "pandoc",
          message: "Conversion successful",
        }),
        convertWithApi: vi.fn(),
      };

      (converter as any).strategies.set(
        ConversionType.WORD_TO_MD,
        mockStrategy
      );

      await converter.convert(
        ConversionType.WORD_TO_MD,
        "/input.docx",
        "/output.md",
        { forcePandoc: true }
      );

      expect(mockStrategy.convertWithPandoc).toHaveBeenCalled();
      expect(mockStrategy.convertWithApi).not.toHaveBeenCalled();
    });

    it("应该在强制使用 API 时仅使用 API", async () => {
      const mockStrategy = {
        convertWithPandoc: vi.fn(),
        convertWithApi: vi.fn().mockResolvedValue({
          success: true,
          outputPath: "/output.md",
          method: "api",
          message: "Conversion successful",
        }),
      };

      (converter as any).strategies.set(
        ConversionType.WORD_TO_MD,
        mockStrategy
      );

      await converter.convert(
        ConversionType.WORD_TO_MD,
        "/input.docx",
        "/output.md",
        { forceApi: true }
      );

      expect(mockStrategy.convertWithApi).toHaveBeenCalled();
      expect(mockStrategy.convertWithPandoc).not.toHaveBeenCalled();
    });

    it("应该在 Pandoc 失败时自动降级到 API", async () => {
      const mockStrategy = {
        convertWithPandoc: vi
          .fn()
          .mockRejectedValue(
            new ConversionError(
              "Pandoc not available",
              ConversionErrorCode.PANDOC_NOT_AVAILABLE
            )
          ),
        convertWithApi: vi.fn().mockResolvedValue({
          success: true,
          outputPath: "/output.md",
          method: "api",
          message: "Conversion successful via API",
        }),
      };

      (converter as any).strategies.set(
        ConversionType.WORD_TO_MD,
        mockStrategy
      );

      const result = await converter.convert(
        ConversionType.WORD_TO_MD,
        "/input.docx",
        "/output.md"
      );

      expect(result.success).toBe(true);
      expect(result.method).toBe("api");
      expect(mockStrategy.convertWithPandoc).toHaveBeenCalled();
      expect(mockStrategy.convertWithApi).toHaveBeenCalled();
    });

    it("应该在所有方法失败时抛出错误", async () => {
      const mockStrategy = {
        convertWithPandoc: vi
          .fn()
          .mockRejectedValue(
            new ConversionError(
              "Pandoc failed",
              ConversionErrorCode.PANDOC_EXECUTION_FAILED
            )
          ),
        convertWithApi: vi
          .fn()
          .mockRejectedValue(
            new ConversionError(
              "API failed",
              ConversionErrorCode.API_REQUEST_FAILED
            )
          ),
      };

      (converter as any).strategies.set(
        ConversionType.WORD_TO_MD,
        mockStrategy
      );

      await expect(
        converter.convert(
          ConversionType.WORD_TO_MD,
          "/input.docx",
          "/output.md"
        )
      ).rejects.toThrow(ConversionError);
    });

    it("应该在不支持的转换类型时抛出错误", async () => {
      await expect(
        converter.convert("invalid-type" as any, "/input.file", "/output.file")
      ).rejects.toMatchObject({
        code: ConversionErrorCode.UNSUPPORTED_FORMAT,
      });
    });

    it("应该传递转换选项到策略", async () => {
      const mockStrategy = {
        convertWithPandoc: vi.fn().mockResolvedValue({
          success: true,
          outputPath: "/output.md",
          method: "pandoc",
          message: "Conversion successful",
        }),
        convertWithApi: vi.fn(),
      };

      (converter as any).strategies.set(
        ConversionType.WORD_TO_MD,
        mockStrategy
      );

      const options = {
        extractMedia: true,
        mediaDirName: "images",
        customPandocArgs: ["--toc"],
      };

      await converter.convert(
        ConversionType.WORD_TO_MD,
        "/input.docx",
        "/output.md",
        options
      );

      expect(mockStrategy.convertWithPandoc).toHaveBeenCalledWith(
        expect.objectContaining({
          inputPath: "/input.docx",
          outputPath: "/output.md",
        }),
        options
      );
    });
  });

  describe("canUsePandoc", () => {
    it("应该在 Pandoc 可用时返回 true", async () => {
      vi.spyOn(converter as any, "checkPandocAvailability").mockResolvedValue(
        true
      );

      const result = await converter.canUsePandoc();
      expect(result).toBe(true);
    });

    it("应该在 Pandoc 不可用时返回 false", async () => {
      vi.spyOn(converter as any, "checkPandocAvailability").mockResolvedValue(
        false
      );

      const result = await converter.canUsePandoc();
      expect(result).toBe(false);
    });

    it("应该缓存检查结果", async () => {
      const checkSpy = vi
        .spyOn(converter as any, "checkPandocAvailability")
        .mockResolvedValue(true);

      await converter.canUsePandoc();
      await converter.canUsePandoc();

      // 应该只调用一次
      expect(checkSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("canUseApi", () => {
    it("应该在 API 已配置时返回 true", () => {
      const converterWithApi = new DocumentConverter({
        ...mockConfig,
        converterApiUrl: "https://api.example.com",
      });

      expect(converterWithApi.canUseApi()).toBe(true);
    });

    it("应该在 API 未配置时返回 false", () => {
      expect(converter.canUseApi()).toBe(false);
    });
  });

  describe("getAvailableMethods", () => {
    it("应该返回 Pandoc 和 API 都可用", async () => {
      const converterWithApi = new DocumentConverter({
        ...mockConfig,
        converterApiUrl: "https://api.example.com",
      });

      vi.spyOn(
        converterWithApi as any,
        "checkPandocAvailability"
      ).mockResolvedValue(true);

      const methods = await converterWithApi.getAvailableMethods();
      expect(methods).toContain("pandoc");
      expect(methods).toContain("api");
    });

    it("应该返回仅 Pandoc 可用", async () => {
      vi.spyOn(converter as any, "checkPandocAvailability").mockResolvedValue(
        true
      );

      const methods = await converter.getAvailableMethods();
      expect(methods).toContain("pandoc");
      expect(methods).not.toContain("api");
    });

    it("应该返回仅 API 可用", async () => {
      const converterWithApi = new DocumentConverter({
        ...mockConfig,
        converterApiUrl: "https://api.example.com",
      });

      vi.spyOn(
        converterWithApi as any,
        "checkPandocAvailability"
      ).mockResolvedValue(false);

      const methods = await converterWithApi.getAvailableMethods();
      expect(methods).not.toContain("pandoc");
      expect(methods).toContain("api");
    });

    it("应该返回空数组当都不可用", async () => {
      vi.spyOn(converter as any, "checkPandocAvailability").mockResolvedValue(
        false
      );

      const methods = await converter.getAvailableMethods();
      expect(methods).toEqual([]);
    });
  });

  describe("getSupportedFormats", () => {
    it("应该返回支持的格式列表", () => {
      const formats = converter.getSupportedFormats();
      expect(formats).toContain("word2md");
      expect(formats).toContain("md2word");
      expect(formats.length).toBe(2);
    });
  });

  describe("错误处理", () => {
    it("应该包装未知错误为 ConversionError", async () => {
      const mockStrategy = {
        convertWithPandoc: vi
          .fn()
          .mockRejectedValue(new Error("Unknown error")),
        convertWithApi: vi.fn().mockRejectedValue(new Error("Unknown error")),
      };

      (converter as any).strategies.set(
        ConversionType.WORD_TO_MD,
        mockStrategy
      );

      await expect(
        converter.convert(
          ConversionType.WORD_TO_MD,
          "/input.docx",
          "/output.md"
        )
      ).rejects.toThrow(ConversionError);
    });

    it("应该记录详细的错误日志", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const mockStrategy = {
        convertWithPandoc: vi
          .fn()
          .mockRejectedValue(
            new ConversionError(
              "Test error",
              ConversionErrorCode.PANDOC_EXECUTION_FAILED
            )
          ),
        convertWithApi: vi
          .fn()
          .mockRejectedValue(
            new ConversionError(
              "API error",
              ConversionErrorCode.API_REQUEST_FAILED
            )
          ),
      };

      (converter as any).strategies.set(
        ConversionType.WORD_TO_MD,
        mockStrategy
      );

      try {
        await converter.convert(
          ConversionType.WORD_TO_MD,
          "/input.docx",
          "/output.md"
        );
      } catch (error) {
        // Expected
      }

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe("createDocumentConverter", () => {
    it("应该创建默认转换器", () => {
      const conv = createDocumentConverter();
      expect(conv).toBeInstanceOf(DocumentConverter);
    });

    it("应该创建带配置的转换器", () => {
      const conv = createDocumentConverter({
        pandocPath: "/custom/pandoc",
        converterApiUrl: "https://api.example.com",
      });
      expect(conv).toBeInstanceOf(DocumentConverter);
    });
  });
});
