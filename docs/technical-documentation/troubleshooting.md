# Troubleshooting & FAQ

> **Quick Fix**: 90% of issues are solved by checking [Common Issues](#-common-issues) first.

## 🚨 Common Issues

### MCP Server Won't Start

**Symptoms**: AI client shows connection errors, server doesn't respond

**Most Common Causes**:

1. **Wrong Node.js Version**
   ```bash
   # Check version  
   node --version
   # Should be >= 18.0.0
   
   # Fix: Update Node.js
   # Use nvm or download from nodejs.org
   ```

2. **Path Issues**
   ```json
   // ❌ Wrong - relative path
   {
     "command": "npx",
     "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "./my-project"]
   }
   
   // ✅ Correct - absolute path
   {
     "command": "npx",
     "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/full/path/to/project"]
   }
   ```

3. **NPX Cache Issues**
   ```bash
   # Clear npx cache
   npm cache clean --force
   npx clear-npx-cache
   ```

**Quick Fix**:
```bash
# Test server manually
cd /your/project/path
npx -y @pimzino/spec-workflow-mcp@latest --help

# If this works, check your AI client config
```

---

### Dashboard Won't Load

**Symptoms**: Dashboard URL returns 404, connection refused

**Solutions**:

1. **Check Dashboard Status**
   ```bash
   # Check if dashboard is running
   netstat -tulpn | grep :3456
   # Or check process
   ps aux | grep spec-workflow
   ```

2. **Manual Dashboard Start**
   ```bash
   # Start dashboard separately
   cd /your/project
   npx -y @pimzino/spec-workflow-mcp@latest --dashboard
   ```

3. **Port Conflicts**
   ```bash
   # Try different port
   npx -y @pimzino/spec-workflow-mcp@latest --dashboard --port 8080
   ```

---

### Approval System Not Working  

**Symptoms**: Approvals stay "pending", buttons don't work

**Debugging Steps**:

1. **Check Approval Files**
   ```bash
   ls -la .spec-workflow/approvals/
   # Should show approval JSON files
   ```

2. **Browser Console Errors**
   - Open browser DevTools (F12)  
   - Check Console tab for JavaScript errors
   - Check Network tab for failed requests

3. **WebSocket Connection**
   ```javascript
   // In browser console
   console.log('WebSocket state:', WebSocket.CONNECTING);
   // Should show active connection
   ```

4. **Clear Browser Cache**
   - Hard refresh (Ctrl+Shift+R)
   - Clear localStorage/cookies for dashboard domain

---

### File Permission Errors

**Symptoms**: "EACCES", "Permission denied" errors

**Solutions**:

1. **Check Directory Permissions**
   ```bash
   # Check project permissions
   ls -la /path/to/project
   
   # Fix permissions  
   chmod -R 755 /path/to/project
   ```

2. **`.spec-workflow/` Directory**
   ```bash
   # Create directory manually if needed
   mkdir -p .spec-workflow/specs .spec-workflow/steering .spec-workflow/approvals
   
   # Fix permissions
   chmod -R 755 .spec-workflow/
   ```

3. **Windows-specific Issues**
   ```powershell
   # Run as Administrator
   # Or check folder properties → Security tab
   ```

---

### Tools Return Empty Results

**Symptoms**: `spec-list` shows no specs, context tools return empty

**Debugging**:

1. **Check File Structure**
   ```bash
   tree .spec-workflow/
   # Should show specs/, steering/, etc.
   ```

2. **Verify File Contents**
   ```bash
   # Check if spec files exist and have content
   find .spec-workflow/specs -name "*.md" -exec ls -la {} \;
   ```

3. **Path Resolution Issues**
   ```bash
   # Test with absolute path
   pwd
   # Use output in tool calls
   ```

## 🔧 Advanced Debugging

### MCP Protocol Debugging

**Enable Debug Logging**:
```bash
# Set debug environment variable
DEBUG=spec-workflow-mcp* npm run dev

# Or for production
DEBUG=spec-workflow-mcp* node dist/index.js
```

**Check MCP Messages**:
```json
// Look for these in AI client logs
{
  "jsonrpc": "2.0", 
  "method": "tools/call",
  "params": {
    "name": "spec-workflow-guide"
  }
}
```

### Dashboard Backend Debugging

**Server Logs**:
```bash
# Start with verbose logging
npm run dev -- --verbose

# Check Fastify logs
# Look for WebSocket connection messages
```

**API Testing**:
```bash
# Test API endpoints directly
curl http://localhost:3456/api/test
curl http://localhost:3456/api/specs
```

### File System Debugging

**File Watcher Issues**:
```bash
# Check if chokidar is watching correctly
# Look for file change events in logs

# Test manual file modification
echo "test" >> .spec-workflow/specs/test-spec/requirements.md
# Should trigger file watcher
```

**Cross-Platform Path Issues**:
```javascript
// Debug path resolution
const path = require('path');
console.log('Resolved:', path.resolve('/your/project'));
console.log('Platform:', process.platform);
```

## 🐛 Error Messages & Solutions

### `Tool execution failed: ENOENT`

**Meaning**: File or directory not found

**Solutions**:
1. Check if `.spec-workflow/` directory exists
2. Verify spec name spelling
3. Use absolute paths in tool calls

### `WORKFLOW VIOLATION: Cannot create design.md`

**Meaning**: Trying to create documents out of sequence

**Solution**: Follow workflow order:
1. Create requirements.md first
2. Get approval
3. Then create design.md

### `Approval not found or still pending`

**Meaning**: Trying to delete approval that doesn't exist or isn't approved

**Solutions**:
1. Check approval status first
2. Wait for approval before deletion  
3. Don't proceed without successful cleanup

### `Port X is already in use`

**Meaning**: Dashboard port is occupied

**Solutions**:
```bash
# Kill process using port
lsof -ti:3456 | xargs kill -9

# Or use different port
--port 8080
```

## ❓ Frequently Asked Questions

### Q: Can I use relative paths in MCP configuration?

**A**: Some MCP clients may not resolve relative paths correctly. Always use absolute paths:
```json
{
  "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/full/path/to/project"]
}
```

### Q: How do I reset everything and start fresh?

**A**: Remove the workflow directory:
```bash  
rm -rf .spec-workflow/
# MCP server will recreate it automatically
```

### Q: Can multiple AI clients use the same project?

**A**: Yes, but only one dashboard per project. Multiple MCP clients can connect, but they'll share the same approval workflow.

### Q: Why do approval requests need dashboard/VS Code approval?

**A**: This prevents runaway AI behavior. The system requires human oversight for document approval to maintain quality and control.

### Q: Can I customize the templates?

**A**: Not directly through tools. Templates are built into the server. However, you can modify generated documents after creation.

### Q: How do I backup my specifications?

**A**: The entire workflow is in `.spec-workflow/`:
```bash
# Create backup
tar -czf spec-backup.tar.gz .spec-workflow/

# Restore backup
tar -xzf spec-backup.tar.gz
```

### Q: What happens if I modify files directly?

**A**: The file watcher detects changes and updates the dashboard automatically. However, direct modifications may break workflow state.

### Q: Can I run dashboard without MCP server?

**A**: Yes, use dashboard-only mode:
```bash
npx -y @pimzino/spec-workflow-mcp@latest --dashboard
```

### Q: How do I update to the latest version?

**A**: NPX automatically uses latest with `@latest` tag. For explicit updates:
```bash
npm cache clean --force
npx -y @pimzino/spec-workflow-mcp@latest --help
```

## 🔧 Technical Debugging

### MCP Protocol Debugging

**Understanding MCP Communication**:
```json
// AI Client sends tool calls like this:
{
  "jsonrpc": "2.0",
  "method": "tools/call", 
  "params": {
    "name": "spec-workflow-guide",
    "arguments": {}
  }
}

// MCP Server responds with:
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Complete workflow guide content..."
      }
    ]
  }
}
```

**Debug Environment Variables**:
```bash
# Enable MCP server debug logging
DEBUG=spec-workflow-mcp* npm run dev

# Enable dashboard debug logging  
DEBUG=dashboard:* npm run dev:dashboard

# Full debug logging
DEBUG=* npm run dev
```

### Memory and Performance Issues

**Memory Usage Monitoring**:
```bash
# Check Node.js process memory usage
ps aux | grep "spec-workflow-mcp"

# Monitor memory growth
watch -n 5 "ps -p $(pgrep -f spec-workflow) -o pid,ppid,cmd,%mem,%cpu"

# Check file descriptor usage
lsof -p $(pgrep -f spec-workflow) | wc -l
```

**Performance Bottlenecks**:
```typescript
// Common performance issues and solutions
interface PerformanceIssues {
  slowContextLoading: {
    cause: "Large markdown files (>200KB)";
    solution: "Split large documents, use templates efficiently";
  };
  
  dashboardLag: {
    cause: "Too many file watchers, large project";
    solution: "Limit .spec-workflow/ directory size, cleanup old files";
  };
  
  memoryLeaks: {
    cause: "Uncached file reads, retained contexts"; 
    solution: "Restart MCP server, check cache settings";
  };
}
```

### Template and Context Issues

**Template Loading Debug**:
```bash
# Check template files exist and are readable
ls -la src/markdown/templates/
find src/markdown/templates -name "*.md" -exec wc -c {} \;

# Verify template content is not corrupted
for template in src/markdown/templates/*.md; do
  echo "=== $template ==="
  head -5 "$template"
done
```

**Context Loading Failures**:
```typescript
// Debug context loading issues
// Check these file paths in your codebase:

1. "Verify PathUtils.getSpecPath() returns correct paths";
2. "Check file permissions on .spec-workflow/ directory";
3. "Confirm spec directory structure matches expectations";
4. "Validate markdown files are not corrupted or empty";
```

## 🔍 Diagnostic Commands

### Health Check Script
```bash
#!/bin/bash
echo "=== Spec Workflow MCP Diagnostics ==="

echo "1. Node.js version:"
node --version

echo -e "\n2. Project structure:"
if [ -d ".spec-workflow" ]; then
    echo "✅ .spec-workflow/ directory exists"
    tree .spec-workflow/ || ls -la .spec-workflow/
else
    echo "❌ .spec-workflow/ directory missing"
fi

echo -e "\n3. NPX cache:"
npx -y @pimzino/spec-workflow-mcp@latest --help > /dev/null && echo "✅ MCP server loads" || echo "❌ MCP server fails"

echo -e "\n4. Permissions:"
ls -la .spec-workflow/ 2>/dev/null || echo "❌ Cannot read .spec-workflow/"

echo -e "\n5. Port availability:"
netstat -tulpn | grep :3456 > /dev/null && echo "❌ Port 3456 in use" || echo "✅ Port 3456 available"

echo -e "\n=== End Diagnostics ==="
```

### Log Collection
```bash
# Collect all relevant logs
mkdir -p debug-logs
find .spec-workflow/approvals -name "*.json" -exec cp {} debug-logs/ \; 2>/dev/null
echo "Logs collected in debug-logs/"
```

## 🆘 Getting Help

### Before Reporting Issues

1. **Try the diagnostic script above**
2. **Check this troubleshooting guide** 
3. **Search existing GitHub issues**
4. **Test with minimal reproduction case**

### Creating Bug Reports

Include this information:
```
**Environment:**
- OS: [Windows/macOS/Linux + version]
- Node.js: [version from node --version] 
- NPM: [version from npm --version]
- MCP Client: [Claude Desktop/Cursor/etc.]

**Configuration:**
[Your MCP server configuration]

**Steps to Reproduce:**
1. [First step]
2. [Second step]  
3. [And so on...]

**Expected Behavior:**
[What you expected to happen]

**Actual Behavior:**
[What actually happened]

**Error Messages:**
[Complete error messages/stack traces]

**Diagnostic Output:**
[Output from diagnostic script above]
```

### Community Support

- **GitHub Issues**: [Repository Issues](https://github.com/Pimzino/spec-workflow-mcp/issues)
- **Documentation**: [Technical Docs](README.md)
- **Examples**: [API Reference](api-reference.md)

---

**Last Updated**: December 2024 | **Next**: [Contributing Guidelines →](contributing.md)