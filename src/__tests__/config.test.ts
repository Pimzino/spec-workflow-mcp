import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { loadConfigFromPath, loadConfigFile, mergeConfigs, SpecWorkflowConfig } from '../config.js';

describe('config', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), `spec-workflow-config-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('loadConfigFromPath', () => {
    it('should load basic config successfully', async () => {
      const configPath = join(testDir, 'config.toml');
      const configContent = `
port = 8080
dashboardOnly = true
lang = "ja"
`;
      await fs.writeFile(configPath, configContent);

      const result = loadConfigFromPath(configPath);
      
      expect(result.error).toBeUndefined();
      expect(result.config).not.toBeNull();
      expect(result.config?.port).toBe(8080);
      expect(result.config?.dashboardOnly).toBe(true);
      expect(result.config?.lang).toBe('ja');
    });

    it('should load network configuration (bindAddress, allowExternalAccess)', async () => {
      const configPath = join(testDir, 'config.toml');
      const configContent = `
port = 5000
bindAddress = "0.0.0.0"
allowExternalAccess = true
`;
      await fs.writeFile(configPath, configContent);

      const result = loadConfigFromPath(configPath);
      
      expect(result.error).toBeUndefined();
      expect(result.config).not.toBeNull();
      expect(result.config?.bindAddress).toBe('0.0.0.0');
      expect(result.config?.allowExternalAccess).toBe(true);
    });

    it('should load security features configuration', async () => {
      const configPath = join(testDir, 'config.toml');
      const configContent = `
port = 5000

[security]
rateLimitEnabled = true
rateLimitPerMinute = 100
auditLogEnabled = false
`;
      await fs.writeFile(configPath, configContent);

      const result = loadConfigFromPath(configPath);
      
      expect(result.error).toBeUndefined();
      expect(result.config).not.toBeNull();
      expect(result.config?.security?.rateLimitEnabled).toBe(true);
      expect(result.config?.security?.rateLimitPerMinute).toBe(100);
      expect(result.config?.security?.auditLogEnabled).toBe(false);
    });

    it('should error if config file not found', () => {
      const result = loadConfigFromPath(join(testDir, 'nonexistent.toml'));
      
      expect(result.config).toBeNull();
      expect(result.error).toContain('not found');
    });

    it('should error on invalid port (below 1024)', async () => {
      const configPath = join(testDir, 'config.toml');
      await fs.writeFile(configPath, 'port = 80');

      const result = loadConfigFromPath(configPath);
      
      expect(result.config).toBeNull();
      expect(result.error).toContain('Invalid port');
    });

    it('should error on invalid port (above 65535)', async () => {
      const configPath = join(testDir, 'config.toml');
      await fs.writeFile(configPath, 'port = 70000');

      const result = loadConfigFromPath(configPath);
      
      expect(result.config).toBeNull();
      expect(result.error).toContain('Invalid port');
    });

    describe('network security validation', () => {
      it('should allow localhost binding without explicit allowExternalAccess', async () => {
        const configPath = join(testDir, 'config.toml');
        const configContent = `
bindAddress = "127.0.0.1"
`;
        await fs.writeFile(configPath, configContent);

        const result = loadConfigFromPath(configPath);
        
        expect(result.error).toBeUndefined();
        expect(result.config?.bindAddress).toBe('127.0.0.1');
      });

      it('should allow "localhost" binding without explicit allowExternalAccess', async () => {
        const configPath = join(testDir, 'config.toml');
        const configContent = `
bindAddress = "localhost"
`;
        await fs.writeFile(configPath, configContent);

        const result = loadConfigFromPath(configPath);
        
        expect(result.error).toBeUndefined();
        expect(result.config?.bindAddress).toBe('localhost');
      });

      it('should allow IPv6 localhost "::1" without explicit allowExternalAccess', async () => {
        const configPath = join(testDir, 'config.toml');
        const configContent = `
bindAddress = "::1"
`;
        await fs.writeFile(configPath, configContent);

        const result = loadConfigFromPath(configPath);
        
        expect(result.error).toBeUndefined();
        expect(result.config?.bindAddress).toBe('::1');
      });

      it('should allow any 127.x.x.x address without explicit allowExternalAccess', async () => {
        const configPath = join(testDir, 'config.toml');
        const configContent = `
bindAddress = "127.0.0.2"
`;
        await fs.writeFile(configPath, configContent);

        const result = loadConfigFromPath(configPath);
        
        expect(result.error).toBeUndefined();
        expect(result.config?.bindAddress).toBe('127.0.0.2');
      });

      it('should error on non-localhost binding without allowExternalAccess', async () => {
        const configPath = join(testDir, 'config.toml');
        const configContent = `
bindAddress = "0.0.0.0"
`;
        await fs.writeFile(configPath, configContent);

        const result = loadConfigFromPath(configPath);
        
        expect(result.config).toBeNull();
        expect(result.error).toContain('non-localhost');
        expect(result.error).toContain('allowExternalAccess');
      });

      it('should error on external IP binding without allowExternalAccess', async () => {
        const configPath = join(testDir, 'config.toml');
        const configContent = `
bindAddress = "192.168.1.100"
`;
        await fs.writeFile(configPath, configContent);

        const result = loadConfigFromPath(configPath);
        
        expect(result.config).toBeNull();
        expect(result.error).toContain('non-localhost');
      });

      it('should allow non-localhost binding with explicit allowExternalAccess = true', async () => {
        const configPath = join(testDir, 'config.toml');
        const configContent = `
bindAddress = "0.0.0.0"
allowExternalAccess = true
`;
        await fs.writeFile(configPath, configContent);

        const result = loadConfigFromPath(configPath);
        
        expect(result.error).toBeUndefined();
        expect(result.config?.bindAddress).toBe('0.0.0.0');
        expect(result.config?.allowExternalAccess).toBe(true);
      });

      it('should error on non-localhost binding with allowExternalAccess = false', async () => {
        const configPath = join(testDir, 'config.toml');
        const configContent = `
bindAddress = "0.0.0.0"
allowExternalAccess = false
`;
        await fs.writeFile(configPath, configContent);

        const result = loadConfigFromPath(configPath);
        
        expect(result.config).toBeNull();
        expect(result.error).toContain('non-localhost');
      });
    });

    describe('security features validation', () => {
      it('should error on invalid rateLimitPerMinute (not positive)', async () => {
        const configPath = join(testDir, 'config.toml');
        const configContent = `
[security]
rateLimitPerMinute = 0
`;
        await fs.writeFile(configPath, configContent);

        const result = loadConfigFromPath(configPath);
        
        expect(result.config).toBeNull();
        expect(result.error).toContain('rateLimitPerMinute');
      });

      it('should error on invalid auditLogRetentionDays (not positive)', async () => {
        const configPath = join(testDir, 'config.toml');
        const configContent = `
[security]
auditLogRetentionDays = -5
`;
        await fs.writeFile(configPath, configContent);

        const result = loadConfigFromPath(configPath);
        
        expect(result.config).toBeNull();
        expect(result.error).toContain('auditLogRetentionDays');
      });
    });
  });

  describe('loadConfigFile', () => {
    it('should return null config when no config file exists', async () => {
      const result = loadConfigFile(testDir);
      
      expect(result.config).toBeNull();
      expect(result.configPath).toBeNull();
      expect(result.error).toBeUndefined();
    });

    it('should load config from .spec-workflow/config.toml', async () => {
      const configDir = join(testDir, '.spec-workflow');
      await fs.mkdir(configDir, { recursive: true });
      await fs.writeFile(join(configDir, 'config.toml'), 'port = 9000');

      const result = loadConfigFile(testDir);
      
      expect(result.error).toBeUndefined();
      expect(result.config?.port).toBe(9000);
    });

    it('should use custom config path when provided', async () => {
      const customPath = join(testDir, 'custom-config.toml');
      await fs.writeFile(customPath, 'port = 7777');

      const result = loadConfigFile(testDir, customPath);
      
      expect(result.error).toBeUndefined();
      expect(result.config?.port).toBe(7777);
    });
  });

  describe('mergeConfigs', () => {
    it('should return CLI args when file config is null', () => {
      const cliArgs: Partial<SpecWorkflowConfig> = { port: 5000 };
      const merged = mergeConfigs(null, cliArgs);
      
      expect(merged.port).toBe(5000);
    });

    it('should use file config when CLI args are empty', () => {
      const fileConfig: SpecWorkflowConfig = {
        port: 8080,
        lang: 'en'
      };
      const merged = mergeConfigs(fileConfig, {});
      
      expect(merged.port).toBe(8080);
      expect(merged.lang).toBe('en');
    });

    it('should override file config with CLI args', () => {
      const fileConfig: SpecWorkflowConfig = {
        port: 8080,
        lang: 'en',
        bindAddress: '127.0.0.1'
      };
      const cliArgs: Partial<SpecWorkflowConfig> = {
        port: 5000
      };
      const merged = mergeConfigs(fileConfig, cliArgs);
      
      expect(merged.port).toBe(5000); // CLI override
      expect(merged.lang).toBe('en'); // File config preserved
      expect(merged.bindAddress).toBe('127.0.0.1'); // File config preserved
    });

    it('should not override with undefined CLI args', () => {
      const fileConfig: SpecWorkflowConfig = {
        port: 8080
      };
      const cliArgs: Partial<SpecWorkflowConfig> = {
        port: undefined,
        lang: 'ja'
      };
      const merged = mergeConfigs(fileConfig, cliArgs);
      
      expect(merged.port).toBe(8080); // Not overridden by undefined
      expect(merged.lang).toBe('ja');
    });
  });
});

