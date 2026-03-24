import * as fs from 'fs/promises';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { User, Agent, AuthTokenResponse } from '../types.js';

// JWT Secret Key (in production this should come from process.env)
const JWT_SECRET = process.env.SPEC_WORKFLOW_JWT_SECRET || 'fs-factory-super-secret-key-change-me';
const TOKEN_EXPIRATION = '24h';

export class AuthService {
  private authDataPath: string;

  constructor(workspacePath: string) {
    // We'll store the local auth data inside the .spec-workflow directory of the workspace
    this.authDataPath = path.join(workspacePath, '.spec-workflow', 'auth.json');
  }

  /**
   * Initialize auth data file if it doesn't exist
   */
  async initialize(): Promise<void> {
    try {
      await fs.access(this.authDataPath);
    } catch {
      // File doesn't exist, create it with empty structural data
      const initialData = {
        users: [],
        agents: []
      };
      
      const dir = path.dirname(this.authDataPath);
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
      }
      
      await fs.writeFile(this.authDataPath, JSON.stringify(initialData, null, 2), 'utf-8');
      console.log(`Initialized auth storage at: ${this.authDataPath}`);
    }
  }

  /**
   * Load the current auth data
   */
  private async loadAuthData(): Promise<{ users: User[], agents: Agent[] }> {
    try {
      const data = await fs.readFile(this.authDataPath, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Failed to load auth data:', err);
      return { users: [], agents: [] };
    }
  }

  /**
   * Save the auth data
   */
  private async saveAuthData(data: { users: User[], agents: Agent[] }): Promise<void> {
    await fs.writeFile(this.authDataPath, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Authenticate a human user
   */
  async authenticateUser(email: string, passwordPlain: string): Promise<AuthTokenResponse | null> {
    const data = await this.loadAuthData();
    const user = data.users.find(u => u.email === email);
    
    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isMatch) {
      return null;
    }

    const token = this.generateToken({ id: user.id, role: user.role, type: 'human' });
    return { token, user: { id: user.id, email: user.email, role: user.role } };
  }

  /**
   * Authenticate an AI Agent (M2M) via API Key
   */
  async authenticateAgent(agentName: string, apiKey: string): Promise<AuthTokenResponse | null> {
    const data = await this.loadAuthData();
    const agent = data.agents.find(a => a.name === agentName);
    
    if (!agent) {
      return null;
    }

    // Agent keys can also be hashed for security, but we might just match exactly if we prefer simple tokens.
    // Let's assume the key is hashed in auth.json
    const isMatch = await bcrypt.compare(apiKey, agent.keyHash);
    if (!isMatch) {
      return null;
    }

    const token = this.generateToken({ id: agent.id, role: agent.role, type: 'agent' });
    return { token, agent: { id: agent.id, name: agent.name, role: agent.role } };
  }

  /**
   * Generate JWT Token
   */
  private generateToken(payload: object): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
  }

  /**
   * Verify JWT Token
   */
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return null;
    }
  }

  /**
   * Helper utility to create a default admin user if none exists
   */
  async ensureDefaultAdmin(adminEmail: string, adminPass: string): Promise<void> {
    const data = await this.loadAuthData();
    if (data.users.length === 0) {
      const passwordHash = await bcrypt.hash(adminPass, 10);
      data.users.push({
        id: randomUUID(),
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
        createdAt: new Date().toISOString()
      });
      await this.saveAuthData(data);
      console.log(`Created default admin user: ${adminEmail}`);
    }
  }
}
