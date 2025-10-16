/**
 * PandocExecutor 单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PandocExecutor } from "./pandoc-executor.js";
import {
  ConversionError,
  ConversionErrorCode,
} from "../types/converter-types.js";

describe("PandocExecutor", () => {
  let executor: PandocExecutor;

  beforeEach(() => {
    executor = new PandocExecutor("pandoc");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("构造函数", () => {
    it("应该使用默认 Pandoc 路径", () => {
      const exec = new PandocExecutor();
      expect(exec.getPandocPath()).toBe("pandoc");
    });

    it("应该使用自定义 Pandoc 路径", () => {
      const exec = new PandocExecutor("/custom/path/pandoc");
      expect(exec.getPandocPath()).toBe("/custom/path/pandoc");
    });
  });

  describe("checkAvailability", () => {
    it("应该在 Pandoc 可用时返回 true", async () => {
      // Mock executeCommand 返回成功的版本信息
      vi.spyOn(executor as any, "executeCommand").mockResolvedValue({
        success: true,
        stdout: "pandoc 3.1.11\nCompiled with...",
        stderr: "",
        duration: 100,
      });

      const result = await executor.checkAvailability();
      expect(result).toBe(true);
    });

    it("应该在 Pandoc 不可用时返回 false", async () => {
      vi.spyOn(executor as any, "executeCommand").mockRejectedValue(
        new Error("Command not found")
      );

      const result = await executor.checkAvailability();
      expect(result).toBe(false);
    });

    it("应该在版本信息无效时返回 false", async () => {
      vi.spyOn(executor as any, "executeCommand").mockResolvedValue({
        success: true,
        stdout: "invalid output",
        stderr: "",
        duration: 100,
      });

      const result = await executor.checkAvailability();
      expect(result).toBe(false);
    });
  });

  describe("execute", () => {
    it("应该成功执行 Pandoc 命令", async () => {
      const mockResult = {
        success: true,
        stdout: "Conversion successful",
        stderr: "",
        duration: 500,
      };

      vi.spyOn(executor as any, "executeCommand").mockResolvedValue(mockResult);

      const result = await executor.execute({
        executable: "pandoc",
        args: ["-f", "docx", "-t", "markdown", "input.docx"],
      });

      expect(result.success).toBe(true);
      expect(result.stdout).toBe("Conversion successful");
      expect(result.duration).toBe(500);
    });

    it("应该在命令失败时抛出 ConversionError", async () => {
      vi.spyOn(executor as any, "executeCommand").mockResolvedValue({
        success: false,
        stdout: "",
        stderr: "Error: file not found",
        duration: 100,
      });

      await expect(
        executor.execute({
          executable: "pandoc",
          args: ["input.docx"],
        })
      ).rejects.toThrow(ConversionError);
    });

    it("应该在检测到不安全参数时抛出错误", async () => {
      await expect(
        executor.execute({
          executable: "pandoc",
          args: ["input.docx", "$(malicious command)"],
        })
      ).rejects.toThrow(ConversionError);
    });

    it("应该在检测到路径遍历时抛出错误", async () => {
      await expect(
        executor.execute({
          executable: "pandoc",
          args: ["../../etc/passwd"],
        })
      ).rejects.toThrow(ConversionError);
    });

    it("应该允许合法的资源路径参数", async () => {
      vi.spyOn(executor as any, "executeCommand").mockResolvedValue({
        success: true,
        stdout: "",
        stderr: "",
        duration: 100,
      });

      await expect(
        executor.execute({
          executable: "pandoc",
          args: ["--resource-path", "../images", "input.docx"],
        })
      ).resolves.not.toThrow();
    });
  });

  describe("validateCommandSecurity", () => {
    it("应该拒绝包含 shell 特殊字符的参数", () => {
      expect(() => {
        (executor as any).validateCommandSecurity({
          executable: "pandoc",
          args: ["input.docx", ";rm -rf /"],
        });
      }).toThrow(ConversionError);
    });

    it("应该拒绝变量替换", () => {
      expect(() => {
        (executor as any).validateCommandSecurity({
          executable: "pandoc",
          args: ["${HOME}/file"],
        });
      }).toThrow(ConversionError);
    });

    it("应该拒绝命令替换", () => {
      expect(() => {
        (executor as any).validateCommandSecurity({
          executable: "pandoc",
          args: ["$(whoami)"],
        });
      }).toThrow(ConversionError);
    });

    it("应该拒绝无效的可执行文件", () => {
      expect(() => {
        (executor as any).validateCommandSecurity({
          executable: "",
          args: [],
        });
      }).toThrow(ConversionError);
    });
  });

  describe("setPandocPath", () => {
    it("应该更新 Pandoc 路径", () => {
      executor.setPandocPath("/new/path/pandoc");
      expect(executor.getPandocPath()).toBe("/new/path/pandoc");
    });

    it("应该拒绝无效的路径", () => {
      expect(() => {
        executor.setPandocPath("");
      }).toThrow(ConversionError);
    });

    it("应该拒绝非字符串路径", () => {
      expect(() => {
        executor.setPandocPath(null as any);
      }).toThrow(ConversionError);
    });
  });

  describe("getPandocVersion", () => {
    it("应该返回 Pandoc 版本字符串", async () => {
      vi.spyOn(executor as any, "executeCommand").mockResolvedValue({
        success: true,
        stdout: "pandoc 3.1.11\nCompiled with pandoc-types 1.23",
        stderr: "",
        duration: 100,
      });

      const version = await executor.getPandocVersion();
      expect(version).toBe("pandoc 3.1.11");
    });

    it("应该在获取版本失败时返回 null", async () => {
      vi.spyOn(executor as any, "executeCommand").mockRejectedValue(
        new Error("Command failed")
      );

      const version = await executor.getPandocVersion();
      expect(version).toBeNull();
    });
  });

  describe("checkPandocFeature", () => {
    it("应该在功能支持时返回 true", async () => {
      vi.spyOn(executor as any, "executeCommand").mockResolvedValue({
        success: true,
        stdout: "commonmark\ndocx\ngfm\nhtml\nmarkdown",
        stderr: "",
        duration: 100,
      });

      const supported = await executor.checkPandocFeature("docx");
      expect(supported).toBe(true);
    });

    it("应该在功能不支持时返回 false", async () => {
      vi.spyOn(executor as any, "executeCommand").mockResolvedValue({
        success: true,
        stdout: "markdown\nhtml",
        stderr: "",
        duration: 100,
      });

      const supported = await executor.checkPandocFeature("docx");
      expect(supported).toBe(false);
    });

    it("应该在检查失败时返回 false", async () => {
      vi.spyOn(executor as any, "executeCommand").mockRejectedValue(
        new Error("Command failed")
      );

      const supported = await executor.checkPandocFeature("docx");
      expect(supported).toBe(false);
    });
  });

  describe("createDefaultPandocExecutor", () => {
    it("应该创建默认执行器", async () => {
      const { createDefaultPandocExecutor } = await import(
        "./pandoc-executor.js"
      );
      const exec = createDefaultPandocExecutor();
      expect(exec.getPandocPath()).toBe("pandoc");
    });

    it("应该创建带自定义路径的执行器", async () => {
      const { createDefaultPandocExecutor } = await import(
        "./pandoc-executor.js"
      );
      const exec = createDefaultPandocExecutor("/custom/pandoc");
      expect(exec.getPandocPath()).toBe("/custom/pandoc");
    });
  });

  describe("错误处理", () => {
    it("应该捕获并包装执行错误", async () => {
      vi.spyOn(executor as any, "executeCommand").mockRejectedValue(
        new Error("Unexpected error")
      );

      await expect(
        executor.execute({
          executable: "pandoc",
          args: ["input.docx"],
        })
      ).rejects.toThrow(ConversionError);
    });

    it("应该在超时时设置错误码", async () => {
      vi.spyOn(executor as any, "executeCommand").mockResolvedValue({
        success: false,
        stdout: "",
        stderr: "",
        duration: 60000,
        error: new ConversionError(
          "命令执行超时 (60000ms)",
          ConversionErrorCode.CONVERSION_TIMEOUT
        ),
      });

      await expect(
        executor.execute({
          executable: "pandoc",
          args: ["large-file.docx"],
          timeout: 60000,
        })
      ).rejects.toThrow(ConversionError);
    });

    it("应该在 Pandoc 未找到时返回特定错误", async () => {
      const enoentError = new Error("ENOENT") as any;
      enoentError.code = "ENOENT";

      vi.spyOn(executor as any, "executeCommand").mockRejectedValue(
        new ConversionError(
          "Pandoc 未找到: pandoc",
          ConversionErrorCode.PANDOC_NOT_AVAILABLE,
          enoentError
        )
      );

      await expect(
        executor.execute({
          executable: "pandoc",
          args: ["input.docx"],
        })
      ).rejects.toMatchObject({
        code: ConversionErrorCode.PANDOC_NOT_AVAILABLE,
      });
    });
  });
});
