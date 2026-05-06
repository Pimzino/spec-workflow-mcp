## Summary

Adds adversarial (oppositional) review capabilities to the spec workflow. Users can trigger a review from the dashboard, which automatically spawns background Claude CLI subagents to generate and execute the review — no manual copy-paste required. Progress is shown inline on the approval card, and completed reviews persist with next-step guidance.

The adversarial prompting methodology is informed by [this guide to adversarial prompting](https://www.fightingwithai.com/prompt-engineering/adversarial-prompting/).

## Problem

Spec documents benefit from critical review before approval, but self-review tends to be confirmatory rather than challenging. The adversarial technique uses context separation (a fresh agent session with no collaborative history) and oppositional framing to produce genuinely critical analysis. Previously this would require manual prompting and document management completely outside the spec-workflow environment. — this PR implements an automated process that offers what I'd consider a reasonable baseline of functionality. I've been using it on small-to-medium sized codebases with good results.

## Changes

### MCP Tools
- **`adversarial-review`**: Prepares a review for a spec phase — handles versioning, gathers steering docs and prior phase context, returns methodology for prompt generation
- **`adversarial-response`**: Finds analysis by version (or latest) and returns structured evaluation instructions (assess/reason/propose format). Accepts optional `version` parameter for precise targeting

### Background Execution (`adversarial-runner.ts`)
- Spawns two sequential CLI processes (defaults to `claude --print --dangerously-skip-permissions`):
  1. **Prompt generation**: Reads spec + context, writes a tailored adversarial prompt file
  2. **Review execution**: Fresh-context agent reads and executes the prompt, writes analysis
- Context separation is preserved — the reviewing agent has no collaborative history
- Job tracking with status transitions: `pending` → `generating-prompt` → `running-review` → `completed`/`failed`
- 10-minute timeout per step, max 2 concurrent reviews per project, duplicate detection
- Configurable CLI executable and arguments via settings — any LLM CLI that accepts a prompt as its final argument works (defaults to Claude CLI)
- Configurable model selection via settings (defaults to CLI default)
- WebSocket broadcast on every status change

### Dashboard — Approvals Integration
- **"Adversarial Review" button** on pending spec approvals with confirmation dialog
- **In-card progress stepper** showing the two-step process with spinner/checkmark states
- **Persistent completion banner** with next-step guidance (survives page navigation, driven by approval annotations + server-side file verification)
- **Incomplete state detection**: After server restart, checks if the expected analysis version exists on disk. Shows amber warning with "Resume review" button if missing
- **Failed state**: Shows error with "Retry" and "Dismiss" options
- **Retry/resume endpoint** (`POST .../adversarial-retry`): Checks if the prompt file from a previous attempt exists — if so, skips step 1 and runs only step 2
- **Version-aware verification**: Annotations store `analysisVersion`; completion status is verified against the specific version, not just any existing file

### Dashboard — Adversarial Analysis Page (`/adversarial`)
- **Reviews tab**: Browse analyses by spec, phase, and version with rendered markdown
- **Settings tab**: Optional preamble, required-phase checkboxes, agent CLI configuration (executable + base args), model selector, and methodology editors with reset-to-default

### Pending Revisions Section (Approvals page)
- Approvals with `needs-revision` status appear in a separate section below pending items
- Read-only view (no action buttons) — the agent handles revisions
- Adversarial progress/completion banners render here after a review is triggered

### API Endpoints Added
- `GET .../adversarial/jobs` — list active jobs for a project
- `GET .../adversarial/jobs/:jobId` — job status
- `POST .../adversarial/jobs/:jobId/cancel` — cancel a running job
- `POST .../approvals/:id/adversarial-retry` — retry/resume a failed or incomplete review

## Screenshots

### Approvals Page — Review Lifecycle

**Pending approval with "Request Adversarial Review" button**
<img width="854" height="236" alt="Screenshot 2026-03-19 122059" src="https://github.com/user-attachments/assets/19f939ab-b7de-42d6-bb6b-94c2719e5bcf" />

**Confirmation dialogue**
<img width="612" height="384" alt="Screenshot 2026-03-19 122110" src="https://github.com/user-attachments/assets/129800d4-04aa-4281-bfd1-ca6822c85434" />

**Step 1: Generating prompt (spinner active, step 2 grayed out)**
<img width="714" height="223" alt="Screenshot 2026-03-19 122143" src="https://github.com/user-attachments/assets/05861443-7288-4bd9-a54e-7af45309659a" />

**Step 2: Running review (step 1 checkmark, step 2 spinner)**
<img width="642" height="217" alt="Screenshot 2026-03-19 122810" src="https://github.com/user-attachments/assets/1485793c-8fb8-43af-b4a0-772b95291721" />


**Completed: green banner with next-step guidance**
<img width="666" height="254" alt="Screenshot 2026-03-19 130030" src="https://github.com/user-attachments/assets/cd4d568b-033b-4290-83db-a42ec02e6cb1" />


**Failed: red banner with "Retry" and "Dismiss" options**
<img width="713" height="285" alt="Screenshot 2026-03-19 130446" src="https://github.com/user-attachments/assets/125b1952-f9d4-4cd1-81b9-f3de5515fa22" />


**Incomplete after restart: amber warning with "Resume review" button**
<img width="621" height="292" alt="Screenshot 2026-03-19 131414" src="https://github.com/user-attachments/assets/50161117-756e-403e-ba96-c523fc05b0ff" />


### Adversarial Analysis Page

**Reviews tab: spec dropdown, phase/version list, rendered analysis**
<img width="1582" height="1318" alt="Screenshot 2026-03-19 132303" src="https://github.com/user-attachments/assets/de1e29e5-edc4-4f66-904c-4ce0e2de6bee" />


**Settings tab: preamble, required phases, model selector, methodology editors**
<img width="1909" height="1232" alt="Screenshot 2026-03-19 141546" src="https://github.com/user-attachments/assets/47278ddb-1875-4fb9-9b15-9f384416cedb" />

### Pending Revisions Section

**Needs-revision approvals with adversarial progress/completion banners**
<img width="1571" height="802" alt="Screenshot 2026-03-19 131232" src="https://github.com/user-attachments/assets/894dd71e-e9aa-43e2-a48c-4f9c98f34ffe" />

## How to Review

Suggested reading order:

1. **`src/tools/adversarial-review.ts`** and **`adversarial-response.ts`** — the MCP tool interfaces and methodology. Start here to understand what the feature does
2. **`src/dashboard/adversarial-runner.ts`** — the background execution engine. Self-contained, ~250 lines
3. **`src/dashboard/multi-server.ts`** — search for "adversarial" to find the endpoint changes. The retry endpoint is the most complex
4. **`src/dashboard_frontend/.../ApprovalsPage.tsx`** — the `AdversarialProgress` component at the top of the file, then the `Content` component's job tracking state
5. **`src/dashboard_frontend/.../AdversarialPage.tsx`** — standalone page, can be reviewed independently
6. **`src/dashboard/adversarial-display-state.ts`** — pure function extracted from `ApprovalsPage.tsx` for testability (stale-job and annotation display logic)
7. **Tests** (`__tests__/`) — 43 new tests covering tools, runner, endpoints, settings, and display state

## Testing

- `npx tsc --noEmit` passes
- `npm run build` succeeds
- `npm test` — all tests pass (43 new covering adversarial tools, runner, endpoints, settings, and display state)
- Manually tested: trigger review from dashboard, observe stepper progress, verify completion banner appears, navigate away and return (persists), kill server mid-review and restart (shows incomplete state with resume button), retry from incomplete state

## Diagram

```mermaid
flowchart TD
    subgraph trigger["1 · Trigger"]
        A[Pending spec approval] -->|Dashboard button| B["POST .../adversarial-review"]
    end

    subgraph prepare["2 · Prepare"]
        B --> C[adversarialReviewHandler]
        C --> D[Scan reviews/ for versions]
        D --> E[Return paths + methodology]
        C -.->|Check| S[("adversarial-settings.json")]
    end

    subgraph spawn["3 · Background Execution"]
        E --> F["AdversarialRunner.run()"]
        F --> G["Claude CLI #1: Generate prompt"]
        G --> H["reviews/adversarial-prompt-phase[-rN].md"]
        H --> I["Claude CLI #2: Execute review\n(fresh context)"]
        I --> J["reviews/adversarial-analysis-phase[-rN].md"]
    end

    subgraph notify["4 · Notify"]
        F -.->|WebSocket| K[In-card stepper updates]
        J -.->|Job complete| L[Completion banner + next step]
    end

    subgraph respond["5 · Evaluate"]
        L -->|Agent uses adversarial-response tool| M[Evaluate each finding]
        M --> N[Present assessment to user]
    end

    subgraph resolve["6 · Resolve"]
        N -->|User decides| O[Update document]
        O --> P[Resubmit for approval]
        P -->|Another round?| B
        P --> Q[Approved]
    end

    style trigger fill:#1e293b,stroke:#475569,color:#e2e8f0
    style prepare fill:#1e293b,stroke:#475569,color:#e2e8f0
    style spawn fill:#7c2d12,stroke:#c2410c,color:#fed7aa
    style notify fill:#1e293b,stroke:#475569,color:#e2e8f0
    style respond fill:#1e293b,stroke:#475569,color:#e2e8f0
    style resolve fill:#1e293b,stroke:#475569,color:#e2e8f0
```
