/**
 * N8N Dispatcher — FS Factory Integration
 *
 * Dispatches spec lifecycle events to a configured N8N webhook endpoint.
 * Configure via environment variable: SPEC_WORKFLOW_N8N_WEBHOOK_URL
 *
 * Events dispatched:
 * - spec.created   → new spec file detected
 * - spec.updated   → spec document modified
 * - spec.approved  → spec moved from pending to approved state
 * - task.started   → task status changed to in-progress
 * - task.completed → task status changed to completed
 * - spec.deployed  → spec archived (treated as deployed/done)
 */

export type SpecWorkflowEventType =
  | 'spec.created'
  | 'spec.updated'
  | 'spec.approved'
  | 'task.started'
  | 'task.completed'
  | 'spec.deployed'
  | 'login.success'
  | 'login.failed';

export interface SpecWorkflowEvent {
  /** Event type following the spec lifecycle */
  type: SpecWorkflowEventType;
  /** Internal project ID in the dashboard */
  projectId: string;
  /** Human-readable project name */
  projectName: string;
  /** Spec name in kebab-case */
  specName: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Additional context depending on the event type */
  metadata: Record<string, unknown>;
}

export interface N8NDispatcherOptions {
  /** N8N webhook URL. If not set, dispatcher is disabled. */
  webhookUrl?: string;
  /** Maximum number of retries on failure (default: 2) */
  maxRetries?: number;
  /** Timeout in ms for each HTTP request (default: 5000) */
  timeoutMs?: number;
}

export class N8NDispatcher {
  private webhookUrl: string | undefined;
  private maxRetries: number;
  private timeoutMs: number;
  private enabled: boolean;

  constructor(options: N8NDispatcherOptions = {}) {
    // Prefer explicit option, fallback to env var
    this.webhookUrl = options.webhookUrl || process.env.SPEC_WORKFLOW_N8N_WEBHOOK_URL;
    this.maxRetries = options.maxRetries ?? 2;
    this.timeoutMs = options.timeoutMs ?? 5000;
    this.enabled = !!this.webhookUrl;

    if (this.enabled) {
      console.error(`[N8N Dispatcher] Enabled → ${this.webhookUrl}`);
    } else {
      console.error('[N8N Dispatcher] Disabled (set SPEC_WORKFLOW_N8N_WEBHOOK_URL to enable)');
    }
  }

  /**
   * Returns true if the dispatcher has a configured webhook URL.
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Dispatch an event to the N8N webhook.
   * Fails silently (with log) to never block the main server.
   */
  async dispatch(event: SpecWorkflowEvent): Promise<void> {
    if (!this.enabled || !this.webhookUrl) return;

    let attempt = 0;
    while (attempt <= this.maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch(this.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Spec-Workflow-Version': '1',
          },
          body: JSON.stringify(event),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`N8N webhook returned HTTP ${response.status}`);
        }

        console.error(`[N8N Dispatcher] ✓ ${event.type} → ${event.specName} (project: ${event.projectName})`);
        return;
      } catch (error: unknown) {
        attempt++;
        const msg = error instanceof Error ? error.message : String(error);

        if (attempt > this.maxRetries) {
          console.error(`[N8N Dispatcher] ✗ Failed to dispatch ${event.type} after ${this.maxRetries + 1} attempts: ${msg}`);
        } else {
          console.error(`[N8N Dispatcher] Retry ${attempt}/${this.maxRetries} for ${event.type}: ${msg}`);
          // Exponential backoff: 500ms, 1000ms
          await new Promise(resolve => setTimeout(resolve, 500 * attempt));
        }
      }
    }
  }

  /**
   * Convenience factory — builds and dispatches a spec lifecycle event.
   */
  async dispatchSpecEvent(
    type: SpecWorkflowEventType,
    projectId: string,
    projectName: string,
    specName: string,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    await this.dispatch({
      type,
      projectId,
      projectName,
      specName,
      timestamp: new Date().toISOString(),
      metadata,
    });
  }
}
