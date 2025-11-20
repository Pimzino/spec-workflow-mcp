# Example MCP Configuration with Docker Dashboard

This directory contains an example MCP server configuration (`example.mcp.json`) 
for use with the Docker-hosted dashboard.

## Architecture

The recommended setup is:
- **Dashboard**: Runs in Docker (using docker-compose.yml)
- **MCP Servers**: Run on host machine via npx (using example.mcp.json)

## Quick Start

1. **Start the Dashboard in Docker:**
   ```bash
   cd containers
   docker-compose up -d
   ```
   Dashboard will be at: http://localhost:5000

2. **Configure MCP Servers:**
   Use the configuration from `example.mcp.json` in your MCP client config:
   ```json
   {
     "mcpServers": {
       "spec-workflow": {
         "command": "npx",
         "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
       }
     }
   }
   ```

3. **Start Your MCP Client:**
   The MCP servers will automatically connect to the dashboard at port 5000.

## Why This Architecture?

- **Dashboard in Docker**: Provides isolation and easy deployment
- **MCP Servers on Host**: Allows direct file system access to your projects
- **Automatic Connection**: MCP servers auto-detect and connect to dashboard

## Alternative: Everything in Docker

If you need to run MCP servers in Docker (not recommended for most users):
- You'll need to create a custom setup with network bridges
- File system access becomes more complex
- The current setup (dashboard in Docker, MCP on host) is simpler and more flexible

## See Also

- [Docker Setup Guide](README.md) - Complete Docker documentation
- [Main README](../README.md) - General setup and usage
- [Configuration Guide](../docs/CONFIGURATION.md) - Advanced configuration options
