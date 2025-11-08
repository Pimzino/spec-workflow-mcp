import * as fs from 'fs';
import * as path from 'path';
import * as toml from 'toml';
import { homedir } from 'os';

export interface SpecWorkflowConfig {
  projectDir?: string;
  port?: number;
  dashboardOnly?: boolean;
  lang?: string;
}

export interface ConfigLoadResult {
  config: SpecWorkflowConfig | null;
  configPath: string | null;
  error?: string;
}

function expandTilde(filepath: string): string {
  if (filepath.startsWith('~')) {
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
        error: `Invalid port: ${config.port}. Port must be between 1024 and 65535.` 
      };
    }
  }

  if (config.projectDir !== undefined && typeof config.projectDir !== 'string') {
    return {
      valid: false,
      error: `Invalid projectDir: must be a string.`
    };
  }

  if (config.dashboardOnly !== undefined && typeof config.dashboardOnly !== 'boolean') {
    return { 
      valid: false, 
      error: `Invalid dashboardOnly: must be a boolean.` 
    };
  }

  if (config.lang !== undefined && typeof config.lang !== 'string') {
    return { 
      valid: false, 
      error: `Invalid lang: must be a string.` 
    };
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
        error: `Config file not found: ${expandedPath}`
      };
    }

    const configContent = fs.readFileSync(expandedPath, 'utf-8');
    const parsedConfig = toml.parse(configContent);

    const validation = validateConfig(parsedConfig);
    if (!validation.valid) {
      return { 
        config: null, 
        configPath: expandedPath, 
        error: validation.error 
      };
    }

    const config: SpecWorkflowConfig = {};
    
    if (parsedConfig.projectDir !== undefined) {
      config.projectDir = expandTilde(parsedConfig.projectDir);
    }
    
    if (parsedConfig.port !== undefined) {
      config.port = parsedConfig.port;
    }

    if (parsedConfig.dashboardOnly !== undefined) {
      config.dashboardOnly = parsedConfig.dashboardOnly;
    }
    
    if (parsedConfig.lang !== undefined) {
      config.lang = parsedConfig.lang;
    }

    return { 
      config, 
      configPath: expandedPath 
    };
  } catch (error) {
    if (error instanceof Error) {
      return { 
        config: null, 
        configPath: null, 
        error: `Failed to load config file: ${error.message}` 
      };
    }
    return { 
      config: null, 
      configPath: null, 
      error: 'Failed to load config file: Unknown error' 
    };
  }
}

export function loadConfigFile(projectDir: string, customConfigPath?: string): ConfigLoadResult {
  // If custom config path is provided, use it
  if (customConfigPath) {
    return loadConfigFromPath(customConfigPath);
  }
  
  // Otherwise, look for default config in project directory
  try {
    const expandedDir = expandTilde(projectDir);
    const configDir = path.join(expandedDir, '.spec-workflow');
    const configPath = path.join(configDir, 'config.toml');
    
    if (!fs.existsSync(configPath)) {
      return { 
        config: null, 
        configPath: null 
      };
    }
    
    return loadConfigFromPath(configPath);
  } catch (error) {
    if (error instanceof Error) {
      return { 
        config: null, 
        configPath: null, 
        error: `Failed to load config file: ${error.message}` 
      };
    }
    return { 
      config: null, 
      configPath: null, 
      error: 'Failed to load config file: Unknown error' 
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

  Object.keys(cliArgs).forEach(key => {
    const value = cliArgs[key as keyof SpecWorkflowConfig];
    if (value !== undefined) {
      (merged as any)[key] = value;
    }
  });

  return merged;
}