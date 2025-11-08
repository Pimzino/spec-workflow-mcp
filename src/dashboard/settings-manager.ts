import { homedir } from 'os';
import { join } from 'path';
import { promises as fs } from 'fs';
import { GlobalSettings, AutomationJob } from '../types.js';

export class SettingsManager {
  private settingsPath: string;
  private settingsDir: string;

  constructor() {
    this.settingsDir = join(homedir(), '.spec-workflow-mcp');
    this.settingsPath = join(this.settingsDir, 'settings.json');
  }

  /**
   * Ensure the settings directory exists
   */
  private async ensureSettingsDir(): Promise<void> {
    try {
      await fs.mkdir(this.settingsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore
    }
  }

  /**
   * Load global settings from file
   */
  async loadSettings(): Promise<GlobalSettings> {
    await this.ensureSettingsDir();

    try {
      const content = await fs.readFile(this.settingsPath, 'utf-8');
      // Handle empty or whitespace-only files
      const trimmedContent = content.trim();
      if (!trimmedContent) {
        console.error(`[SettingsManager] Warning: ${this.settingsPath} is empty, using default settings`);
        const defaultSettings = {
          automationJobs: [],
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        };
        // Write default settings to file
        await this.saveSettings(defaultSettings);
        return defaultSettings;
      }
      return JSON.parse(trimmedContent) as GlobalSettings;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // File doesn't exist yet, create it with default settings
        const defaultSettings = {
          automationJobs: [],
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        };
        await this.saveSettings(defaultSettings);
        return defaultSettings;
      }
      if (error instanceof SyntaxError) {
        // JSON parsing error - file is corrupted or invalid
        console.error(`[SettingsManager] Error: Failed to parse ${this.settingsPath}: ${error.message}`);
        console.error(`[SettingsManager] The file may be corrupted. Using default settings.`);
        // Back up the corrupted file
        try {
          const backupPath = `${this.settingsPath}.corrupted.${Date.now()}`;
          await fs.copyFile(this.settingsPath, backupPath);
          console.error(`[SettingsManager] Corrupted file backed up to: ${backupPath}`);
        } catch (backupError) {
          // Ignore backup errors
        }
        const defaultSettings = {
          automationJobs: [],
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        };
        // Write default settings to file
        await this.saveSettings(defaultSettings);
        return defaultSettings;
      }
      throw error;
    }
  }

  /**
   * Save global settings to file atomically
   */
  async saveSettings(settings: GlobalSettings): Promise<void> {
    await this.ensureSettingsDir();

    // Update modification timestamp
    settings.lastModified = new Date().toISOString();
    if (!settings.createdAt) {
      settings.createdAt = new Date().toISOString();
    }

    const content = JSON.stringify(settings, null, 2);

    // Write to temporary file first, then rename for atomic operation
    const tempPath = `${this.settingsPath}.tmp`;
    await fs.writeFile(tempPath, content, 'utf-8');
    await fs.rename(tempPath, this.settingsPath);
  }

  /**
   * Get a specific automation job by ID
   */
  async getJob(jobId: string): Promise<AutomationJob | null> {
    const settings = await this.loadSettings();
    return settings.automationJobs.find(job => job.id === jobId) || null;
  }

  /**
   * Get all automation jobs
   */
  async getAllJobs(): Promise<AutomationJob[]> {
    const settings = await this.loadSettings();
    return settings.automationJobs;
  }

  /**
   * Add a new automation job
   */
  async addJob(job: AutomationJob): Promise<void> {
    const settings = await this.loadSettings();

    // Check for duplicate ID
    if (settings.automationJobs.some(j => j.id === job.id)) {
      throw new Error(`Job with ID ${job.id} already exists`);
    }

    settings.automationJobs.push(job);
    await this.saveSettings(settings);
  }

  /**
   * Update an existing automation job
   */
  async updateJob(jobId: string, updates: Partial<AutomationJob>): Promise<void> {
    const settings = await this.loadSettings();
    const jobIndex = settings.automationJobs.findIndex(j => j.id === jobId);

    if (jobIndex === -1) {
      throw new Error(`Job with ID ${jobId} not found`);
    }

    // Merge updates, but don't allow changing ID or type
    settings.automationJobs[jobIndex] = {
      ...settings.automationJobs[jobIndex],
      ...updates,
      id: settings.automationJobs[jobIndex].id,
      type: settings.automationJobs[jobIndex].type
    };

    await this.saveSettings(settings);
  }

  /**
   * Delete an automation job
   */
  async deleteJob(jobId: string): Promise<void> {
    const settings = await this.loadSettings();
    const originalLength = settings.automationJobs.length;

    settings.automationJobs = settings.automationJobs.filter(j => j.id !== jobId);

    if (settings.automationJobs.length === originalLength) {
      throw new Error(`Job with ID ${jobId} not found`);
    }

    await this.saveSettings(settings);
  }

  /**
   * Get the settings file path
   */
  getSettingsPath(): string {
    return this.settingsPath;
  }

  /**
   * Get the settings directory path
   */
  getSettingsDir(): string {
    return this.settingsDir;
  }
}
