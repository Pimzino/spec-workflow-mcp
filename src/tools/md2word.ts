/**
 * md2word MCP 工具
 *
 * 将 Markdown 文件转换为 Word 文档
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ToolContext, ToolResponse } from "../types.js";
import { PathUtils } from "../core/path-utils.js";
import { createDocumentConverter } from "../services/document-converter.js";
import { ConversionType } from "../types/converter-types.js";
import {
  fileExists,
  validatePath,
  getExtension,
  SUPPORTED_EXTENSIONS,
} from "../utils/file-utils.js";
import { join, dirname, basename } from "path";

export const md2wordTool: Tool = {
  name: "md2word",
  description: `Convert Markdown file to Word document (DOCX).

# Instructions
Validate input file is .md format and exists, determine output path (default: same directory with .docx extension), call DocumentConverter with 'md2word' type, return generated Word file path.

Supports all Markdown features:
- Headings
- Lists (ordered and unordered)
- Tables
- Code blocks
- Images
- Links
- Bold, italic, etc.`,
  inputSchema: {
    type: "object",
    properties: {
      projectPath: {
        type: "string",
        description: "Absolute path to the project root",
      },
      filePath: {
        type: "string",
        description:
          "Path to the Markdown file (absolute or relative to project)",
      },
      outputPath: {
        type: "string",
        description:
          "Optional output path for the Word file (defaults to same directory as input with .docx extension)",
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
    required: ["projectPath", "filePath"],
  },
};

export async function md2wordHandler(
  args: any,
  context: ToolContext
): Promise<ToolResponse> {
  const { projectPath, filePath, outputPath, config } = args;

  try {
    console.error("[md2word] 开始 Markdown 转 Word");
    console.error(`  项目路径: ${projectPath}`);
    console.error(`  输入文件: ${filePath}`);

    // 1. 解析输入路径（支持相对路径和绝对路径）
    let inputFilePath: string;
    if (filePath.startsWith("/") || filePath.match(/^[A-Za-z]:\\/)) {
      // 绝对路径
      inputFilePath = filePath;
    } else {
      // 相对路径（相对于项目根目录）
      inputFilePath = join(projectPath, filePath);
    }

    console.error(`  完整输入路径: ${inputFilePath}`);

    // 2. 验证输入文件
    try {
      await validatePath(inputFilePath, projectPath);
    } catch (error) {
      return {
        success: false,
        message: `文件路径无效: ${
          error instanceof Error ? error.message : String(error)
        }`,
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
          "检查文件路径是否正确",
          "确认文件确实存在",
          `支持的格式: ${SUPPORTED_EXTENSIONS.markdown.join(", ")}`,
        ],
        projectContext: {
          projectPath,
          workflowRoot: PathUtils.getWorkflowRoot(projectPath),
        },
      };
    }

    // 检查文件扩展名
    const fileExtension = getExtension(inputFilePath);
    if (!SUPPORTED_EXTENSIONS.markdown.includes(fileExtension)) {
      return {
        success: false,
        message: `不支持的文件格式: ${fileExtension}`,
        nextSteps: [
          `支持的格式: ${SUPPORTED_EXTENSIONS.markdown.join(", ")}`,
          "请提供有效的 Markdown 文件",
        ],
        projectContext: {
          projectPath,
          workflowRoot: PathUtils.getWorkflowRoot(projectPath),
        },
      };
    }

    // 3. 确定输出路径
    let outputFilePath: string;
    if (outputPath) {
      // 用户指定了输出路径
      if (outputPath.startsWith("/") || outputPath.match(/^[A-Za-z]:\\/)) {
        // 绝对路径
        outputFilePath = outputPath;
      } else {
        // 相对路径
        outputFilePath = join(projectPath, outputPath);
      }
    } else {
      // 默认：同级目录，替换扩展名为 .docx
      const dir = dirname(inputFilePath);
      const baseName = basename(inputFilePath, fileExtension);
      outputFilePath = join(dir, `${baseName}.docx`);
    }

    console.error(`  输出路径: ${outputFilePath}`);

    // 4. 创建文档转换器
    const converterConfig = {
      tempDir: join(projectPath, ".temp"),
      pandocPath: config?.pandocPath,
      converterApiUrl: config?.converterApiUrl,
      apiTimeout: 30000,
      ...(context as any).config, // 从 context 获取配置
    };

    const converter = createDocumentConverter(converterConfig);

    // 5. 执行转换
    console.error("  开始转换...");
    const conversionResult = await converter.convert(
      ConversionType.MD_TO_WORD,
      inputFilePath,
      outputFilePath
    );

    if (!conversionResult.success) {
      return {
        success: false,
        message: `转换失败: ${conversionResult.message}`,
        data: conversionResult,
        projectContext: {
          projectPath,
          workflowRoot: PathUtils.getWorkflowRoot(projectPath),
        },
      };
    }

    console.error(`  转换成功: ${conversionResult.outputPath}`);

    // 6. 返回成功结果
    return {
      success: true,
      message: `成功将 Markdown 转换为 Word 文档`,
      data: {
        inputPath: inputFilePath,
        outputPath: conversionResult.outputPath,
        method: conversionResult.method,
        duration: conversionResult.duration,
        fileSize: conversionResult.fileSize,
      },
      nextSteps: [
        `查看生成的 Word 文档: ${conversionResult.outputPath}`,
        "在 Microsoft Word 或兼容软件中打开文件",
      ],
      projectContext: {
        projectPath,
        workflowRoot: PathUtils.getWorkflowRoot(projectPath),
      },
    };
  } catch (error) {
    console.error("[md2word] 错误:", error);
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
