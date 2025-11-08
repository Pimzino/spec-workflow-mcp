# Configuration Guide

This guide covers all configuration options for Spec Workflow MCP.

## Command-Line Options

### Basic Usage

```bash
npx -y @pimzino/spec-workflow-mcp@latest [project-path] [options]
```

### Available Options

| Option | Description | Example |
|--------|-------------|---------|
| `--help` | Show comprehensive usage information | `npx -y @pimzino/spec-workflow-mcp@latest --help` |
| `--dashboard` | Run dashboard-only mode (default port: 5000) | `npx -y @pimzino/spec-workflow-mcp@latest --dashboard` |
| `--port <number>` | Specify custom dashboard port (1024-65535) | `npx -y @pimzino/spec-workflow-mcp@latest --dashboard --port 8080` |

### Important Notes

- **Single Dashboard Instance**: Only one dashboard runs at a time. All MCP servers connect to the same dashboard.
- **Default Port**: Dashboard uses port 5000 by default. Use `--port` only if 5000 is unavailable.
- **Separate Dashboard**: Always run the dashboard separately from MCP servers.

## Usage Examples

### Typical Workflow

1. **Start the Dashboard** (do this first, only once):
```bash
# Uses default port 5000
npx -y @pimzino/spec-workflow-mcp@latest --dashboard
```

2. **Start MCP Servers** (one per project, in separate terminals):
```bash
# Project 1
npx -y @pimzino/spec-workflow-mcp@latest ~/projects/app1

# Project 2
npx -y @pimzino/spec-workflow-mcp@latest ~/projects/app2

# Project 3
npx -y @pimzino/spec-workflow-mcp@latest ~/projects/app3
```

All projects will appear in the dashboard at http://localhost:5000

### Dashboard with Custom Port

Only use a custom port if port 5000 is unavailable:

```bash
# Start dashboard on port 8080
npx -y @pimzino/spec-workflow-mcp@latest --dashboard --port 8080
```

## Dashboard Session Management

The dashboard stores its session information in `~/.spec-workflow-mcp/activeSession.json`. This file:
- Enforces single dashboard instance
- Allows MCP servers to discover the running dashboard
- Automatically cleans up when dashboard stops

### Single Instance Enforcement

Only one dashboard can run at any time. If you try to start a second dashboard:

```
Dashboard is already running at: http://localhost:5000

You can:
  1. Use the existing dashboard at: http://localhost:5000
  2. Stop it first (Ctrl+C or kill PID), then start a new one

Note: Only one dashboard instance is needed for all your projects.
```

## Port Management

**Default Port**: 5000
**Custom Port**: Use `--port <number>` only if port 5000 is unavailable

### Port Conflicts

If port 5000 is already in use by another service:

```bash
Failed to start dashboard: Port 5000 is already in use.

This might be another service using port 5000.
To use a different port:
  spec-workflow-mcp --dashboard --port 8080
```

## Configuration File (Deprecated)

### Default Location

The server looks for configuration at: `<project-dir>/.spec-workflow/config.toml`

### File Format

Configuration uses TOML format. Here's a complete example:

```toml
# Project directory (defaults to current directory)
projectDir = "/path/to/your/project"

# Dashboard port (1024-65535)
port = 3456

# Run dashboard-only mode
dashboardOnly = false

# Interface language
# Options: en, ja, zh, es, pt, de, fr, ru, it, ko, ar
lang = "en"

# Sound notifications (VSCode extension only)
[notifications]
enabled = true
volume = 0.5

# Advanced settings
[advanced]
# WebSocket reconnection attempts
maxReconnectAttempts = 10

# File watcher settings
[watcher]
enabled = true
debounceMs = 300
```

### Configuration Options

#### Basic Settings

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `projectDir` | string | Current directory | Project directory path |
| `port` | number | Ephemeral | Dashboard port (1024-65535) |
| `dashboardOnly` | boolean | false | Run dashboard without MCP server |
| `lang` | string | "en" | Interface language |

> **Note**: The `autoStartDashboard` option was removed in v2.0.0. The dashboard now uses a unified multi-project mode accessible via `--dashboard` flag.

#### Language Options

- `en` - English
- `ja` - Japanese (日本語)
- `zh` - Chinese (中文)
- `es` - Spanish (Español)
- `pt` - Portuguese (Português)
- `de` - German (Deutsch)
- `fr` - French (Français)
- `ru` - Russian (Русский)
- `it` - Italian (Italiano)
- `ko` - Korean (한국어)
- `ar` - Arabic (العربية)

### Creating a Custom Configuration

1. Copy the example configuration:
```bash
cp .spec-workflow/config.example.toml .spec-workflow/config.toml
```

2. Edit the configuration:
```toml
# My project configuration
projectDir = "/Users/myname/projects/myapp"
port = 3000
lang = "en"
```

3. Use the configuration:
```bash
# Uses .spec-workflow/config.toml automatically
npx -y @pimzino/spec-workflow-mcp@latest

# Or specify explicitly
npx -y @pimzino/spec-workflow-mcp@latest --config .spec-workflow/config.toml
```

## Configuration Precedence

Configuration values are applied in this order (highest to lowest priority):

1. **Command-line arguments** - Always take precedence
2. **Custom config file** - Specified with `--config`
3. **Default config file** - `.spec-workflow/config.toml`
4. **Built-in defaults** - Fallback values

### Example Precedence

```toml
# config.toml
port = 3000
```

```bash
# Command-line argument overrides config file
npx -y @pimzino/spec-workflow-mcp@latest --config config.toml --port 4000
# Result: port = 4000 (CLI wins)
```

## Environment-Specific Configurations

### Development Configuration

```toml
# dev-config.toml
projectDir = "./src"
port = 3000
lang = "en"

[advanced]
debugMode = true
verboseLogging = true
```

Usage:
```bash
npx -y @pimzino/spec-workflow-mcp@latest --config dev-config.toml
```

### Production Configuration

```toml
# prod-config.toml
projectDir = "/var/app"
port = 8080
lang = "en"

[advanced]
debugMode = false
verboseLogging = false
```

Usage:
```bash
npx -y @pimzino/spec-workflow-mcp@latest --config prod-config.toml
```

## Port Configuration

### Valid Port Range

Ports must be between 1024 and 65535.

### Ephemeral Ports

When no port is specified, the system automatically selects an available ephemeral port. This is recommended for:
- Development environments
- Multiple simultaneous projects
- Avoiding port conflicts

### Fixed Ports

Use fixed ports when you need:
- Consistent URLs for bookmarking
- Integration with other tools
- Team collaboration with shared configurations

### Port Conflict Resolution

If a port is already in use:

1. **Check what's using the port:**
   - Windows: `netstat -an | findstr :3000`
   - macOS/Linux: `lsof -i :3000`

2. **Solutions:**
   - Use a different port: `--port 3001`
   - Kill the process using the port
   - Omit `--port` to use an ephemeral port

## Multi-Project Setup

### Separate Configurations

Create project-specific configurations:

```bash
# Project A
project-a/
  .spec-workflow/
    config.toml  # port = 3000

# Project B
project-b/
  .spec-workflow/
    config.toml  # port = 3001
```

### Shared Configuration

Use a shared configuration with overrides:

```bash
# Shared base config
~/configs/spec-workflow-base.toml

# Project-specific overrides
npx -y @pimzino/spec-workflow-mcp@latest \
  --config ~/configs/spec-workflow-base.toml \
  --port 3000 \
  /path/to/project-a
```

## VSCode Extension Configuration

The VSCode extension has its own settings:

1. Open VSCode Settings (Cmd/Ctrl + ,)
2. Search for "Spec Workflow"
3. Configure:
   - Language preference
   - Sound notifications
   - Archive visibility
   - Auto-refresh interval

## Troubleshooting Configuration

### Configuration Not Loading

1. **Check file location:**
   ```bash
   ls -la .spec-workflow/config.toml
   ```

2. **Validate TOML syntax:**
   ```bash
   # Install toml CLI tool
   npm install -g @iarna/toml

   # Validate
   toml .spec-workflow/config.toml
   ```

3. **Check permissions:**
   ```bash
   # Ensure file is readable
   chmod 644 .spec-workflow/config.toml
   ```

### Common Issues

| Issue | Solution |
|-------|----------|
| Port already in use | Use different port or omit for ephemeral |
| Config file not found | Check path and use absolute path if needed |
| Invalid TOML syntax | Validate with TOML linter |
| Settings not applying | Check configuration precedence |

## Best Practices

1. **Use version control** for configuration files
2. **Document custom settings** in your project README
3. **Use ephemeral ports** in development
4. **Keep sensitive data** out of configuration files
5. **Create environment-specific** configurations
6. **Test configuration changes** before deploying

## Related Documentation

- [User Guide](USER-GUIDE.md) - Using the configured server
- [Interfaces Guide](INTERFACES.md) - Dashboard and extension settings
- [Troubleshooting](TROUBLESHOOTING.md) - Common configuration issues