---
allowed-tools: Task, TodoWrite, mcp__spec-workflow__spec-list, mcp__spec-workflow__manage-tasks, mcp__spec-workflow__spec-status, Bash, Read, LS, Grep, Glob
---

# Parallel Tasks Execution

Deploy specialized AI agents to work on multiple tasks simultaneously while maintaining coordination and task tracking. This command can reduce development time by 60-80% through intelligent agent coordination and task parallelization.

## 🔧 Agent Extensibility

**IMPORTANT**: This command is fully extensible - you can add any agents you want to be available for parallel execution. Simply add them to the "Agent Matching Matrix" section below. The command will automatically detect and utilize newly added agents based on task content analysis and keyword matching.

## Required Rules

**IMPORTANT:** Before executing this command:

- Verify project has active spec-workflow system
- Ensure no conflicting processes are running (other builds, deploys)
- Check system resources available for parallel agent execution

## Arguments

- `--project-path <PATH>` - Absolute path to project root (default: current directory)
- `--spec-name <NAME>` - Specification name (required)
- `--auto-assign` - Automatically assign tasks to optimal agents (recommended)
- `--max-agents <NUMBER>` - Maximum parallel agents (default: 4, range: 1-8)
- `--dry-run` - Preview task assignments without execution
- `--conflict-resolution <MODE>` - Handle conflicts: abort, merge, manual (default: abort)
- `--resource-limit <LEVEL>` - Resource usage: low, medium, high (default: medium)
- `--help` - Display comprehensive help documentation

### 🎯 Agent Customization Note
You can extend the available agents by adding them to the Agent Matching Matrix below. The command will automatically incorporate any new agents you define based on task keyword matching.

## Preflight Checklist

Before proceeding, complete these validation steps:

### 1. Help Flag Detection

- If `--help` flag is present, display comprehensive help documentation instead of executing
- Reference the complete help content from `parallel-tasks-help-command.md`
- Do not proceed with task execution when help is requested

### 2. System Connectivity Check

- **Spec-Workflow**: Verify MCP server connection: `mcp__spec-workflow__spec-list`
- If system unavailable, suggest troubleshooting steps or verify MCP server is running

### 3. Project Path Validation

- Verify project directory exists and is accessible
- Check for git repository: `git status 2>/dev/null`
- Validate write permissions for temporary files
- Confirm project has spec-workflow structure (.spec-workflow directory)

### 4. Resource Assessment

- Check available system resources (CPU, memory)
- Validate max-agents parameter is within safe limits (1-8)
- Warn if resource-limit is high and recommend monitoring
- Ensure no other intensive processes are running

## Instructions

### Phase 1: Task Discovery and Analysis

**System Integration:**

- Connect to spec-workflow MCP server
- Use `mcp__spec-workflow__spec-list` to find specifications if spec-name not provided
- Use `mcp__spec-workflow__manage-tasks` with action="list" for specified specification
- Extract all pending/available tasks with their details and metadata

**Task Analysis:**

```bash
# Example for spec-workflow
1. Get task list with dependencies and file information
2. Analyze task descriptions for type classification
3. Identify file modification conflicts between tasks
4. Group tasks by specialization area (testing, deployment, development)
```

**Parallelization Assessment:**

- Tasks that modify same files → Sequential execution required
- Tasks with explicit dependencies → Respect dependency order
- Independent tasks of different types → Prime candidates for parallelization
- Large tasks → Consider if they can be subdivided

### Phase 2: Agent Assignment Strategy

**Task Categorization:**

Create task groups based on content analysis:

- **Testing Tasks**: Keywords: test, spec, coverage, validation, qa
- **Performance Tasks**: Keywords: benchmark, optimization, performance, metrics
- **Deployment Tasks**: Keywords: deploy, ci/cd, script, infrastructure
- **Development Tasks**: Keywords: implement, feature, refactor, bug fix
- **Documentation Tasks**: Keywords: docs, readme, api, documentation

**Agent Matching Matrix:**

```yaml
Testing Tasks:
  - test-automator: Unit tests, test configuration, coverage
  - qa-expert: Quality assurance, validation, acceptance testing
  - playwright-test-architect: E2E tests, integration testing

Performance Tasks:
  - performance-engineer: Benchmarking, optimization, metrics

Deployment Tasks:
  - deployment-engineer: CI/CD, scripts, infrastructure automation

Development Tasks:
  - typescript-pro: TypeScript development, refactoring
  - react-pro: React components, frontend development
  - python-pro: Python backend, API development
  - golang-pro: Go services, system programming

Documentation Tasks:
  - documentation-expert: Technical docs, guides, architecture
  - api-documenter: API documentation, examples, SDKs

# 🔧 EXTENSIBLE: Add Your Custom Agents Here!
# 
# Examples of additional agents you might add:
#
# Security Tasks:
#   - security-auditor: Security reviews, vulnerability scanning
#   - penetration-tester: Security testing, attack simulation
#
# Database Tasks:
#   - database-optimizer: Query optimization, schema design
#   - migration-expert: Database migrations, data transformations
#
# Mobile Tasks:
#   - ios-developer: iOS app development, Swift coding
#   - android-developer: Android development, Kotlin/Java
#
# Infrastructure Tasks:
#   - devops-engineer: Infrastructure as code, automation
#   - kubernetes-specialist: Container orchestration, k8s configs
#
# Simply add your agents following the same format and they will
# be automatically detected and utilized based on task keywords!
```

**Conflict Detection:**

- File-level conflict analysis (no two agents modify same files)
- Resource conflict prevention (database, external services)
- Dependency ordering (Task A must complete before Task B)

### Phase 3: Parallel Agent Deployment

**Pre-Deployment Validation:**

- Confirm no file conflicts in task assignments
- Verify all required tools/dependencies are available
- Set up coordination mechanism for status tracking
- Create TodoWrite list to track overall progress

**Agent Deployment Process:**

For each selected agent and task group:

1. **Status Update**: Set tasks to "in-progress" in source system

```bash
# Example for spec-workflow
mcp__spec-workflow__manage-tasks --action set-status --task-id X --status in-progress
```

2. **Agent Prompt Template**:

```
Task {agent_type} agent to handle: {task_descriptions}

**CRITICAL WORKFLOW INTEGRATION**:
1. BEFORE starting: Task status already set to in-progress
2. Complete assigned work with full implementation
3. AFTER completion: Set task status to completed using source system

**Assigned Tasks**: {task_list}
**Files to Modify**: {file_list}
**Requirements**: {requirements}
**Integration Points**: {dependencies}
**Coordination**: Report progress and conflicts immediately
```

3. **Parallel Launch**: Use Task tool to deploy multiple agents simultaneously

```bash
# Deploy up to max-agents simultaneously
Task(subagent_type=agent_type, description=task_summary, prompt=full_prompt)
```

### Phase 4: Coordination and Monitoring

**Real-time Coordination:**

- Track agent progress through TodoWrite updates
- Monitor for file conflicts or resource contention
- Handle agent failures or errors gracefully
- Provide progress reports to user

**Status Synchronization:**

- Coordinate status updates between agents and source system
- Ensure no duplicate status updates or conflicts
- Maintain central coordination log

**Error Handling:**

- Agent failure: Reassign task or mark for manual completion
- Conflict detection: Pause conflicting agents, resolve manually
- Resource exhaustion: Reduce active agents, queue remaining tasks
- System connectivity loss: Cache progress, retry when restored

### Phase 5: Integration and Validation

**Post-Execution Validation:**

- Verify all parallel work integrates properly
- Run build validation to ensure no breaking changes
- Check for merge conflicts or inconsistencies
- Validate that all task requirements are met

**Quality Assurance:**

- Run integration tests if available in project
- Verify code style consistency across all changes
- Check for proper error handling and edge cases
- Ensure documentation is updated appropriately

**Final Status Updates:**

- Mark completed tasks as "completed" in source system
- Update overall project/specification progress
- Generate completion summary with metrics

### Phase 6: Reporting and Cleanup

**Completion Summary:**

```
🚀 Parallel Task Execution Complete

📊 Execution Summary:
  - Tasks Processed: {completed}/{total}
  - Agents Deployed: {agent_count}
  - Execution Time: {duration}
  - Time Savings: ~{percentage}%

🎯 Agent Performance:
  ✅ {agent_name}: {task_count} tasks completed successfully
  [... for each agent deployed ...]

📈 Project Progress:
  - Specification: {spec_name}
  - Progress: {completed_tasks}/{total_tasks} ({percentage}%)
  - Status: {overall_status}

⏱️  Performance Metrics:
  - Average task completion: {avg_time}
  - Parallel efficiency: {efficiency}%
  - Resource utilization: {resource_usage}

✅ Integration Validation:
  - Build Status: {build_status}
  - Test Results: {test_results}
  - Conflicts Resolved: {conflict_count}

💡 Recommendations:
  {recommendations_for_future_runs}
```

## Error Handling Procedures

### Common Error Scenarios

**System Connectivity Issues:**

```
Error: Cannot connect to spec-workflow MCP server
Action: 1. Check MCP server status, 2. Verify configuration, 3. Restart MCP server
```

**Resource Exhaustion:**

```
Error: System resources insufficient for requested agent count
Action: 1. Reduce --max-agents, 2. Close other applications, 3. Use --resource-limit low
```

**Task Conflicts:**

```
Error: Multiple agents assigned to conflicting tasks
Action: 1. Pause agents, 2. Resolve conflicts manually, 3. Resume with updated assignments
```

**Agent Failure:**

```
Error: Agent failed to complete assigned task
Action: 1. Review agent logs, 2. Reassign task manually, 3. Continue with remaining agents
```

### Recovery Procedures

**Partial Completion Recovery:**

1. Assess which tasks were completed successfully
2. Identify failed or incomplete tasks
3. Offer to retry failed tasks individually
4. Update task statuses accurately in source system

**Conflict Resolution:**

1. Create backup of current state
2. Identify specific conflicting changes
3. Present resolution options to user
4. Apply chosen resolution strategy
5. Validate resolution and continue

## Advanced Options

### Dry Run Mode

When `--dry-run` is specified:

1. Perform full task discovery and analysis
2. Show proposed agent assignments
3. Display expected execution plan
4. Estimate time savings and resource usage
5. Exit without deploying any agents

### Custom Agent Selection

When specific agents are requested:

1. Validate agent availability and capabilities
2. Match requested agents to available tasks
3. Warn if agent-task mismatch detected
4. Proceed with user-specified assignments

### Resource Management

Based on `--resource-limit` setting:

- **Low**: Max 2 agents, minimal system impact, extended timeouts
- **Medium**: Max 4 agents, balanced performance, standard timeouts
- **High**: Max 8 agents, maximum performance, aggressive timeouts

## Custom Agent Configuration Guide

### 🎯 Adding Your Own Agents

This command is designed to be fully extensible. You can add any specialized agents you need by following these steps:

#### Step 1: Identify Agent Specializations

Think about the types of tasks in your project that could benefit from specialized agents:
- **Domain-specific**: Healthcare, finance, gaming, e-commerce
- **Technology-specific**: Blockchain, ML/AI, embedded systems
- **Process-specific**: Security audits, accessibility testing, localization

#### Step 2: Add Agents to the Matrix

Edit the Agent Matching Matrix section above and add your agents following this format:

```yaml
Your Task Category:
  - your-agent-name: Description of what this agent handles
  - another-agent: Another specialized capability
```

#### Step 3: Define Keywords

The command automatically assigns tasks to agents based on keyword matching. Ensure your task descriptions contain relevant keywords that will match your agents.

#### Step 4: Agent Capabilities

Your custom agents can:
- Access all the same tools as the base command
- Work in parallel with other agents
- Handle file conflicts automatically
- Integrate with spec-workflow status updates

### 📋 Agent Configuration Examples

```yaml
# AI/ML Specialization
Machine Learning Tasks:
  - ml-engineer: Model training, data preprocessing, ML pipelines
  - data-scientist: Data analysis, statistical modeling, visualization

# Security Specialization  
Security Tasks:
  - security-auditor: Code security reviews, vulnerability assessment
  - compliance-checker: Regulatory compliance, audit preparation

# Platform Specialization
Cloud Tasks:
  - aws-architect: AWS infrastructure, serverless, cloud migration
  - azure-specialist: Azure services, enterprise integration
```

### 🔄 Dynamic Agent Detection

The command will automatically:
1. **Parse** the Agent Matching Matrix for all defined agents
2. **Match** tasks to agents based on keyword analysis
3. **Assign** optimal agents to compatible tasks
4. **Coordinate** parallel execution with conflict resolution

### 💡 Best Practices

- **Use descriptive agent names** that clearly indicate their specialty
- **Include comprehensive keywords** in task descriptions
- **Test with --dry-run** before full execution
- **Monitor resource usage** when adding many specialized agents
- **Document agent capabilities** for team collaboration

## Important Notes

- **Always validate** task assignments before agent deployment
- **Monitor system resources** during parallel execution
- **Handle failures gracefully** with clear recovery options
- **Maintain coordination** between all agents and source systems
- **Validate integration** after parallel work completion
- **Provide clear reporting** on outcomes and recommendations
- **Customize agent matrix** to match your project's specific needs

$ARGUMENTS
