# Spec-Workflow MCP Docker Setup

This directory contains Docker configuration files to run the Spec-Workflow MCP dashboard in a containerized environment. This setup provides isolation and easy deployment for the dashboard service.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Building the Image](#building-the-image)
- [Running the Dashboard](#running-the-dashboard)
- [Using Docker Compose](#using-docker-compose)
- [Configuration Options](#configuration-options)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Docker (version 20.10 or later)
- Docker Compose (optional, for simplified management)
- A project directory where you want to use spec-workflow

## Quick Start

### Option 1: Using Docker Compose (Recommended)

The easiest way to get started is with Docker Compose:

```bash
# From the repository root
cd containers
docker-compose up --build
```

The dashboard will be available at: http://localhost:5000

### Option 2: Using Docker CLI

Build and run manually:

```bash
# From the repository root
docker build -f containers/Dockerfile -t spec-workflow-mcp .
docker run -p 5000:5000 -v "./workspace/.spec-workflow:/workspace/.spec-workflow:rw" spec-workflow-mcp
```

## Building the Image

### Build from Repository Root

**Important:** The Dockerfile must be built from the repository root directory, not from the `containers` directory, because it needs access to the source code.

```bash
# From the repository root
docker build -f containers/Dockerfile -t spec-workflow-mcp .
```

### Build Arguments

The image is built in two stages:
1. **Builder stage**: Installs dependencies and builds the TypeScript application
2. **Runtime stage**: Creates a minimal production image with only necessary files

## Running the Dashboard

### Basic Usage

Run the dashboard on the default port (5000):

```bash
docker run -p 5000:5000 \
  -v "./workspace/.spec-workflow:/workspace/.spec-workflow:rw" \
  spec-workflow-mcp
```

### Custom Port

Run the dashboard on a custom port (e.g., 8080):

```bash
docker run -p 8080:8080 \
  -e DASHBOARD_PORT=8080 \
  -v "./workspace/.spec-workflow:/workspace/.spec-workflow:rw" \
  spec-workflow-mcp
```

### Using a Specific Project Path

Mount your project's `.spec-workflow` directory:

```bash
docker run -p 5000:5000 \
  -v "/path/to/your/project/.spec-workflow:/workspace/.spec-workflow:rw" \
  spec-workflow-mcp
```

## Using Docker Compose

Docker Compose simplifies the management of the dashboard container.

### Default Configuration

Create a `.env` file (optional):

```bash
# .env file
DASHBOARD_PORT=5000
SPEC_WORKFLOW_PATH=./workspace
```

Then start the dashboard:

```bash
cd containers
docker-compose up -d
```

### Custom Configuration

Override environment variables when starting:

```bash
DASHBOARD_PORT=8080 SPEC_WORKFLOW_PATH=/path/to/project docker-compose up -d
```

### Managing the Service

```bash
# Start the dashboard
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the dashboard
docker-compose down

# Rebuild and restart
docker-compose up --build
```

## Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DASHBOARD_PORT` | `5000` | Port on which the dashboard runs |
| `SPEC_WORKFLOW_PATH` | `/workspace` | Path to the project directory (inside container) |

### Volume Mounts

The dashboard requires access to the `.spec-workflow` directory to function properly.

**Example:**
```bash
-v "/path/to/project/.spec-workflow:/workspace/.spec-workflow:rw"
```

**Important Notes:**
- The volume mount must be read-write (`:rw`) for the dashboard to function
- Only the `.spec-workflow` directory needs to be mounted
- The directory will be created automatically if it doesn't exist

### Port Mapping

Map the container port to a host port:

```bash
-p <host-port>:<container-port>
```

**Examples:**
- Default: `-p 5000:5000`
- Custom: `-p 8080:8080` (remember to set `DASHBOARD_PORT=8080`)

## MCP Server Configuration

The dashboard runs independently of MCP servers. To connect MCP servers to the dashboard:

### For Claude Desktop

Add to your `claude_desktop_config.json`:

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

**Note:** The MCP server runs on your host machine and connects to the Docker dashboard automatically via port 5000.

### For Other MCP Clients

Use similar configuration with the appropriate MCP client settings. The MCP servers run independently and connect to the dashboard's WebSocket endpoint.

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error:** `Bind for 0.0.0.0:5000 failed: port is already allocated`

**Solution:** Use a different port:
```bash
docker run -p 8080:8080 -e DASHBOARD_PORT=8080 ...
# or with docker-compose
DASHBOARD_PORT=8080 docker-compose up
```

#### 2. Permission Denied

**Error:** Permission issues with `.spec-workflow` directory

**Solutions:**
- Ensure the directory has proper permissions: `chmod -R 755 .spec-workflow`
- On SELinux systems, add `:z` to the volume mount: `-v "./workspace/.spec-workflow:/workspace/.spec-workflow:rw,z"`

#### 3. Dashboard Not Accessible

**Check:**
- Container is running: `docker ps`
- Port is properly mapped: `docker port <container-id>`
- Firewall allows connections on the port
- Access via: `http://localhost:5000` (or your custom port)

#### 4. Build Fails

**Error:** Build fails with COPY or dependency errors

**Solutions:**
- Ensure you're building from the repository root: `docker build -f containers/Dockerfile -t spec-workflow-mcp .`
- Check that all source files are present
- Verify `package.json` and `package-lock.json` exist

### Viewing Logs

#### Docker CLI
```bash
docker logs <container-id>
docker logs -f <container-id>  # Follow logs
```

#### Docker Compose
```bash
docker-compose logs
docker-compose logs -f  # Follow logs
```

### Inspecting the Container

```bash
# View container details
docker inspect <container-id>

# Access container shell
docker exec -it <container-id> /bin/sh
```

## Advanced Configuration

### Running in Detached Mode

```bash
docker run -d \
  --name spec-workflow-dashboard \
  -p 5000:5000 \
  -v "./workspace/.spec-workflow:/workspace/.spec-workflow:rw" \
  spec-workflow-mcp
```

### Auto-Restart on Failure

```bash
docker run -d \
  --name spec-workflow-dashboard \
  --restart unless-stopped \
  -p 5000:5000 \
  -v "./workspace/.spec-workflow:/workspace/.spec-workflow:rw" \
  spec-workflow-mcp
```

### Health Checks

The dashboard doesn't currently include health checks, but you can test connectivity:

```bash
curl http://localhost:5000
```

## Security Considerations

- The container runs as a non-root user (`node`) for security
- Only expose necessary ports
- Use read-only volume mounts where possible (though `:rw` is required for `.spec-workflow`)
- Keep the base image updated: `docker pull node:24-alpine`

## Performance Tips

- The container is optimized for production with:
  - Multi-stage builds to minimize image size
  - Only production dependencies in final image
  - Alpine Linux for small footprint
  
- Monitor resource usage:
  ```bash
  docker stats <container-id>
  ```

## Additional Resources

- [Main Documentation](../README.md)
- [User Guide](../docs/USER-GUIDE.md)
- [Troubleshooting Guide](../docs/TROUBLESHOOTING.md)
- [GitHub Repository](https://github.com/Pimzino/spec-workflow-mcp)

## Support

If you encounter issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review logs: `docker logs <container-id>`
3. Open an issue on [GitHub](https://github.com/Pimzino/spec-workflow-mcp/issues)
4. Include:
   - Docker version: `docker --version`
   - Operating system
   - Error messages
   - Steps to reproduce
