import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  isLocalhostAddress,
  getSecurityConfig,
  DEFAULT_SECURITY_CONFIG,
  RateLimiter,
  AuditLogger,
  AuditLogEntry,
  getCorsConfig,
  createSecurityHeadersMiddleware
} from '../security-utils.js';
import { SecurityConfig } from '../../types.js';

describe('security-utils', () => {
  describe('isLocalhostAddress', () => {
    it('should return true for "localhost"', () => {
      expect(isLocalhostAddress('localhost')).toBe(true);
    });

    it('should return true for "127.0.0.1"', () => {
      expect(isLocalhostAddress('127.0.0.1')).toBe(true);
    });

    it('should return true for IPv6 localhost "::1"', () => {
      expect(isLocalhostAddress('::1')).toBe(true);
    });

    it('should return true for any 127.x.x.x address', () => {
      expect(isLocalhostAddress('127.0.0.2')).toBe(true);
      expect(isLocalhostAddress('127.1.2.3')).toBe(true);
      expect(isLocalhostAddress('127.255.255.255')).toBe(true);
    });

    it('should return false for "0.0.0.0"', () => {
      expect(isLocalhostAddress('0.0.0.0')).toBe(false);
    });

    it('should return false for external IP addresses', () => {
      expect(isLocalhostAddress('192.168.1.1')).toBe(false);
      expect(isLocalhostAddress('10.0.0.1')).toBe(false);
      expect(isLocalhostAddress('8.8.8.8')).toBe(false);
    });

    it('should return false for hostnames', () => {
      expect(isLocalhostAddress('example.com')).toBe(false);
      expect(isLocalhostAddress('myserver')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isLocalhostAddress('')).toBe(false);
    });
  });

  describe('DEFAULT_SECURITY_CONFIG', () => {
    it('should have secure defaults', () => {
      expect(DEFAULT_SECURITY_CONFIG.rateLimitEnabled).toBe(true);
      expect(DEFAULT_SECURITY_CONFIG.rateLimitPerMinute).toBe(120);
      expect(DEFAULT_SECURITY_CONFIG.auditLogEnabled).toBe(true);
      expect(DEFAULT_SECURITY_CONFIG.auditLogRetentionDays).toBe(30);
      expect(DEFAULT_SECURITY_CONFIG.corsEnabled).toBe(true);
      expect(DEFAULT_SECURITY_CONFIG.allowedOrigins).toContain('http://localhost:5000');
      expect(DEFAULT_SECURITY_CONFIG.allowedOrigins).toContain('http://127.0.0.1:5000');
    });
  });

  describe('getSecurityConfig', () => {
    it('should return defaults when no config provided', () => {
      const config = getSecurityConfig();
      // In non-production, dynamic origins include Vite dev server ports
      expect(config.rateLimitEnabled).toBe(DEFAULT_SECURITY_CONFIG.rateLimitEnabled);
      expect(config.rateLimitPerMinute).toBe(DEFAULT_SECURITY_CONFIG.rateLimitPerMinute);
      expect(config.auditLogEnabled).toBe(DEFAULT_SECURITY_CONFIG.auditLogEnabled);
      expect(config.auditLogRetentionDays).toBe(DEFAULT_SECURITY_CONFIG.auditLogRetentionDays);
      expect(config.corsEnabled).toBe(DEFAULT_SECURITY_CONFIG.corsEnabled);
      // allowedOrigins includes default port + Vite dev port (5173) in non-production
      expect(config.allowedOrigins).toContain('http://localhost:5000');
      expect(config.allowedOrigins).toContain('http://127.0.0.1:5000');
    });

    it('should merge user config with defaults', () => {
      const userConfig: Partial<SecurityConfig> = {
        rateLimitPerMinute: 100,
        auditLogEnabled: false
      };
      const config = getSecurityConfig(userConfig);
      
      expect(config.rateLimitPerMinute).toBe(100);
      expect(config.auditLogEnabled).toBe(false);
      // Other defaults preserved
      expect(config.rateLimitEnabled).toBe(true);
      expect(config.corsEnabled).toBe(true);
    });

    it('should allow complete override', () => {
      const fullConfig: SecurityConfig = {
        rateLimitEnabled: false,
        rateLimitPerMinute: 30,
        auditLogEnabled: false,
        auditLogRetentionDays: 7,
        corsEnabled: false,
        allowedOrigins: ['http://custom:3000']
      };
      const config = getSecurityConfig(fullConfig);
      expect(config).toEqual(fullConfig);
    });
  });

  describe('RateLimiter', () => {
    let rateLimiter: RateLimiter;

    beforeEach(() => {
      vi.useFakeTimers();
      rateLimiter = new RateLimiter({
        ...DEFAULT_SECURITY_CONFIG,
        rateLimitPerMinute: 3 // Low limit for testing
      });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should allow requests under the limit', () => {
      const result1 = rateLimiter.checkLimit('client1');
      const result2 = rateLimiter.checkLimit('client1');
      const result3 = rateLimiter.checkLimit('client1');

      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
      expect(result3.allowed).toBe(true);
    });

    it('should block requests over the limit', () => {
      // Use up all 3 allowed requests
      rateLimiter.checkLimit('client1');
      rateLimiter.checkLimit('client1');
      rateLimiter.checkLimit('client1');

      // 4th request should be blocked
      const result = rateLimiter.checkLimit('client1');
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeDefined();
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should track clients separately', () => {
      // Use up client1's limit
      rateLimiter.checkLimit('client1');
      rateLimiter.checkLimit('client1');
      rateLimiter.checkLimit('client1');

      // client2 should still be allowed
      const result = rateLimiter.checkLimit('client2');
      expect(result.allowed).toBe(true);
    });

    it('should reset after time window', () => {
      // Use up all requests
      rateLimiter.checkLimit('client1');
      rateLimiter.checkLimit('client1');
      rateLimiter.checkLimit('client1');

      // Should be blocked
      expect(rateLimiter.checkLimit('client1').allowed).toBe(false);

      // Advance time by 1 minute
      vi.advanceTimersByTime(60001);

      // Should be allowed again
      expect(rateLimiter.checkLimit('client1').allowed).toBe(true);
    });

    it('should return true when rate limiting is disabled', () => {
      const disabledLimiter = new RateLimiter({
        ...DEFAULT_SECURITY_CONFIG,
        rateLimitEnabled: false,
        rateLimitPerMinute: 1
      });

      // Make many requests
      for (let i = 0; i < 100; i++) {
        expect(disabledLimiter.checkLimit('client1').allowed).toBe(true);
      }
    });
  });

  describe('getCorsConfig', () => {
    it('should return false when CORS is disabled', () => {
      const config: SecurityConfig = {
        ...DEFAULT_SECURITY_CONFIG,
        corsEnabled: false
      };
      expect(getCorsConfig(config)).toBe(false);
    });

    it('should return config object when CORS is enabled', () => {
      const config: SecurityConfig = {
        ...DEFAULT_SECURITY_CONFIG,
        corsEnabled: true
      };
      const corsConfig = getCorsConfig(config);
      
      expect(corsConfig).not.toBe(false);
      expect(typeof corsConfig).toBe('object');
      expect(corsConfig).toHaveProperty('origin');
      expect(corsConfig).toHaveProperty('credentials', true);
      expect(corsConfig).toHaveProperty('methods');
    });

    it('should allow requests with no origin', () => {
      const config: SecurityConfig = {
        ...DEFAULT_SECURITY_CONFIG,
        corsEnabled: true
      };
      const corsConfig = getCorsConfig(config) as any;
      
      const callback = vi.fn();
      corsConfig.origin('', callback);
      
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('should allow requests from allowed origins', () => {
      const config: SecurityConfig = {
        ...DEFAULT_SECURITY_CONFIG,
        corsEnabled: true,
        allowedOrigins: ['http://localhost:5000', 'http://custom:3000']
      };
      const corsConfig = getCorsConfig(config) as any;
      
      const callback = vi.fn();
      corsConfig.origin('http://localhost:5000', callback);
      
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('should reject requests from non-allowed origins', () => {
      const config: SecurityConfig = {
        ...DEFAULT_SECURITY_CONFIG,
        corsEnabled: true,
        allowedOrigins: ['http://localhost:5000']
      };
      const corsConfig = getCorsConfig(config) as any;
      
      const callback = vi.fn();
      corsConfig.origin('http://malicious:8080', callback);
      
      expect(callback).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('createSecurityHeadersMiddleware', () => {
    it('should return a middleware function', () => {
      const middleware = createSecurityHeadersMiddleware();
      expect(typeof middleware).toBe('function');
    });

    it('should set security headers on reply', async () => {
      const middleware = createSecurityHeadersMiddleware();
      
      const headers: Record<string, string> = {};
      const mockReply = {
        header: vi.fn((name: string, value: string) => {
          headers[name] = value;
          return mockReply;
        })
      };
      const mockRequest = {};

      await middleware(mockRequest as any, mockReply as any);

      expect(mockReply.header).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(mockReply.header).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(mockReply.header).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
      expect(mockReply.header).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');
      expect(mockReply.header).toHaveBeenCalledWith('Content-Security-Policy', expect.any(String));
    });
  });

  describe('AuditLogger', () => {
    let testDir: string;

    beforeEach(async () => {
      testDir = join(tmpdir(), `audit-log-test-${Date.now()}`);
      await fs.mkdir(testDir, { recursive: true });
    });

    afterEach(async () => {
      try {
        await fs.rm(testDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    });

    it('should not log when audit logging is disabled', async () => {
      const logPath = join(testDir, 'audit.log');
      const logger = new AuditLogger({
        ...DEFAULT_SECURITY_CONFIG,
        auditLogEnabled: false,
        auditLogPath: logPath
      });

      await logger.log({
        timestamp: new Date().toISOString(),
        actor: '127.0.0.1',
        action: 'GET /api/test',
        resource: '/api/test',
        result: 'success'
      });

      // File should not exist since logging is disabled
      await expect(fs.access(logPath)).rejects.toThrow();
    });

    it('should initialize without throwing when disabled', async () => {
      const logger = new AuditLogger({
        ...DEFAULT_SECURITY_CONFIG,
        auditLogEnabled: false
      });

      await expect(logger.initialize()).resolves.not.toThrow();
    });

    it('should create log directory on initialize when enabled', async () => {
      const logDir = join(testDir, 'logs');
      const logPath = join(logDir, 'audit.log');
      const logger = new AuditLogger({
        ...DEFAULT_SECURITY_CONFIG,
        auditLogEnabled: true,
        auditLogPath: logPath
      });

      await logger.initialize();

      // Directory should exist
      const stats = await fs.stat(logDir);
      expect(stats.isDirectory()).toBe(true);
    });

    it('should write log entries as JSON lines', async () => {
      const logPath = join(testDir, 'audit.log');
      const logger = new AuditLogger({
        ...DEFAULT_SECURITY_CONFIG,
        auditLogEnabled: true,
        auditLogPath: logPath
      });

      await logger.initialize();

      const entry: AuditLogEntry = {
        timestamp: '2024-01-15T10:30:00.000Z',
        actor: '192.168.1.100',
        action: 'POST /api/specs',
        resource: '/api/specs',
        result: 'success',
        details: {
          statusCode: 201,
          duration: 45
        }
      };

      await logger.log(entry);

      // Read and verify log content
      const logContent = await fs.readFile(logPath, 'utf-8');
      const loggedEntry = JSON.parse(logContent.trim());

      expect(loggedEntry.timestamp).toBe('2024-01-15T10:30:00.000Z');
      expect(loggedEntry.actor).toBe('192.168.1.100');
      expect(loggedEntry.action).toBe('POST /api/specs');
      expect(loggedEntry.resource).toBe('/api/specs');
      expect(loggedEntry.result).toBe('success');
      expect(loggedEntry.details.statusCode).toBe(201);
      expect(loggedEntry.details.duration).toBe(45);
    });

    it('should append multiple log entries', async () => {
      const logPath = join(testDir, 'audit.log');
      const logger = new AuditLogger({
        ...DEFAULT_SECURITY_CONFIG,
        auditLogEnabled: true,
        auditLogPath: logPath
      });

      await logger.initialize();

      // Log three entries
      await logger.log({
        timestamp: '2024-01-15T10:00:00.000Z',
        actor: '127.0.0.1',
        action: 'GET /api/projects',
        resource: '/api/projects',
        result: 'success'
      });

      await logger.log({
        timestamp: '2024-01-15T10:01:00.000Z',
        actor: '127.0.0.1',
        action: 'POST /api/specs',
        resource: '/api/specs',
        result: 'success'
      });

      await logger.log({
        timestamp: '2024-01-15T10:02:00.000Z',
        actor: '10.0.0.5',
        action: 'DELETE /api/specs/test',
        resource: '/api/specs/test',
        result: 'denied'
      });

      // Read and verify all entries
      const logContent = await fs.readFile(logPath, 'utf-8');
      const lines = logContent.trim().split('\n');

      expect(lines).toHaveLength(3);

      const entry1 = JSON.parse(lines[0]);
      const entry2 = JSON.parse(lines[1]);
      const entry3 = JSON.parse(lines[2]);

      expect(entry1.action).toBe('GET /api/projects');
      expect(entry2.action).toBe('POST /api/specs');
      expect(entry3.action).toBe('DELETE /api/specs/test');
      expect(entry3.result).toBe('denied');
    });

    it('should log different result types correctly', async () => {
      const logPath = join(testDir, 'audit.log');
      const logger = new AuditLogger({
        ...DEFAULT_SECURITY_CONFIG,
        auditLogEnabled: true,
        auditLogPath: logPath
      });

      await logger.initialize();

      // Test all result types
      await logger.log({
        timestamp: new Date().toISOString(),
        actor: '127.0.0.1',
        action: 'GET /api/test',
        resource: '/api/test',
        result: 'success'
      });

      await logger.log({
        timestamp: new Date().toISOString(),
        actor: '127.0.0.1',
        action: 'GET /api/error',
        resource: '/api/error',
        result: 'failure'
      });

      await logger.log({
        timestamp: new Date().toISOString(),
        actor: '127.0.0.1',
        action: 'GET /api/protected',
        resource: '/api/protected',
        result: 'denied'
      });

      const logContent = await fs.readFile(logPath, 'utf-8');
      const lines = logContent.trim().split('\n');

      expect(JSON.parse(lines[0]).result).toBe('success');
      expect(JSON.parse(lines[1]).result).toBe('failure');
      expect(JSON.parse(lines[2]).result).toBe('denied');
    });

    it('should use workspace root path when auditLogPath not specified', async () => {
      const workspaceRoot = testDir;
      const logger = new AuditLogger({
        ...DEFAULT_SECURITY_CONFIG,
        auditLogEnabled: true
        // No auditLogPath specified
      }, workspaceRoot);

      await logger.initialize();

      await logger.log({
        timestamp: new Date().toISOString(),
        actor: '127.0.0.1',
        action: 'GET /test',
        resource: '/test',
        result: 'success'
      });

      // Should have created log at workspaceRoot/.spec-workflow/audit.log
      const expectedLogPath = join(workspaceRoot, '.spec-workflow', 'audit.log');
      const logContent = await fs.readFile(expectedLogPath, 'utf-8');
      const entry = JSON.parse(logContent.trim());

      expect(entry.action).toBe('GET /test');
    });

    it('should include optional details in log entries', async () => {
      const logPath = join(testDir, 'audit.log');
      const logger = new AuditLogger({
        ...DEFAULT_SECURITY_CONFIG,
        auditLogEnabled: true,
        auditLogPath: logPath
      });

      await logger.initialize();

      await logger.log({
        timestamp: new Date().toISOString(),
        actor: '192.168.1.50',
        action: 'PUT /api/specs/feature/tasks',
        resource: '/api/specs/feature/tasks',
        result: 'success',
        details: {
          statusCode: 200,
          duration: 123,
          userAgent: 'Mozilla/5.0 Test Browser',
          customField: 'custom-value'
        }
      });

      const logContent = await fs.readFile(logPath, 'utf-8');
      const entry = JSON.parse(logContent.trim());

      expect(entry.details).toBeDefined();
      expect(entry.details.statusCode).toBe(200);
      expect(entry.details.duration).toBe(123);
      expect(entry.details.userAgent).toBe('Mozilla/5.0 Test Browser');
      expect(entry.details.customField).toBe('custom-value');
    });

    describe('middleware', () => {
      it('should return a middleware function', () => {
        const logger = new AuditLogger({
          ...DEFAULT_SECURITY_CONFIG,
          auditLogEnabled: true
        });

        const middleware = logger.middleware();
        expect(typeof middleware).toBe('function');
      });

      it('should register then callback on reply for post-response logging', async () => {
        const logPath = join(testDir, 'audit.log');
        const logger = new AuditLogger({
          ...DEFAULT_SECURITY_CONFIG,
          auditLogEnabled: true,
          auditLogPath: logPath
        });

        await logger.initialize();

        const middleware = logger.middleware();

        let thenCallback: Function | null = null;
        const mockReply = {
          statusCode: 200,
          then: vi.fn((onFulfilled: Function, _onRejected: Function) => {
            thenCallback = onFulfilled;
          })
        };

        const mockRequest = {
          ip: '10.0.0.1',
          method: 'GET',
          url: '/api/projects/list',
          headers: {
            'user-agent': 'Test Agent/1.0'
          }
        };

        await middleware(mockRequest as any, mockReply as any);

        // Verify reply.then was called
        expect(mockReply.then).toHaveBeenCalled();
        expect(thenCallback).not.toBeNull();

        // Trigger the then callback to actually log
        await thenCallback!();
        
        // Wait for async log write to complete
        await new Promise(resolve => setTimeout(resolve, 50));

        // Verify log was written
        const logContent = await fs.readFile(logPath, 'utf-8');
        const entry = JSON.parse(logContent.trim());

        expect(entry.actor).toBe('10.0.0.1');
        expect(entry.action).toBe('GET /api/projects/list');
        expect(entry.resource).toBe('/api/projects/list');
        expect(entry.result).toBe('success');
        expect(entry.details.statusCode).toBe(200);
        expect(entry.details.userAgent).toBe('Test Agent/1.0');
      });

      it('should log "denied" result for 401 status code', async () => {
        const logPath = join(testDir, 'audit.log');
        const logger = new AuditLogger({
          ...DEFAULT_SECURITY_CONFIG,
          auditLogEnabled: true,
          auditLogPath: logPath
        });

        await logger.initialize();

        const middleware = logger.middleware();

        let thenCallback: Function | null = null;
        const mockReply = {
          statusCode: 401,
          then: vi.fn((onFulfilled: Function, _onRejected: Function) => {
            thenCallback = onFulfilled;
          })
        };

        const mockRequest = {
          ip: '192.168.1.1',
          method: 'GET',
          url: '/api/admin',
          headers: {}
        };

        await middleware(mockRequest as any, mockReply as any);
        await thenCallback!();
        await new Promise(resolve => setTimeout(resolve, 50));

        const logContent = await fs.readFile(logPath, 'utf-8');
        const entry = JSON.parse(logContent.trim());

        expect(entry.result).toBe('denied');
      });

      it('should log "denied" result for 403 status code', async () => {
        const logPath = join(testDir, 'audit.log');
        const logger = new AuditLogger({
          ...DEFAULT_SECURITY_CONFIG,
          auditLogEnabled: true,
          auditLogPath: logPath
        });

        await logger.initialize();

        const middleware = logger.middleware();

        let thenCallback: Function | null = null;
        const mockReply = {
          statusCode: 403,
          then: vi.fn((onFulfilled: Function, _onRejected: Function) => {
            thenCallback = onFulfilled;
          })
        };

        const mockRequest = {
          ip: '192.168.1.1',
          method: 'DELETE',
          url: '/api/protected-resource',
          headers: {}
        };

        await middleware(mockRequest as any, mockReply as any);
        await thenCallback!();
        await new Promise(resolve => setTimeout(resolve, 50));

        const logContent = await fs.readFile(logPath, 'utf-8');
        const entry = JSON.parse(logContent.trim());

        expect(entry.result).toBe('denied');
      });

      it('should log "failure" result for 500 status code', async () => {
        const logPath = join(testDir, 'audit.log');
        const logger = new AuditLogger({
          ...DEFAULT_SECURITY_CONFIG,
          auditLogEnabled: true,
          auditLogPath: logPath
        });

        await logger.initialize();

        const middleware = logger.middleware();

        let thenCallback: Function | null = null;
        const mockReply = {
          statusCode: 500,
          then: vi.fn((onFulfilled: Function, _onRejected: Function) => {
            thenCallback = onFulfilled;
          })
        };

        const mockRequest = {
          ip: '127.0.0.1',
          method: 'POST',
          url: '/api/specs',
          headers: {}
        };

        await middleware(mockRequest as any, mockReply as any);
        await thenCallback!();
        await new Promise(resolve => setTimeout(resolve, 50));

        const logContent = await fs.readFile(logPath, 'utf-8');
        const entry = JSON.parse(logContent.trim());

        expect(entry.result).toBe('failure');
      });

      it('should use "unknown" for missing IP address', async () => {
        const logPath = join(testDir, 'audit.log');
        const logger = new AuditLogger({
          ...DEFAULT_SECURITY_CONFIG,
          auditLogEnabled: true,
          auditLogPath: logPath
        });

        await logger.initialize();

        const middleware = logger.middleware();

        let thenCallback: Function | null = null;
        const mockReply = {
          statusCode: 200,
          then: vi.fn((onFulfilled: Function, _onRejected: Function) => {
            thenCallback = onFulfilled;
          })
        };

        const mockRequest = {
          // No ip property
          method: 'GET',
          url: '/api/test',
          headers: {}
        };

        await middleware(mockRequest as any, mockReply as any);
        await thenCallback!();
        await new Promise(resolve => setTimeout(resolve, 50));

        const logContent = await fs.readFile(logPath, 'utf-8');
        const entry = JSON.parse(logContent.trim());

        expect(entry.actor).toBe('unknown');
      });
    });
  });
});

