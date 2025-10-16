import * as fs from "fs";
import * as path from "path";
import * as toml from "toml";
import { homedir } from "os";

export interface SpecWorkflowConfig {
  projectDir?: string;
  port?: number;
  autoStartDashboard?: boolean;
  dashboardOnly?: boolean;
  lang?: string;
  templateLang?: string; // 模板语言: 'en' | 'zh'
  // 转换器配置
  pandocPath?: string; // Pandoc 可执行文件路径
  converterApiUrl?: string; // 转换 API 服务地址
  apiTimeout?: number; // API 请求超时时间（毫秒）
}

export interface ConfigLoadResult {
  config: SpecWorkflowConfig | null;
  configPath: string | null;
  error?: string;
}

function expandTilde(filepath: string): string {
  if (filepath.startsWith("~")) {
    return path.join(homedir(), filepath.slice(1));
  }
  return filepath;
}

function validatePort(port: number): boolean {
  return Number.isInteger(port) && port >= 1024 && port <= 65535;
}

function validateConfig(config: any): { valid: boolean; error?: string } {
  if (config.port !== undefined) {
    if (!validatePort(config.port)) {
      return {
        valid: false,
        error: `Invalid port: ${config.port}. Port must be between 1024 and 65535.`,
      };
    }
  }

  if (
    config.projectDir !== undefined &&
    typeof config.projectDir !== "string"
  ) {
    return {
      valid: false,
      error: `Invalid projectDir: must be a string.`,
    };
  }

  if (
    config.autoStartDashboard !== undefined &&
    typeof config.autoStartDashboard !== "boolean"
  ) {
    return {
      valid: false,
      error: `Invalid autoStartDashboard: must be a boolean.`,
    };
  }

  if (
    config.dashboardOnly !== undefined &&
    typeof config.dashboardOnly !== "boolean"
  ) {
    return {
      valid: false,
      error: `Invalid dashboardOnly: must be a boolean.`,
    };
  }

  if (config.lang !== undefined && typeof config.lang !== "string") {
    return {
      valid: false,
      error: `Invalid lang: must be a string.`,
    };
  }

  if (config.templateLang !== undefined) {
    if (typeof config.templateLang !== "string") {
      return {
        valid: false,
        error: `Invalid templateLang: must be a string.`,
      };
    }
    if (!["en", "zh"].includes(config.templateLang)) {
      return {
        valid: false,
        error: `Invalid templateLang: must be 'en' or 'zh'.`,
      };
    }
  }

  // 验证转换器配置
  if (
    config.pandocPath !== undefined &&
    typeof config.pandocPath !== "string"
  ) {
    return {
      valid: false,
      error: `Invalid pandocPath: must be a string.`,
    };
  }

  if (config.converterApiUrl !== undefined) {
    if (typeof config.converterApiUrl !== "string") {
      return {
        valid: false,
        error: `Invalid converterApiUrl: must be a string.`,
      };
    }
    // 验证 URL 格式
    try {
      new URL(config.converterApiUrl);
    } catch {
      return {
        valid: false,
        error: `Invalid converterApiUrl: must be a valid URL.`,
      };
    }
  }

  if (config.apiTimeout !== undefined) {
    if (
      !Number.isInteger(config.apiTimeout) ||
      config.apiTimeout < 1000 ||
      config.apiTimeout > 300000
    ) {
      return {
        valid: false,
        error: `Invalid apiTimeout: must be an integer between 1000 and 300000 (1s-5min).`,
      };
    }
  }

  return { valid: true };
}

export function loadConfigFromPath(configPath: string): ConfigLoadResult {
  try {
    const expandedPath = expandTilde(configPath);

    if (!fs.existsSync(expandedPath)) {
      return {
        config: null,
        configPath: expandedPath,
        error: `Config file not found: ${expandedPath}`,
      };
    }

    const configContent = fs.readFileSync(expandedPath, "utf-8");
    const parsedConfig = toml.parse(configContent);

    const validation = validateConfig(parsedConfig);
    if (!validation.valid) {
      return {
        config: null,
        configPath: expandedPath,
        error: validation.error,
      };
    }

    const config: SpecWorkflowConfig = {};

    if (parsedConfig.projectDir !== undefined) {
      config.projectDir = expandTilde(parsedConfig.projectDir);
    }

    if (parsedConfig.port !== undefined) {
      config.port = parsedConfig.port;
    }

    if (parsedConfig.autoStartDashboard !== undefined) {
      config.autoStartDashboard = parsedConfig.autoStartDashboard;
    }

    if (parsedConfig.dashboardOnly !== undefined) {
      config.dashboardOnly = parsedConfig.dashboardOnly;
    }

    if (parsedConfig.lang !== undefined) {
      config.lang = parsedConfig.lang;
    }

    if (parsedConfig.templateLang !== undefined) {
      config.templateLang = parsedConfig.templateLang;
    }

    // 转换器配置
    if (parsedConfig.pandocPath !== undefined) {
      config.pandocPath = expandTilde(parsedConfig.pandocPath);
    }

    if (parsedConfig.converterApiUrl !== undefined) {
      config.converterApiUrl = parsedConfig.converterApiUrl;
    }

    if (parsedConfig.apiTimeout !== undefined) {
      config.apiTimeout = parsedConfig.apiTimeout;
    }

    return {
      config,
      configPath: expandedPath,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        config: null,
        configPath: null,
        error: `Failed to load config file: ${error.message}`,
      };
    }
    return {
      config: null,
      configPath: null,
      error: "Failed to load config file: Unknown error",
    };
  }
}

export function loadConfigFile(
  projectDir: string,
  customConfigPath?: string
): ConfigLoadResult {
  // If custom config path is provided, use it
  if (customConfigPath) {
    return loadConfigFromPath(customConfigPath);
  }

  // Otherwise, look for default config in project directory
  try {
    const expandedDir = expandTilde(projectDir);
    const configDir = path.join(expandedDir, ".spec-workflow");
    const configPath = path.join(configDir, "config.toml");

    if (!fs.existsSync(configPath)) {
      return {
        config: null,
        configPath: null,
      };
    }

    return loadConfigFromPath(configPath);
  } catch (error) {
    if (error instanceof Error) {
      return {
        config: null,
        configPath: null,
        error: `Failed to load config file: ${error.message}`,
      };
    }
    return {
      config: null,
      configPath: null,
      error: "Failed to load config file: Unknown error",
    };
  }
}

export function mergeConfigs(
  fileConfig: SpecWorkflowConfig | null,
  cliArgs: Partial<SpecWorkflowConfig>
): SpecWorkflowConfig {
  const merged: SpecWorkflowConfig = {};

  if (fileConfig) {
    Object.assign(merged, fileConfig);
  }

  Object.keys(cliArgs).forEach((key) => {
    const value = cliArgs[key as keyof SpecWorkflowConfig];
    if (value !== undefined) {
      (merged as any)[key] = value;
    }
  });

  return merged;
}

/**
 * 获取 Pandoc 路径
 *
 * 配置优先级：
 * 1. 命令行参数（通过 config 传入）
 * 2. 配置文件
 * 3. 默认值 'pandoc'（从系统 PATH 查找）
 *
 * @param config - 合并后的配置
 * @returns Pandoc 可执行文件路径
 */
export function getPandocPath(config: SpecWorkflowConfig): string {
  return config.pandocPath || "pandoc";
}

/**
 * 获取转换 API URL
 *
 * @param config - 合并后的配置
 * @returns API URL，如果未配置则返回 undefined
 */
export function getConverterApiUrl(
  config: SpecWorkflowConfig
): string | undefined {
  return config.converterApiUrl;
}

/**
 * 获取 API 超时时间
 *
 * @param config - 合并后的配置
 * @returns 超时时间（毫秒），默认 30000 (30秒)
 */
export function getApiTimeout(config: SpecWorkflowConfig): number {
  return config.apiTimeout || 30000;
}

/**
 * 判断是否应该使用 API（而非本地 Pandoc）
 *
 * @param config - 合并后的配置
 * @returns 是否配置了 API URL
 */
export function hasApiConfigured(config: SpecWorkflowConfig): boolean {
  return !!config.converterApiUrl;
}
