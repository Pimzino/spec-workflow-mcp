# Troubleshooting Guide

This guide helps you resolve common issues with Spec Workflow MCP.

## Quick Diagnostics

### Check Installation
```bash
# Verify npm package is accessible
npx -y @pimzino/spec-workflow-mcp@latest --help

# Check if running in correct directory
pwd  # or 'cd' on Windows

# Verify .spec-workflow directory exists
ls -la .spec-workflow  # or 'dir .spec-workflow' on Windows
```

### Check Services
```bash
# Test MCP server
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project

# Test dashboard
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project --dashboard

# Check port availability
netstat -an | grep 3000  # macOS/Linux
netstat -an | findstr :3000  # Windows
```

## Common Issues and Solutions

## Installation Issues

### NPM Package Not Found

**Error**: `npm ERR! 404 Not Found - @pimzino/spec-workflow-mcp@latest`

**Solutions**:
1. Check internet connection
2. Clear npm cache:
   ```bash
   npm cache clean --force
   ```
3. Try without version tag:
   ```bash
   npx @pimzino/spec-workflow-mcp /path/to/project
   ```
4. Install globally first:
   ```bash
   npm install -g @pimzino/spec-workflow-mcp
   spec-workflow-mcp /path/to/project
   ```

### Permission Denied

**Error**: `EACCES: permission denied`

**Solutions**:
1. **macOS/Linux**: Use proper npm permissions:
   ```bash
   npm config set prefix ~/.npm-global
   export PATH=~/.npm-global/bin:$PATH
   ```
2. **Windows**: Run as Administrator or fix npm permissions:
   ```bash
   npm config set prefix %APPDATA%\npm
   ```
3. Use npx with -y flag:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest
   ```

## MCP Server Issues

### Server Not Starting

**Error**: `Failed to start MCP server`

**Solutions**:
1. Check Node.js version:
   ```bash
   node --version  # Should be 18.0 or higher
   ```
2. Verify project path exists:
   ```bash
   ls -la /path/to/project
   ```
3. Check for conflicting processes:
   ```bash
   ps aux | grep spec-workflow  # macOS/Linux
   tasklist | findstr spec-workflow  # Windows
   ```
4. Try with absolute path:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest $(pwd)
   ```

### MCP Not Connecting to AI Tool

**Error**: `MCP server unreachable` or `Connection refused`

**Solutions**:

1. **Claude Desktop**: Check configuration file:
   ```json
   {
     "mcpServers": {
       "spec-workflow": {
         "command": "npx",
         "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/absolute/path/to/project"]
       }
     }
   }
   ```

2. **Claude Code CLI**: Verify setup:
   ```bash
   claude mcp list  # Check if spec-workflow is listed
   claude mcp remove spec-workflow  # Remove if exists
   claude mcp add spec-workflow npx @pimzino/spec-workflow-mcp@latest -- /path/to/project
   ```

3. **Path Issues**: Ensure path is absolute and exists:
   - ❌ `~/project` or `./project`
   - ✅ `/Users/name/project` or `C:\Users\name\project`

### Tools Not Available

**Error**: `Tool 'spec-workflow' not found`

**Solutions**:
1. Restart your AI tool completely
2. Check MCP server is running (look for process)
3. Verify configuration is saved correctly
4. Try mentioning the tool explicitly: "Use spec-workflow to create a spec"

## Dashboard Issues

### Dashboard Not Loading

**Error**: `Cannot connect to dashboard` or blank page

**Solutions**:
1. Verify dashboard is started:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard
   ```
2. Check the URL in browser (note the port):
   ```
   http://localhost:3000  # Or whatever port is shown
   ```
3. Try different browser or incognito mode
4. Check browser console for errors (F12 → Console)
5. Disable browser extensions temporarily

### Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions**:
1. Use a different port:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard --port 3456
   ```
2. Find and kill the process using the port:
   ```bash
   # macOS/Linux
   lsof -i :3000
   kill -9 [PID]

   # Windows
   netstat -ano | findstr :3000
   taskkill /PID [PID] /F
   ```
3. Use ephemeral port (omit --port flag):
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard
   ```

### WebSocket Connection Failed

**Error**: `WebSocket connection lost` or real-time updates not working

**Solutions**:
1. Refresh the browser page
2. Check if firewall is blocking WebSocket
3. Verify dashboard and MCP server are running from same project
4. Check browser console for specific errors
5. Try different network (if on corporate network)

### Dashboard Not Updating

**Symptoms**: Changes not reflected in real-time

**Solutions**:
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Check WebSocket connection status (should show green)
4. Verify file system watchers are working:
   ```bash
   # Create a test file in project
   touch .spec-workflow/test.md
   # Should trigger update in dashboard
   ```

## Approval System Issues

### Approvals Not Showing

**Error**: No approval notifications in dashboard

**Solutions**:
1. Ensure dashboard is running alongside MCP server:
   ```bash
   # Run both separately
   # Terminal 1: Start dashboard
   npx -y @pimzino/spec-workflow-mcp@latest --dashboard
   # Terminal 2: Start MCP server
   npx -y @pimzino/spec-workflow-mcp@latest /path
   ```
2. Check approval directory exists:
   ```bash
   ls -la .spec-workflow/approval/
   ```
3. Manually trigger approval request through AI

### Can't Approve Documents

**Error**: Approval buttons not working

**Solutions**:
1. Check browser console for JavaScript errors
2. Verify you're on the correct spec page
3. Ensure document has pending approval status
4. Try using VSCode extension instead (if available)

## File System Issues

### Spec Files Not Created

**Error**: Spec documents not appearing in file system

**Solutions**:
1. Check write permissions:
   ```bash
   touch .spec-workflow/test.txt
   ```
2. Verify correct working directory:
   ```bash
   pwd  # Should be your project root
   ```
3. Look for hidden files:
   ```bash
   ls -la .spec-workflow/specs/
   ```
4. Check if antivirus is blocking file creation

### Permission Denied on Files

**Error**: `EACCES` or `Permission denied` when creating specs

**Solutions**:
1. Fix directory permissions:
   ```bash
   chmod -R 755 .spec-workflow  # macOS/Linux
   ```
2. Check file ownership:
   ```bash
   ls -la .spec-workflow
   # Should be owned by your user
   ```
3. Run from a directory you own (not system directories)

## VSCode Extension Issues

### Extension Not Loading

**Error**: Spec Workflow icon not appearing in Activity Bar

**Solutions**:
1. Verify extension is installed:
   - Open Extensions (Ctrl+Shift+X)
   - Search "Spec Workflow MCP"
   - Check if installed and enabled
2. Reload VSCode window:
   - Ctrl+Shift+P → "Developer: Reload Window"
3. Check extension output:
   - View → Output → Select "Spec Workflow" from dropdown
4. Ensure project has `.spec-workflow` directory

### Extension Commands Not Working

**Error**: Commands fail or show errors

**Solutions**:
1. Open project folder that contains `.spec-workflow`
2. Check VSCode is using correct workspace
3. View extension logs for specific errors
4. Try reinstalling extension:
   ```bash
   code --uninstall-extension Pimzino.spec-workflow-mcp
   code --install-extension Pimzino.spec-workflow-mcp
   ```

## Configuration Issues

### Config File Not Loading

**Error**: Settings in config.toml not being applied

**Solutions**:
1. Verify TOML syntax:
   ```bash
   # Install TOML validator
   npm install -g @iarna/toml
   toml .spec-workflow/config.toml
   ```
2. Check file location:
   - Default: `.spec-workflow/config.toml`
   - Custom: Use `--config` flag
3. Ensure no syntax errors:
   ```toml
   # Correct
   port = 3000
   lang = "en"

   # Wrong
   port: 3000  # Should use = not :
   lang = en   # Should have quotes
   ```

### Command-Line Arguments Not Working

**Error**: Flags like `--port` being ignored

**Solutions**:
1. Check argument order:
   ```bash
   # Correct
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard --port 3000

   # Wrong
   npx -y @pimzino/spec-workflow-mcp@latest --dashboard /path --port 3000
   ```
2. Ensure flag values are valid:
   - Port: 1024-65535
   - Language: en, ja, zh, es, pt, de, fr, ru, it, ko, ar
3. Use `--help` to see all options

## Performance Issues

### Slow Response Times

**Symptoms**: Dashboard or tools responding slowly

**Solutions**:
1. Check system resources:
   ```bash
   # CPU and memory usage
   top  # macOS/Linux
   taskmgr  # Windows
   ```
2. Reduce file watchers in large projects:
   ```toml
   # config.toml
   [watcher]
   enabled = false
   ```
3. Clear old approval records:
   ```bash
   rm -rf .spec-workflow/approval/completed/*
   ```
4. Use specific spec names instead of listing all

### High Memory Usage

**Solutions**:
1. Restart services periodically
2. Limit dashboard refresh rate:
   ```json
   // VSCode settings
   "specWorkflow.tasks.refreshInterval": 10000
   ```
3. Archive completed specs
4. Clear browser cache for dashboard

## Network Issues

### Behind Corporate Proxy

**Solutions**:
1. Configure npm proxy:
   ```bash
   npm config set proxy http://proxy.company.com:8080
   npm config set https-proxy http://proxy.company.com:8080
   ```
2. Use local installation:
   ```bash
   npm install @pimzino/spec-workflow-mcp
   node node_modules/@pimzino/spec-workflow-mcp/dist/index.js /path
   ```

### Firewall Blocking Connections

**Solutions**:
1. Allow Node.js through firewall
2. Use localhost instead of 0.0.0.0
3. Configure specific port rules
4. Try different port ranges

## Platform-Specific Issues

### Windows

#### Path Format Issues
**Error**: `Invalid path` or path not found

**Solutions**:
```bash
# Use forward slashes
npx -y @pimzino/spec-workflow-mcp@latest C:/Users/name/project

# Or escaped backslashes
npx -y @pimzino/spec-workflow-mcp@latest "C:\\Users\\name\\project"
```

#### PowerShell Execution Policy
**Error**: `cannot be loaded because running scripts is disabled`

**Solutions**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### macOS

#### Gatekeeper Blocking
**Error**: `cannot be opened because the developer cannot be verified`

**Solutions**:
1. System Preferences → Security & Privacy → Allow
2. Or remove quarantine:
   ```bash
   xattr -d com.apple.quarantine /path/to/node_modules
   ```

### Linux

#### Missing Dependencies
**Error**: `shared library not found`

**Solutions**:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install build-essential

# RHEL/CentOS
sudo yum groupinstall "Development Tools"
```

## Getting Help

### Diagnostic Information

When reporting issues, include:

1. **System Information**:
   ```bash
   node --version
   npm --version
   uname -a  # or 'ver' on Windows
   ```

2. **Error Messages**:
   - Complete error text
   - Screenshot if visual issue
   - Browser console logs

3. **Configuration**:
   - MCP client configuration
   - config.toml contents
   - Command-line used

4. **Steps to Reproduce**:
   - Exact commands run
   - Expected behavior
   - Actual behavior

### Support Channels

1. **GitHub Issues**: [Create an issue](https://github.com/Pimzino/spec-workflow-mcp/issues)
2. **Documentation**: Check other guides in `/docs`
3. **Community**: Discussions and Q&A

### Debug Mode

Enable verbose logging:

```bash
# Set environment variable
export DEBUG=spec-workflow:*  # macOS/Linux
set DEBUG=spec-workflow:*  # Windows

# Run with debug output
npx -y @pimzino/spec-workflow-mcp@latest /path --debug
```

## Prevention Tips

### Best Practices

1. **Always use absolute paths** in configurations
2. **Keep Node.js updated** (v18+ required)
3. **Run from project root** directory
4. **Use --help** to verify options
5. **Test in clean environment** when issues occur
6. **Check logs** before assuming failure
7. **Backup .spec-workflow** directory regularly

### Regular Maintenance

1. Clear old approvals monthly
2. Archive completed specs
3. Update npm packages regularly
4. Monitor disk space for logs
5. Restart services after updates

## Related Documentation

- [Configuration Guide](CONFIGURATION.md) - Detailed configuration options
- [User Guide](USER-GUIDE.md) - General usage instructions
- [Development Guide](DEVELOPMENT.md) - For contributing fixes
- [Interfaces Guide](INTERFACES.md) - Dashboard and extension details