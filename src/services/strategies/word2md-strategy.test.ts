/**
 * Word2MdStrategy 单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Word2MdStrategy } from "./word2md-strategy.js";
import {
  ConversionError,
  ConversionErrorCode,
} from "../../types/converter-types.js";
import type { ConversionTask } from "../../types/converter-types.js";

describe("Word2MdStrategy", () => {
  let strategy: Word2MdStrategy;
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

    strategy = new Word2MdStrategy(mockExecutor, mockConfig);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("convertWithPandoc", () => {
    const mockTask: ConversionTask = {
      inputPath: "/path/to/input.docx",
      outputPath: "/path/to/output.md",
      type: "word2md" as any,
    };

    it("应该成功使用 Pandoc 转换 Word 文档", async () => {
      // Mock file operations
      vi.mock("../../utils/file-utils.js", () => ({
        validatePath: vi.fn().mockResolvedValue("/path/to/input.docx"),
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

    it("应该支持提取媒体文件", async () => {
      vi.mock("../../utils/file-utils.js", () => ({
        validatePath: vi.fn().mockResolvedValue("/path/to/input.docx"),
        validateFileSize: vi.fn().mockResolvedValue(undefined),
        ensureDirectoryExists: vi.fn().mockResolvedValue(undefined),
        fileExists: vi.fn().mockResolvedValue(true),
      }));

      const result = await strategy.convertWithPandoc(mockTask, {
        extractMedia: true,
        mediaDirName: "images",
      });

      expect(result.success).toBe(true);
      // 验证传给 Pandoc 的参数包含 --extract-media
      const executeCall = mockExecutor.execute.mock.calls[0][0];
      expect(executeCall.args).toContain("--extract-media");
    });

    it("应该支持自定义 Pandoc 参数", async () => {
      vi.mock("../../utils/file-utils.js", () => ({
        validatePath: vi.fn().mockResolvedValue("/path/to/input.docx"),
        validateFileSize: vi.fn().mockResolvedValue(undefined),
        ensureDirectoryExists: vi.fn().mockResolvedValue(undefined),
        fileExists: vi.fn().mockResolvedValue(true),
      }));

      await strategy.convertWithPandoc(mockTask, {
        customPandocArgs: ["--toc", "--toc-depth=3"],
      });

      const executeCall = mockExecutor.execute.mock.calls[0][0];
      expect(executeCall.args).toContain("--toc");
      expect(executeCall.args).toContain("--toc-depth=3");
    });

    it("应该在输入文件不存在时抛出错误", async () => {
      const errorTask: ConversionTask = {
        ...mockTask,
        inputPath: "/nonexistent/file.docx",
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
      inputPath: "/path/to/input.docx",
      outputPath: "/path/to/output.md",
      type: "word2md" as any,
    };

    it("应该在 API 未配置时抛出错误", async () => {
      await expect(strategy.convertWithApi(mockTask)).rejects.toMatchObject({
        code: ConversionErrorCode.API_NOT_AVAILABLE,
      });
    });

    it("应该成功使用 API 转换文档", async () => {
      const strategyWithApi = new Word2MdStrategy(mockExecutor, {
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
        readFileContent: vi.fn().mockResolvedValue("file content"),
        writeFileContent: vi.fn().mockResolvedValue(undefined),
        fileExists: vi.fn().mockResolvedValue(true),
        extractZip: vi.fn().mockResolvedValue(undefined),
      }));

      const result = await strategyWithApi.convertWithApi(mockTask);

      expect(result.success).toBe(true);
      expect(result.method).toBe("api");
      expect(global.fetch).toHaveBeenCalled();
    });

    it("应该在 API 请求失败时抛出错误", async () => {
      const strategyWithApi = new Word2MdStrategy(mockExecutor, {
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
      const strategyWithApi = new Word2MdStrategy(mockExecutor, {
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
        "/input.docx",
        "/output.md",
        {}
      );

      expect(args).toContain("-f");
      expect(args).toContain("docx");
      expect(args).toContain("-t");
      expect(args).toContain("gfm");
      expect(args).toContain("-o");
      expect(args).toContain("/output.md");
      expect(args).toContain("/input.docx");
    });

    it("应该添加提取媒体参数", () => {
      const args = (strategy as any).buildPandocArgs(
        "/input.docx",
        "/output.md",
        { extractMedia: true, mediaDirName: "images" }
      );

      expect(args).toContain("--extract-media");
    });

    it("应该添加独立文档参数", () => {
      const args = (strategy as any).buildPandocArgs(
        "/input.docx",
        "/output.md",
        { standalone: true }
      );

      expect(args).toContain("--standalone");
    });

    it("应该添加自定义参数", () => {
      const args = (strategy as any).buildPandocArgs(
        "/input.docx",
        "/output.md",
        { customPandocArgs: ["--toc", "--no-highlight"] }
      );

      expect(args).toContain("--toc");
      expect(args).toContain("--no-highlight");
    });
  });
});
