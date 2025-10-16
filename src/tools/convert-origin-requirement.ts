/**
 * convert-origin-requirement MCP 工具
 *
 * 将原始需求文档（Word/Markdown）转换为规范的 spec-workflow 需求文档
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ToolContext, ToolResponse } from "../types.js";
import { PathUtils } from "../core/path-utils.js";
import { createDocumentConverter } from "../services/document-converter.js";
import { ConversionType } from "../types/converter-types.js";
import {
  fileExists,
  readTextFile,
  writeTextFile,
  ensureDirectoryExists,
  getExtension,
  SUPPORTED_EXTENSIONS,
} from "../utils/file-utils.js";
import { join, basename, dirname } from "path";
import { SpecWorkflowConfig } from "../config.js";

export const convertOriginRequirementTool: Tool = {
  name: "convert-origin-requirement",
  description: `Convert origin requirement document to Markdown format.

# Instructions
Parse filename (remove # prefix if present), locate file in .spec-workflow/origin-requirements/ directory, determine format, convert if needed using DocumentConverter (Pandoc), and save to .spec-workflow/origin-requirements/.temp/{filename}/ directory.

Workflow:
1. Locate file in .spec-workflow/origin-requirements/
2. Convert Word to Markdown (if needed) using Pandoc
3. Save to .spec-workflow/origin-requirements/.temp/{filename}/
   - {filename}.md - Markdown content
   - media/ - Extracted images
4. Return success with markdownPath for next step
5. Next: Use spec-workflow-guide tool to create standard requirements document

Supports:
- Direct Markdown files (.md) - copied to .temp directory
- Word documents (.docx, .doc) - converted to Markdown with media extraction
- Filename with # prefix (e.g., #myfile.docx)`,
  inputSchema: {
    type: "object",
    properties: {
      projectPath: {
        type: "string",
        description: "Absolute path to the project root",
      },
      filename: {
        type: "string",
        description:
          'Filename of the origin requirement document (supports # prefix, e.g., "#requirement.docx" or "requirement.md")',
      },
      specName: {
        type: "string",
        description:
          "Target spec name (optional, auto-generated from filename if not provided)",
      },
      config: {
        type: "object",
        description: "Converter configuration (optional)",
        properties: {
          pandocPath: {
            type: "string",
            description: "Path to Pandoc executable",
          },
          converterApiUrl: {
            type: "string",
            description: "Converter API URL",
          },
        },
      },
    },
    required: ["projectPath", "filename"],
  },
};

export async function convertOriginRequirementHandler(
  args: any,
  context: ToolContext
): Promise<ToolResponse> {
  const { projectPath, filename, specName, config } = args;

  try {
    console.error("[convert-origin-requirement] 开始处理原始需求文档转换");
    console.error(`  项目路径: ${projectPath}`);
    console.error(`  文件名: ${filename}`);

    // 1. 解析文件名（去除 # 前缀）
    const cleanFilename = filename.startsWith("#")
      ? filename.substring(1)
      : filename;

    console.error(`  清理后文件名: ${cleanFilename}`);

    // 2. 在 .spec-workflow/origin-requirements/ 目录中查找文件
    const workflowRoot = PathUtils.getWorkflowRoot(projectPath);
    const originReqDir = join(workflowRoot, "origin-requirements");
    const inputFilePath = join(originReqDir, cleanFilename);

    console.error(`  查找文件: ${inputFilePath}`);

    // 检查 origin-requirements 目录是否存在
    if (!(await fileExists(originReqDir))) {
      await ensureDirectoryExists(originReqDir);
      return {
        success: false,
        message: `origin-requirements 目录不存在，已创建。请将原始需求文档放入该目录。`,
        nextSteps: [`将需求文档放入: ${originReqDir}`, "再次运行此命令"],
        projectContext: {
          projectPath,
          workflowRoot: PathUtils.getWorkflowRoot(projectPath),
        },
      };
    }

    // 检查文件是否存在
    if (!(await fileExists(inputFilePath))) {
      return {
        success: false,
        message: `文件不存在: ${inputFilePath}`,
        nextSteps: [
          `检查文件名是否正确: ${cleanFilename}`,
          `确认文件在目录中: ${originReqDir}`,
          `支持的格式: ${SUPPORTED_EXTENSIONS.all.join(", ")}`,
        ],
        projectContext: {
          projectPath,
          workflowRoot: PathUtils.getWorkflowRoot(projectPath),
        },
      };
    }

    // 3. 判断文件格式
    const fileExtension = getExtension(inputFilePath);
    console.error(`  文件扩展名: ${fileExtension}`);

    let markdownPath: string;
    let conversionPerformed = false;

    // 4. 根据格式处理
    if (SUPPORTED_EXTENSIONS.markdown.includes(fileExtension)) {
      // 已经是 Markdown 文件，直接使用
      console.error("  文件已是 Markdown 格式，跳过转换");
      markdownPath = inputFilePath;
    } else if (SUPPORTED_EXTENSIONS.word.includes(fileExtension)) {
      // Word 文件，需要转换
      console.error("  Word 文件，需要转换为 Markdown");

      // 直接指定输出路径到 .temp/{filename}/ 目录下
      const baseName = basename(cleanFilename, fileExtension);
      const originReqPath = PathUtils.getOriginRequirementsPath(projectPath);
      const tempDir = join(originReqPath, ".temp", baseName);
      await ensureDirectoryExists(tempDir);

      // 创建文档转换器
      const converterConfig = {
        pandocPath: config?.pandocPath,
        converterApiUrl: config?.converterApiUrl,
        apiTimeout: 30000,
        tempDir: tempDir,
      };

      const converter = createDocumentConverter(converterConfig);

      const outputPath = join(tempDir, `${baseName}.md`);

      // 执行转换
      console.error("  开始转换...");
      console.error("  输出路径:", outputPath);
      const conversionResult = await converter.convert(
        ConversionType.WORD_TO_MD,
        inputFilePath,
        outputPath
      );

      if (!conversionResult.success) {
        return {
          success: false,
          message: `文档转换失败: ${conversionResult.message}`,
          data: conversionResult,
          projectContext: {
            projectPath,
            workflowRoot: PathUtils.getWorkflowRoot(projectPath),
          },
        };
      }

      markdownPath = conversionResult.outputPath;
      conversionPerformed = true;
      console.error(`  转换成功: ${markdownPath}`);
    } else {
      return {
        success: false,
        message: `不支持的文件格式: ${fileExtension}`,
        nextSteps: [
          `支持的格式: ${SUPPORTED_EXTENSIONS.all.join(", ")}`,
          "请转换文件格式后重试",
        ],
        projectContext: {
          projectPath,
          workflowRoot: PathUtils.getWorkflowRoot(projectPath),
        },
      };
    }

    // 5. 确定 spec 名称
    const finalSpecName =
      specName ||
      basename(cleanFilename, getExtension(cleanFilename))
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");

    console.error(`  目标 spec 名称: ${finalSpecName}`);
    console.error(`  转换后的 Markdown: ${markdownPath}`);

    // 6. 返回成功结果，提示下一步使用 spec-workflow-guide 创建规范文档
    return {
      success: true,
      message: `成功将原始需求文档转换为 Markdown 格式`,
      data: {
        specName: finalSpecName,
        markdownPath,
        tempDir: dirname(markdownPath),
        originFile: inputFilePath,
        converted: conversionPerformed,
        conversionMethod: conversionPerformed ? "pandoc/api" : "direct",
      },
      nextSteps: [
        `查看转换后的 Markdown: ${markdownPath}`,
        `使用 spec-workflow-guide 工具创建规范需求文档`,
        `提示：调用 spec-workflow-guide 工具，它会读取转换后的 Markdown 并生成符合规范的需求文档`,
      ],
      projectContext: {
        projectPath,
        workflowRoot: PathUtils.getWorkflowRoot(projectPath),
        specName: finalSpecName,
        currentPhase: "requirements",
      },
    };
  } catch (error) {
    console.error("[convert-origin-requirement] 错误:", error);
    return {
      success: false,
      message: `转换失败: ${
        error instanceof Error ? error.message : String(error)
      }`,
      data: {
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
              }
            : String(error),
      },
      projectContext: {
        projectPath,
        workflowRoot: PathUtils.getWorkflowRoot(projectPath),
      },
    };
  }
}

/**
 * 转换为 spec-workflow 规范格式
 *
 * @param content - 原始 Markdown 内容
 * @param specName - Spec 名称
 * @param originFile - 原始文件名
 * @returns 格式化后的内容
 * @private
 */
function transformToSpecFormat(
  content: string,
  specName: string,
  originFile: string
): string {
  // 添加元数据头部
  const header = `# 需求文档 - ${specName}

> **来源**: ${originFile}  
> **转换时间**: ${new Date().toISOString()}  
> **状态**: 草稿

---

`;

  // 简单处理：保留原始内容，后续可以根据需要添加更复杂的转换逻辑
  // 例如：提取用户故事、验收标准等

  return header + content;
}
