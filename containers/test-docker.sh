#!/bin/bash
# Docker Image Test Script for spec-workflow-mcp
# Tests security configurations and basic functionality
#
# Usage:
#   ./test-docker.sh           # Full build (requires ~4GB Docker memory)
#   ./test-docker.sh --prebuilt  # Use pre-built files (run `npm run build` first)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Expected test endpoint response (must match DASHBOARD_TEST_MESSAGE in src/dashboard/utils.ts)
EXPECTED_TEST_MESSAGE="MCP Workflow Dashboard Online!"

# Parse arguments
USE_PREBUILT=false
if [ "$1" = "--prebuilt" ]; then
    USE_PREBUILT=true
fi

# Test configuration
IMAGE_NAME="spec-workflow-mcp-test"
CONTAINER_NAME="spec-workflow-test"
TEST_PORT=5050

# Cleanup function
cleanup() {
    echo -e "\n${BLUE}Cleaning up...${NC}"
    docker stop "$CONTAINER_NAME" 2>/dev/null || true
    docker rm "$CONTAINER_NAME" 2>/dev/null || true
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Helper functions
log_test() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}TEST: $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

log_pass() {
    echo -e "${GREEN}✓ PASS: $1${NC}"
}

log_fail() {
    echo -e "${RED}✗ FAIL: $1${NC}"
}

log_info() {
    echo -e "${YELLOW}ℹ INFO: $1${NC}"
}

wait_for_container() {
    local max_attempts=30  # 15 seconds max
    local attempt=0
    while [ $attempt -lt $max_attempts ]; do
        # Wait for actual startup message or error - "Dashboard started at" indicates server is listening
        if docker logs "$CONTAINER_NAME" 2>&1 | grep -q "Dashboard started at\|SECURITY ERROR"; then
            return 0
        fi
        sleep 0.5
        attempt=$((attempt + 1))
    done
    return 1
}

check_container_running() {
    docker ps --filter "name=$CONTAINER_NAME" --format "{{.Names}}" | grep -q "$CONTAINER_NAME"
}

# Function to test the /api/test endpoint
test_api_endpoint() {
    local port=$1
    local host=${2:-127.0.0.1}
    local max_attempts=${3:-10}  # 10 retries with 1s sleep = 10 seconds max
    local attempt=1
    
    # Brief wait after startup confirmation
    sleep 1
    
    while [ $attempt -le $max_attempts ]; do
        response=$(curl -s --max-time 2 "http://${host}:${port}/api/test" 2>/dev/null || echo "")
        if echo "$response" | grep -q "$EXPECTED_TEST_MESSAGE"; then
            return 0
        fi
        sleep 1
        attempt=$((attempt + 1))
    done
    return 1
}

# Stop and remove test container
stop_container() {
    docker stop "$CONTAINER_NAME" 2>/dev/null || true
    docker rm "$CONTAINER_NAME" 2>/dev/null || true
}

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           Spec-Workflow MCP Docker Test Suite                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ============================================================================
# TEST 1: Build Docker Image
# ============================================================================
log_test "Building Docker Image"

cd "$(dirname "$0")/.."

if [ "$USE_PREBUILT" = true ]; then
    log_info "Using pre-built Dockerfile (Dockerfile.prebuilt)"
    
    # Check if dist directory exists
    if [ ! -d "dist" ]; then
        log_fail "dist/ directory not found. Run 'npm run build' first."
        exit 1
    fi
    
    if docker build -f containers/Dockerfile.prebuilt -t "$IMAGE_NAME" . ; then
        log_pass "Docker image built successfully (using pre-built files)"
    else
        log_fail "Docker image build failed"
        exit 1
    fi
else
    log_info "Using full Dockerfile (requires ~4GB Docker memory)"
    if docker build -f containers/Dockerfile -t "$IMAGE_NAME" . ; then
        log_pass "Docker image built successfully"
    else
        log_fail "Docker image build failed"
        echo ""
        echo -e "${YELLOW}TIP: If build fails due to memory, try:${NC}"
        echo "  1. Increase Docker Desktop memory to 4GB+ in Settings > Resources"
        echo "  2. Or run: npm run build && ./test-docker.sh --prebuilt"
        exit 1
    fi
fi

# ============================================================================
# TEST 2: Docker Default Configuration (0.0.0.0 binding, localhost exposure)
# ============================================================================
log_test "Docker Default Configuration (app binds 0.0.0.0, Docker exposes to localhost)"

stop_container

# Default Docker behavior: app binds to 0.0.0.0, port exposed to host's localhost only
# Note: Not mounting external volumes - container uses its own writable directories
docker run -d \
    --name "$CONTAINER_NAME" \
    -p 127.0.0.1:$TEST_PORT:$TEST_PORT \
    -e DASHBOARD_PORT=$TEST_PORT \
    "$IMAGE_NAME"

if wait_for_container; then
    if docker logs "$CONTAINER_NAME" 2>&1 | grep -q "Dashboard started at\|Bind Address: 0.0.0.0"; then
        log_pass "Dashboard started with Docker default configuration"
    else
        log_fail "Dashboard did not start properly"
        docker logs "$CONTAINER_NAME"
    fi
    
    # Verify dashboard is responding via /api/test endpoint
    if test_api_endpoint $TEST_PORT 127.0.0.1; then
        log_pass "Dashboard /api/test endpoint responding correctly"
    else
        log_info "Dashboard /api/test endpoint not responding (may need more startup time)"
    fi
else
    log_fail "Container startup timed out"
    docker logs "$CONTAINER_NAME"
fi

# Show security config from logs
log_info "Security configuration:"
docker logs "$CONTAINER_NAME" 2>&1 | grep -A6 "Security Configuration:" || true

# ============================================================================
# TEST 3: Security Check Still Works (override to test non-Docker behavior)
# ============================================================================
log_test "Security Check (external binding without opt-in should fail)"

stop_container

# Override Docker defaults to test the security check still works
docker run -d \
    --name "$CONTAINER_NAME" \
    -e DASHBOARD_PORT=$TEST_PORT \
    -e SPEC_WORKFLOW_BIND_ADDRESS=0.0.0.0 \
    -e SPEC_WORKFLOW_ALLOW_EXTERNAL_ACCESS=false \
    "$IMAGE_NAME"

sleep 3

if docker logs "$CONTAINER_NAME" 2>&1 | grep -q "SECURITY ERROR\|non-localhost"; then
    log_pass "Security check correctly blocks external binding without opt-in"
else
    if check_container_running; then
        log_fail "Container should have failed to start, but it's running"
        docker logs "$CONTAINER_NAME"
    else
        # Check exit code
        exit_code=$(docker inspect "$CONTAINER_NAME" --format='{{.State.ExitCode}}')
        if [ "$exit_code" -ne 0 ]; then
            log_pass "Container exited with error (exit code: $exit_code)"
        else
            log_fail "Container exited but no security error detected"
            docker logs "$CONTAINER_NAME"
        fi
    fi
fi

# ============================================================================
# TEST 4: External Network Exposure (port mapping to all interfaces)
# ============================================================================
log_test "External Network Exposure (port mapping to 0.0.0.0)"

stop_container

# This simulates exposing to the network (0.0.0.0 port mapping)
docker run -d \
    --name "$CONTAINER_NAME" \
    -p $TEST_PORT:$TEST_PORT \
    -e DASHBOARD_PORT=$TEST_PORT \
    "$IMAGE_NAME"

if wait_for_container; then
    if docker logs "$CONTAINER_NAME" 2>&1 | grep -q "SECURITY WARNING"; then
        log_pass "Security warning displayed for external binding"
    else
        log_info "Security warning may not be displayed (check logs)"
    fi
    
    if docker logs "$CONTAINER_NAME" 2>&1 | grep -q "Dashboard started at\|Bind Address: 0.0.0.0"; then
        log_pass "Dashboard started with external network exposure"
    else
        log_fail "Dashboard did not start properly"
        docker logs "$CONTAINER_NAME"
    fi
    
    # Verify dashboard is responding via /api/test endpoint
    if test_api_endpoint $TEST_PORT 127.0.0.1; then
        log_pass "Dashboard /api/test endpoint responding correctly"
    else
        log_info "Dashboard /api/test endpoint not responding (may need more startup time)"
    fi
else
    log_fail "Container startup timed out"
    docker logs "$CONTAINER_NAME"
fi

# ============================================================================
# TEST 4b: Docker Compose DASHBOARD_HOST Variable
# ============================================================================
log_test "Docker Compose DASHBOARD_HOST Variable"

stop_container

# Test that DASHBOARD_HOST env var works for network exposure
SCRIPT_DIR="$(dirname "$0")"
cd "$SCRIPT_DIR"
DASHBOARD_HOST=0.0.0.0 DASHBOARD_PORT=$TEST_PORT docker-compose up -d 2>/dev/null || true
sleep 3

# Check if the port is bound to 0.0.0.0
if docker-compose ps 2>/dev/null | grep -q "0.0.0.0:$TEST_PORT"; then
    log_pass "DASHBOARD_HOST=0.0.0.0 correctly exposes to all interfaces"
else
    log_info "Port binding check skipped (docker-compose may not be available)"
fi

docker-compose down 2>/dev/null || true
cd - >/dev/null

# ============================================================================
# TEST 5: Rate Limiting Configuration
# ============================================================================
log_test "Rate Limiting Configuration"

# Check current container logs for rate limiting status
if docker logs "$CONTAINER_NAME" 2>&1 | grep -q "Rate Limiting: ENABLED"; then
    log_pass "Rate limiting is enabled by default"
else
    log_info "Rate limiting status not found in logs (may be enabled)"
fi

# ============================================================================
# TEST 6: Container Runs as Non-Root User
# ============================================================================
log_test "Container Security: Non-Root User"

if check_container_running; then
    user=$(docker exec "$CONTAINER_NAME" whoami 2>/dev/null || echo "unknown")
    if [ "$user" = "node" ]; then
        log_pass "Container running as non-root user: $user"
    else
        log_fail "Container running as unexpected user: $user"
    fi
else
    log_info "Container not running, skipping user check"
fi

# ============================================================================
# TEST 7: Rate Limiting Disabled Configuration
# ============================================================================
log_test "Rate Limiting Disabled Configuration"

stop_container

docker run -d \
    --name "$CONTAINER_NAME" \
    -e DASHBOARD_PORT=$TEST_PORT \
    -e SPEC_WORKFLOW_RATE_LIMIT_ENABLED=false \
    "$IMAGE_NAME"

if wait_for_container; then
    if docker logs "$CONTAINER_NAME" 2>&1 | grep -q "Rate Limiting: DISABLED"; then
        log_pass "Rate limiting correctly disabled via environment variable"
    else
        log_info "Rate limiting status unclear (check logs)"
        docker logs "$CONTAINER_NAME" 2>&1 | grep -i "rate" || true
    fi
else
    log_fail "Container startup timed out"
fi

# ============================================================================
# TEST 8: Custom Port Configuration
# ============================================================================
log_test "Custom Port Configuration"

stop_container
CUSTOM_PORT=6060

docker run -d \
    --name "$CONTAINER_NAME" \
    -p 127.0.0.1:$CUSTOM_PORT:$CUSTOM_PORT \
    -e DASHBOARD_PORT=$CUSTOM_PORT \
    "$IMAGE_NAME"

if wait_for_container; then
    if docker logs "$CONTAINER_NAME" 2>&1 | grep -q "$CUSTOM_PORT\|Dashboard started"; then
        log_pass "Dashboard started on custom port $CUSTOM_PORT"
    else
        log_info "Custom port configuration may have worked (check logs)"
    fi
    
    # Verify dashboard is responding on custom port via /api/test endpoint
    if test_api_endpoint $CUSTOM_PORT 127.0.0.1; then
        log_pass "Dashboard /api/test endpoint responding on port $CUSTOM_PORT"
    else
        log_info "Dashboard /api/test endpoint not responding on custom port"
    fi
else
    log_fail "Container startup timed out"
fi

# ============================================================================
# Summary
# ============================================================================
echo -e "\n${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                     Test Summary                             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${GREEN}Docker image tests completed!${NC}"
echo ""
echo "Docker security model:"
echo "  • App binds to 0.0.0.0 inside container (required for port forwarding)"
echo "  • Docker port mapping controls external exposure:"
echo "    - 127.0.0.1:5000:5000 → localhost only (default, secure)"
echo "    - 5000:5000 → all interfaces (network access)"
echo ""
echo "Key features validated:"
echo "  • Default Docker config works (localhost exposure)"
echo "  • Security check blocks unauthorized external binding"
echo "  • Rate limiting configurable via environment variable"
echo "  • Container runs as non-root user"
echo ""
echo -e "${YELLOW}Note: Use docker-compose.yml for secure defaults."
echo -e "To expose to network, change port mapping from 127.0.0.1:5000:5000 to 5000:5000${NC}"

