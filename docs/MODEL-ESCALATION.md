# Model Escalation Strategy

A tiered approach to AI model selection that optimizes for cost, speed, and accuracy based on task complexity.

## Overview

Not all tasks require the most powerful (and expensive) AI models. This strategy provides clear triggers for when to escalate to more capable models and when to de-escalate back to efficient ones.

## Three-Tier Model Strategy

### Tier 1: Standard Model (Default)
**Use for:** Normal implementation, small refactors, straightforward debugging

**Characteristics:**
- Fast response times
- Lower token costs
- Sufficient for 80% of tasks

**Example tasks:**
- Adding new components/pages
- Writing tests when architecture is clear
- UI tweaks and styling
- Straightforward refactors
- Documentation updates

### Tier 2: Enhanced Model (Auto-escalate)
**Trigger escalation when ANY are true:**

1. One fix attempt failed AND the bug isn't obviously explained by the code
2. Issue spans >2 files OR involves intertwined UI + state + routing
3. Task touches complex areas:
   - Framework routing/navigation
   - Middleware matchers
   - Cookies/headers/sessions
   - Caching (static vs dynamic)
   - Internationalization (i18n)
   - Provider patterns
   - App layout hierarchies
4. Performance work where cause isn't clear after one pass
5. Need a careful plan/spec with tradeoffs (UX + engineering impacts)

**Escalation request format:**
```markdown
## Escalation Request: Tier 2

### What I tried:
- [1-3 bullets]

### What failed:
- [1-2 bullets]

### Suspected root cause:
[Brief description]

### Files involved:
- path/to/file1.ts
- path/to/file2.ts
```

### Tier 3: Advanced Model (Escalate from Tier 2)
**Trigger escalation when ANY are true:**

1. Tier 2 made 1 solid attempt and it still fails OR confidence is low
2. Two total failed iterations across models on the same bug
3. Suspected deeper architectural issue:
   - SSR/CSR boundary problems
   - Hydration mismatches
   - Edge runtime constraints
   - Cache invalidation complexity
   - Complex race conditions
4. High-risk areas:
   - Auth/session security
   - Payment processing
   - Data integrity
   - Scheduled jobs/email sending
   - Permission systems

## De-escalation Rules

**After Tier 2/3 finds root cause + solution approach:**
- Switch back to Tier 1 for:
  - Mechanical edits
  - Cleanup and formatting
  - Test implementation
  - Documentation updates

## Stop Conditions

**Stop and report status instead of looping if:**
- Cannot reproduce locally
- Cannot locate the code path for the UI behavior
- Required env vars/keys are missing to validate

**Stop report format:**
```markdown
## Stop Report

### Commands run / pages tested:
- [list]

### Findings:
- [list]

### Next steps (for human):
- Exact files to check
- What to look for
```

## Output Format for Every Task

Always produce:
1. **Root cause** (1-3 sentences)
2. **Fix plan** (bullets)
3. **Files to change** (paths)
4. **Minimal diff summary**
5. **Verification checklist** (exact URLs/clicks/commands)

## Integration with Spec Workflow

### In Requirements Phase
- Use Tier 1 for standard requirements gathering
- Escalate to Tier 2 for complex domain analysis

### In Design Phase
- Use Tier 2 for architectural decisions
- Escalate to Tier 3 for security-critical designs

### In Implementation Phase
- Start with Tier 1
- Escalate based on triggers above

### In Verification Phase
- Use Tier 1 for test execution
- Escalate to Tier 2 for debugging failures

## Cost Optimization

This strategy typically reduces costs by 40-60% compared to always using the most capable model, while maintaining quality through intelligent escalation.

| Phase | Default Tier | Escalation Frequency |
|-------|--------------|---------------------|
| Requirements | 1 | 10% to Tier 2 |
| Design | 2 | 20% to Tier 3 |
| Implementation | 1 | 30% to Tier 2 |
| Verification | 1 | 15% to Tier 2 |
