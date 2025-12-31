/**
 * Security utilities for rate limiting and audit logging
 * Implements security best practices for MCP servers
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { writeFile, appendFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { SecurityConfig } from '../types.js';

// Default port for the dashboard
export const DEFAULT_DASHBOARD_PORT = 5000;

// Default security configuration (secure by default)
// Note: allowedOrigins should be dynamically generated based on the actual port
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  rateLimitEnabled: true,
  rateLimitPerMinute: 120, // 120 requests per minute per client
  auditLogEnabled: true,
  auditLogRetentionDays: 30,
  corsEnabled: true,
  allowedOrigins: [`http://localhost:${DEFAULT_DASHBOARD_PORT}`, `http://127.0.0.1:${DEFAULT_DASHBOARD_PORT}`]
};

// Default Vite dev server port (used when running frontend in dev mode)
export const VITE_DEV_PORT = 5173;

/**
 * Generate allowed origins for CORS based on the actual port
 * @param port - The port the dashboard is running on
 * @returns Array of allowed origin URLs
 */
export function generateAllowedOrigins(port: number): string[] {
  const origins = [`http://localhost:${port}`, `http://127.0.0.1:${port}`];

  // In development, also allow Vite dev server origin (port 5173)
  // The Vite proxy forwards requests but preserves the Origin header
  if (process.env.NODE_ENV === 'development') {
    origins.push(`http://localhost:${VITE_DEV_PORT}`, `http://127.0.0.1:${VITE_DEV_PORT}`);
  }

  return origins;
}

/**
 * Check if an IP address is localhost
 * @param address - IP address or hostname to check
 * @returns true if the address is localhost (127.x.x.x, localhost, or ::1)
 */
export function isLocalhostAddress(address: string): boolean {
  return address === 'localhost' ||
         address === '::1' || // IPv6 localhost
         address.startsWith('127.'); // Any 127.x.x.x address (includes 127.0.0.1)
}

/**
 * Get security configuration with secure defaults
 * Note: Network binding validation (bindAddress/allowExternalAccess) is handled separately at the config layer
 * @param userConfig - Optional user-provided security configuration overrides
 * @param port - The port the dashboard is running on (used to generate dynamic allowedOrigins)
 */
export function getSecurityConfig(userConfig?: Partial<SecurityConfig>, port?: number): SecurityConfig {
  const actualPort = port || DEFAULT_DASHBOARD_PORT;

  // Generate dynamic allowedOrigins based on the actual port if not explicitly provided
  const dynamicAllowedOrigins = generateAllowedOrigins(actualPort);

  const config = {
    ...DEFAULT_SECURITY_CONFIG,
    allowedOrigins: dynamicAllowedOrigins,
    ...userConfig
  };

  return config;
}

/**
 * Rate limiting implementation
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: SecurityConfig;

  constructor(config: SecurityConfig) {
    this.config = config;

    // Clean up old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Check if request should be rate limited
   */
  public checkLimit(clientId: string): { allowed: boolean; retryAfter?: number } {
    if (!this.config.rateLimitEnabled) {
      return { allowed: true };
    }

    const now = Date.now();
    const windowMs = 60000; // 1 minute window
    const maxRequests = this.config.rateLimitPerMinute;

    // Get client request history
    const requests = this.requests.get(clientId) || [];

    // Filter to requests within the current window
    const recentRequests = requests.filter(timestamp => now - timestamp < windowMs);

    // Check if limit exceeded
    if (recentRequests.length >= maxRequests) {
      const oldestRequest = recentRequests[0];
      const retryAfter = Math.ceil((oldestRequest + windowMs - now) / 1000);
      return { allowed: false, retryAfter };
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(clientId, recentRequests);

    return { allowed: true };
  }

  /**
   * Create rate limiting middleware
   */
  public middleware() {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      // Use IP address as client identifier
      const clientId = request.ip || 'unknown';

      const result = this.checkLimit(clientId);

      if (!result.allowed) {
        return reply
          .code(429)
          .header('Retry-After', String(result.retryAfter || 60))
          .send({
            error: 'Too Many Requests',
            message: `Rate limit exceeded. Maximum ${this.config.rateLimitPerMinute} requests per minute.`,
            retryAfter: result.retryAfter
          });
      }
    };
  }

  /**
   * Clean up old request records
   */
  private cleanup() {
    const now = Date.now();
    const windowMs = 60000;

    for (const [clientId, requests] of this.requests.entries()) {
      const recentRequests = requests.filter(timestamp => now - timestamp < windowMs);
      if (recentRequests.length === 0) {
        this.requests.delete(clientId);
      } else {
        this.requests.set(clientId, recentRequests);
      }
    }
  }
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  timestamp: string;
  actor: string; // IP address of the client
  action: string; // HTTP method and path
  resource: string; // Resource being accessed
  result: 'success' | 'failure' | 'denied';
  details?: Record<string, any>;
}

/**
 * Audit logger for security events
 */
export class AuditLogger {
  private config: SecurityConfig;
  private logPath: string;

  constructor(config: SecurityConfig, workspaceRoot?: string) {
    this.config = config;

    // Determine audit log path
    if (config.auditLogPath) {
      this.logPath = config.auditLogPath;
    } else if (workspaceRoot) {
      this.logPath = join(workspaceRoot, '.spec-workflow', 'audit.log');
    } else {
      // Fallback to temp directory
      this.logPath = join(process.cwd(), 'audit.log');
    }
  }

  /**
   * Initialize audit log (create directory if needed)
   */
  async initialize(): Promise<void> {
    if (!this.config.auditLogEnabled) {
      return;
    }

    try {
      const logDir = join(this.logPath, '..');
      await mkdir(logDir, { recursive: true });
    } catch (error) {
      console.error('Failed to initialize audit log:', error);
    }
  }

  /**
   * Log an audit event
   */
  async log(entry: AuditLogEntry): Promise<void> {
    if (!this.config.auditLogEnabled) {
      return;
    }

    try {
      const logLine = JSON.stringify(entry) + '\n';
      await appendFile(this.logPath, logLine, 'utf-8');
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  /**
   * Create audit logging middleware
   */
  middleware() {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const startTime = Date.now();

      // Log after response is sent using reply.then() which fires after response completes
      reply.then(
        () => {
          const entry: AuditLogEntry = {
            timestamp: new Date().toISOString(),
            actor: request.ip || 'unknown',
            action: `${request.method} ${request.url}`,
            resource: request.url,
            result: reply.statusCode < 400 ? 'success' : reply.statusCode === 401 || reply.statusCode === 403 ? 'denied' : 'failure',
            details: {
              statusCode: reply.statusCode,
              duration: Date.now() - startTime,
              userAgent: request.headers['user-agent']
            }
          };

          // Fire and forget - don't await to avoid blocking
          this.log(entry).catch(() => {});
        },
        () => {} // Ignore errors from reply.then
      );
    };
  }
}

/**
 * Security headers middleware
 * @param port - The port the dashboard is running on (used for CSP connect-src for WebSocket)
 */
export function createSecurityHeadersMiddleware(port?: number) {
  const actualPort = port || DEFAULT_DASHBOARD_PORT;

  // Build connect-src directive with WebSocket endpoints
  let connectSrc = `'self' ws://localhost:${actualPort} ws://127.0.0.1:${actualPort}`;

  // In development, also allow Vite dev server connections
  if (process.env.NODE_ENV !== 'production') {
    connectSrc += ` ws://localhost:${VITE_DEV_PORT} ws://127.0.0.1:${VITE_DEV_PORT}`;
  }

  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Add security headers
    reply.header('X-Content-Type-Options', 'nosniff'); // Prevent MIME type sniffing
    reply.header('X-Frame-Options', 'DENY'); // Prevent clickjacking
    reply.header('X-XSS-Protection', '1; mode=block'); // Enable XSS protection
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin'); // Prevent referrer leakage

    // CSP for dashboard
    // Note: cdn.jsdelivr.net is required for highlight.js stylesheets used by the MDX editor
    // connect-src allows WebSocket connections to the dashboard on the actual port
    reply.header(
      'Content-Security-Policy',
      `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data:; connect-src ${connectSrc};`
    );
  };
}

/**
 * CORS configuration
 */
export function getCorsConfig(config: SecurityConfig) {
  if (!config.corsEnabled) {
    return false; // Disable CORS
  }

  return {
    origin: (origin: string, callback: (error: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (e.g., curl, Postman)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Check if origin is in allowed list
      if (config.allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
  };
}

