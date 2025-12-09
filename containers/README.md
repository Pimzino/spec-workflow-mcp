# Spec-Workflow MCP Docker Setup

This directory contains Docker configuration files to run the Spec-Workflow MCP dashboard in a containerized environment. This setup provides isolation and easy deployment for the dashboard service.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Testing the Docker Image](#testing-the-docker-image)
- [Building the Image](#building-the-image)
- [Running the Dashboard](#running-the-dashboard)
- [Using Docker Compose](#using-docker-compose)
- [Configuration Options](#configuration-options)
- [Security Configuration](#security-configuration)
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

## Testing the Docker Image

A comprehensive test script is provided to validate the Docker image configurations:

```bash
# From the containers directory
./test-docker.sh
```

The test script validates:

| Test | Description |
|------|-------------|
| **Image Build** | Verifies the Docker image builds successfully |
| **Docker Default Config** | Tests app binding to 0.0.0.0, Docker exposing to localhost |
| **Security Check** | Verifies app-level security block (when overriding Docker defaults) |
| **Network Exposure** | Tests full network port mapping |
| **Rate Limiting** | Verifies rate limiting configuration |
| **Non-Root User** | Confirms container runs as non-privileged user |
| **Custom Port** | Tests custom port configuration |

### Running Individual Tests

You can also manually test specific configurations:

```bash
# Test default Docker config (localhost-only access)
docker run --rm \
  -p 127.0.0.1:5000:5000 \
  spec-workflow-mcp
# Expected: Dashboard starts, accessible only from host machine

# Test network access (exposes to all interfaces)
docker run --rm \
  -p 5000:5000 \
  spec-workflow-mcp
# Expected: Dashboard starts with security warning

# Test app-level security check (override Docker defaults)
docker run --rm \
  -e SPEC_WORKFLOW_ALLOW_EXTERNAL_ACCESS=false \
  spec-workflow-mcp
# Expected: SECURITY ERROR (app blocks external binding)
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

| Variable | Default (Docker) | Description |
|----------|------------------|-------------|
| `DASHBOARD_PORT` | `5000` | Port on which the dashboard runs |
| `DASHBOARD_HOST` | `127.0.0.1` | Host IP for port binding (`0.0.0.0` for network access) |
| `SPEC_WORKFLOW_PATH` | `/workspace` | Path to the project directory (inside container) |
| `SPEC_WORKFLOW_BIND_ADDRESS` | `0.0.0.0` | IP address to bind to inside container (Docker requires 0.0.0.0 for port forwarding) |
| `SPEC_WORKFLOW_ALLOW_EXTERNAL_ACCESS` | `true` | Set to true in Docker (external access controlled by port mapping) |
| `SPEC_WORKFLOW_RATE_LIMIT_ENABLED` | `true` | Enable/disable rate limiting |
| `SPEC_WORKFLOW_CORS_ENABLED` | `true` | Enable/disable CORS |

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

## Security Configuration

The Docker image includes several security features that are enabled by default.

### Docker Networking Model

In Docker, the application binds to `0.0.0.0` inside the container (required for Docker's port forwarding to work). **Security is controlled by Docker's port mapping**, not by the application's bind address.

#### Option 1: Localhost Only (Secure Default)

The default `docker-compose.yml` uses localhost-only port mapping:

```yaml
ports:
  - "127.0.0.1:5000:5000"  # Only accessible from host machine
```

Or with Docker CLI:

```bash
docker run -p 127.0.0.1:5000:5000 \
  -v "./workspace/.spec-workflow:/workspace/.spec-workflow:rw" \
  spec-workflow-mcp
```

✅ **This is the recommended configuration.** The dashboard is only accessible from your local machine.

#### Option 2: Network Access (Use with Caution)

To allow access from other machines on your network, use `DASHBOARD_HOST=0.0.0.0`:

**With Docker Compose (recommended):**

```bash
# Expose to all network interfaces
DASHBOARD_HOST=0.0.0.0 docker-compose up

# Or bind to a specific IP
DASHBOARD_HOST=192.168.1.100 docker-compose up
```

**With Docker CLI:**

```bash
docker run -p 0.0.0.0:5000:5000 \
  -v "./workspace/.spec-workflow:/workspace/.spec-workflow:rw" \
  spec-workflow-mcp

# Or bind to a specific IP
docker run -p 192.168.1.100:5000:5000 \
  -v "./workspace/.spec-workflow:/workspace/.spec-workflow:rw" \
  spec-workflow-mcp
```

⚠️ **Security Warning:** This exposes the dashboard to your network. The application will display a security warning in the logs. Only use when necessary and ensure proper network security measures (firewall, VPN) are in place.

### Rate Limiting

Rate limiting protects against abuse and DoS attacks. It's enabled by default (120 requests/minute per client).

```bash
# Disable rate limiting (not recommended)
docker run -e SPEC_WORKFLOW_RATE_LIMIT_ENABLED=false spec-workflow-mcp
```

### Docker Compose Security Settings

The provided `docker-compose.yml` includes additional security hardening:

```yaml
# Read-only root filesystem
read_only: true

# Drop all Linux capabilities
cap_drop:
  - ALL

# Prevent privilege escalation
security_opt:
  - no-new-privileges:true

# Resource limits (prevent DoS)
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 512M
```

### Security Best Practices

1. **Use localhost port mapping** when possible (`127.0.0.1:5000:5000`)
2. **Never expose to public internet** without proper authentication/firewall
3. **Keep rate limiting enabled** in production
4. **Use the provided docker-compose.yml** for security hardening
5. **Run as non-root user** (default in the image)
6. **Mount volumes read-write only when necessary**

### Audit Logging

All API requests are logged to a structured JSON audit log for compliance and debugging.

**Log Location:** `<project>/.spec-workflow/audit.log`

**Log Format:**
```json
{
  "timestamp": "2025-12-06T10:30:45.123Z",
  "actor": "127.0.0.1",
  "action": "GET /api/projects/list",
  "resource": "/api/projects/list",
  "result": "success",
  "details": {
    "statusCode": 200,
    "duration": 45,
    "userAgent": "Mozilla/5.0..."
  }
}
```

**Viewing Logs:**
```bash
# View recent logs
tail -f .spec-workflow/audit.log

# Parse as JSON (requires jq)
cat .spec-workflow/audit.log | jq '.'

# Filter by result
cat .spec-workflow/audit.log | jq 'select(.result == "denied")'
```

### External Access with Authentication

The dashboard does not include built-in authentication. For external access, use a reverse proxy:

**Option 1: nginx with Basic Auth**
```nginx
server {
    listen 443 ssl;
    server_name dashboard.example.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    auth_basic "Dashboard Access";
    auth_basic_user_file /etc/nginx/.htpasswd;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

**Option 2: OAuth2 Proxy (for SSO)**
```bash
oauth2-proxy \
  --upstream=http://127.0.0.1:5000 \
  --http-address=0.0.0.0:4180 \
  --provider=google \
  --client-id=YOUR_CLIENT_ID \
  --client-secret=YOUR_CLIENT_SECRET
```

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

The Docker image implements enterprise-grade security controls:

| Feature | Status | Description |
|---------|--------|-------------|
| **Non-root User** | ✅ Enabled | Runs as `node` user (UID 1000) |
| **Rate Limiting** | ✅ Enabled | 120 req/min per client |
| **Audit Logging** | ✅ Enabled | JSON logs with 30-day retention |
| **Security Headers** | ✅ Enabled | XSS, clickjacking, MIME sniffing protection |
| **CORS Protection** | ✅ Enabled | Localhost origins only by default |
| **Localhost Binding** | ✅ Default | `127.0.0.1:5000:5000` in docker-compose |
| **HTTPS/TLS** | ❌ Not built-in | Use reverse proxy (nginx/Apache) |
| **User Authentication** | ❌ Not built-in | Use reverse proxy with Basic Auth or OAuth2 |

**Best Practices:**
- Keep the base image updated: `docker pull node:24-alpine`
- Use read-only volume mounts where possible (`:rw` required for `.spec-workflow`)
- For network access, always use a reverse proxy with TLS and authentication
- Review audit logs regularly for security monitoring

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
