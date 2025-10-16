/**
 * Md2WordStrategy 单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Md2WordStrategy } from "./md2word-strategy.js";
import {
  ConversionError,
  ConversionErrorCode,
} from "../../types/converter-types.js";
import type { ConversionTask } from "../../types/converter-types.js";

describe("Md2WordStrategy", () => {
  let strategy: Md2WordStrategy;
  let mockExecutor: any;
  let mockConfig: any;

  beforeEach(() => {
    // Mock PandocExecutor
    mockExecutor = {
      checkAvailability: vi.fn().mockResolvedValue(true),
      execute: vi.fn().mockResolvedValue({
        success: true,
        stdout: "Conversion successful",
        stderr: "",
        duration: 500,
      }),
    };

    mockConfig = {
      pandocPath: "pandoc",
      tempDir: "/tmp/test",
      cleanTempFiles: true,
    };

    strategy = new Md2WordStrategy(mockExecutor, mockConfig);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("convertWithPandoc", () => {
    const mockTask: ConversionTask = {
      inputPath: "/path/to/input.md",
      outputPath: "/path/to/output.docx",
      type: "md2word" as any,
    };

    it("应该成功使用 Pandoc 转换 Markdown 文档", async () => {
      // Mock file operations
      vi.mock("../../utils/file-utils.js", () => ({
        validatePath: vi.fn().mockResolvedValue("/path/to/input.md"),
        validateFileSize: vi.fn().mockResolvedValue(undefined),
        ensureDirectoryExists: vi.fn().mockResolvedValue(undefined),
        fileExists: vi.fn().mockResolvedValue(true),
      }));

      const result = await strategy.convertWithPandoc(mockTask);

      expect(result.success).toBe(true);
      expect(result.method).toBe("pandoc");
      expect(result.outputPath).toBe(mockTask.outputPath);
      expect(mockExecutor.execute).toHaveBeenCalled();
    });

    it("应该在 Pandoc 不可用时抛出错误", async () => {
      mockExecutor.checkAvailability.mockResolvedValue(false);

      await expect(strategy.convertWithPandoc(mockTask)).rejects.toMatchObject({
        code: ConversionErrorCode.PANDOC_NOT_AVAILABLE,
      });
    });

    it("应该支持生成独立 Word 文档", async () => {
      vi.mock("../../utils/file-utils.js", () => ({
        validatePath: vi.fn().mockResolvedValue("/path/to/input.md"),
        validateFileSize: vi.fn().mockResolvedValue(undefined),
        ensureDirectoryExists: vi.fn().mockResolvedValue(undefined),
        fileExists: vi.fn().mockResolvedValue(true),
      }));

      const result = await strategy.convertWithPandoc(mockTask, {
        standalone: true,
      });

      expect(result.success).toBe(true);
      // 验证传给 Pandoc 的参数包含 --standalone
      const executeCall = mockExecutor.execute.mock.calls[0][0];
      expect(executeCall.args).toContain("--standalone");
    });

    it("应该支持自定义 Pandoc 参数", async () => {
      vi.mock("../../utils/file-utils.js", () => ({
        validatePath: vi.fn().mockResolvedValue("/path/to/input.md"),
        validateFileSize: vi.fn().mockResolvedValue(undefined),
        ensureDirectoryExists: vi.fn().mockResolvedValue(undefined),
        fileExists: vi.fn().mockResolvedValue(true),
      }));

      await strategy.convertWithPandoc(mockTask, {
        customPandocArgs: ["--reference-doc=template.docx"],
      });

      const executeCall = mockExecutor.execute.mock.calls[0][0];
      expect(executeCall.args).toContain("--reference-doc=template.docx");
    });

    it("应该在输入文件不存在时抛出错误", async () => {
      const errorTask: ConversionTask = {
        ...mockTask,
        inputPath: "/nonexistent/file.md",
      };

      await expect(strategy.convertWithPandoc(errorTask)).rejects.toThrow(
        ConversionError
      );
    });

    it("应该在 Pandoc 执行失败时抛出错误", async () => {
      mockExecutor.execute.mockRejectedValue(
        new ConversionError(
          "Pandoc execution failed",
          ConversionErrorCode.PANDOC_EXECUTION_FAILED
        )
      );

      await expect(strategy.convertWithPandoc(mockTask)).rejects.toMatchObject({
        code: ConversionErrorCode.PANDOC_EXECUTION_FAILED,
      });
    });
  });

  describe("convertWithApi", () => {
    const mockTask: ConversionTask = {
      inputPath: "/path/to/input.md",
      outputPath: "/path/to/output.docx",
      type: "md2word" as any,
    };

    it("应该在 API 未配置时抛出错误", async () => {
      await expect(strategy.convertWithApi(mockTask)).rejects.toMatchObject({
        code: ConversionErrorCode.API_NOT_AVAILABLE,
      });
    });

    it("应该成功使用 API 转换文档", async () => {
      const strategyWithApi = new Md2WordStrategy(mockExecutor, {
        ...mockConfig,
        converterApiUrl: "https://api.example.com/convert",
      });

      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(100)),
      }) as any;

      // Mock file operations
      vi.mock("../../utils/file-utils.js", () => ({
        readFileContent: vi.fn().mockResolvedValue("# Markdown content"),
        writeFileContent: vi.fn().mockResolvedValue(undefined),
        fileExists: vi.fn().mockResolvedValue(true),
      }));

      const result = await strategyWithApi.convertWithApi(mockTask);

      expect(result.success).toBe(true);
      expect(result.method).toBe("api");
      expect(global.fetch).toHaveBeenCalled();
    });

    it("应该在 API 请求失败时抛出错误", async () => {
      const strategyWithApi = new Md2WordStrategy(mockExecutor, {
        ...mockConfig,
        converterApiUrl: "https://api.example.com/convert",
      });

      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      await expect(
        strategyWithApi.convertWithApi(mockTask)
      ).rejects.toMatchObject({
        code: ConversionErrorCode.API_REQUEST_FAILED,
      });
    });

    it("应该在 API 响应无效时抛出错误", async () => {
      const strategyWithApi = new Md2WordStrategy(mockExecutor, {
        ...mockConfig,
        converterApiUrl: "https://api.example.com/convert",
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      }) as any;

      await expect(
        strategyWithApi.convertWithApi(mockTask)
      ).rejects.toMatchObject({
        code: ConversionErrorCode.API_INVALID_RESPONSE,
      });
    });
  });

  describe("buildPandocArgs", () => {
    it("应该构建基本的 Pandoc 参数", () => {
      const args = (strategy as any).buildPandocArgs(
        "/input.md",
        "/output.docx",
        {}
      );

      expect(args).toContain("-f");
      expect(args).toContain("markdown");
      expect(args).toContain("-t");
      expect(args).toContain("docx");
      expect(args).toContain("-o");
      expect(args).toContain("/output.docx");
      expect(args).toContain("/input.md");
    });

    it("应该添加独立文档参数", () => {
      const args = (strategy as any).buildPandocArgs(
        "/input.md",
        "/output.docx",
        { standalone: true }
      );

      expect(args).toContain("--standalone");
    });

    it("应该添加自定义参数", () => {
      const args = (strategy as any).buildPandocArgs(
        "/input.md",
        "/output.docx",
        { customPandocArgs: ["--reference-doc=template.docx", "--toc"] }
      );

      expect(args).toContain("--reference-doc=template.docx");
      expect(args).toContain("--toc");
    });
  });

  describe("错误场景", () => {
    const mockTask: ConversionTask = {
      inputPath: "/path/to/input.md",
      outputPath: "/path/to/output.docx",
      type: "md2word" as any,
    };

    it("应该处理文件读取错误", async () => {
      vi.mock("../../utils/file-utils.js", () => ({
        validatePath: vi
          .fn()
          .mockRejectedValue(
            new ConversionError(
              "File not found",
              ConversionErrorCode.FILE_NOT_FOUND
            )
          ),
      }));

      await expect(strategy.convertWithPandoc(mockTask)).rejects.toMatchObject({
        code: ConversionErrorCode.FILE_NOT_FOUND,
      });
    });

    it("应该处理输出目录创建失败", async () => {
      vi.mock("../../utils/file-utils.js", () => ({
        validatePath: vi.fn().mockResolvedValue("/path/to/input.md"),
        validateFileSize: vi.fn().mockResolvedValue(undefined),
        ensureDirectoryExists: vi
          .fn()
          .mockRejectedValue(
            new ConversionError(
              "Cannot create directory",
              ConversionErrorCode.OUTPUT_FILE_CREATION_FAILED
            )
          ),
      }));

      await expect(strategy.convertWithPandoc(mockTask)).rejects.toThrow(
        ConversionError
      );
    });

    it("应该处理网络超时", async () => {
      const strategyWithApi = new Md2WordStrategy(mockExecutor, {
        ...mockConfig,
        converterApiUrl: "https://api.example.com/convert",
        apiTimeout: 1000,
      });

      global.fetch = vi.fn().mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Timeout")), 1100);
        });
      });

      await expect(strategyWithApi.convertWithApi(mockTask)).rejects.toThrow(
        ConversionError
      );
    });
  });
});
