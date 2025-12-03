#!/bin/bash

# Spec-Workflow MCP Setup Script
# This script configures .mcp.json for use with spec-workflow-mcp container

set -e

#############################################
# CONSTANTS
#############################################
readonly SCRIPT_NAME="$(basename "$0")"
readonly IMAGE_NAME="spec-workflow-mcp:latest"
readonly MCP_FILENAME=".mcp.json"
readonly SPEC_WORKFLOW_DIRNAME=".spec-workflow"
readonly MCP_SERVER_NAME="spec-workflow"
readonly PACKAGE_JSON_IDENTIFIER="spec-workflow-mcp"

# Colours
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

# Exit codes
readonly EXIT_SUCCESS=0
readonly EXIT_ERROR=1
readonly EXIT_USER_CANCEL=2

#############################################
# HELPER FUNCTIONS
#############################################

log_info() {
    echo -e "${BLUE}$1${NC}"
}

log_success() {
    echo -e "${GREEN}$1${NC}"
}

log_warning() {
    echo -e "${YELLOW}$1${NC}"
}

log_error() {
    echo -e "${RED}$1${NC}"
}

show_help() {
    cat << EOF
Spec-Workflow MCP Container Setup Script

USAGE:
    $SCRIPT_NAME [OPTIONS] [PROJECT_DIRECTORY]

DESCRIPTION:
    Configures $MCP_FILENAME for use with the $IMAGE_NAME Docker container.
    Creates the necessary $SPEC_WORKFLOW_DIRNAME directory with correct permissions.

OPTIONS:
    -h, --help          Show this help message and exit

ARGUMENTS:
    PROJECT_DIRECTORY   Target directory for spec-workflow setup (default: current directory)

USAGE EXAMPLES:
    # Setup in current directory (run from your project directory):
    $SCRIPT_NAME

    # Setup in a specific project directory (run from anywhere):
    $SCRIPT_NAME /path/to/your/project

    # Setup in a specific directory (run from spec-workflow-mcp repo):
    ./containers/setup-mcp.sh /path/to/your/project

IMPORTANT:
    - Run this script FROM your project directory, OR
    - Run this script with your project directory as an argument
    - DO NOT run this in the spec-workflow-mcp source directory unless you want to
      configure spec-workflow for development purposes
EOF
}

confirm_action() {
    local prompt="$1"
    echo ""
    read -p "$prompt (y/N): " -n 1 -r
    echo ""
    [[ $REPLY =~ ^[Yy]$ ]]
}

check_docker_available() {
    if ! command -v docker &> /dev/null; then
        log_error "Error: Docker is not installed or not in PATH"
        exit $EXIT_ERROR
    fi
}

check_image_exists() {
    if ! docker image inspect "$IMAGE_NAME" &> /dev/null; then
        log_warning "Warning: $IMAGE_NAME image not found"
        echo "Please build the image first:"
        echo "  cd containers/"
        echo "  docker build -t ${IMAGE_NAME%:*} ."
        echo ""

        if ! confirm_action "Continue anyway?"; then
            exit $EXIT_USER_CANCEL
        fi
    fi
}

is_in_source_directory() {
    [[ -f "$(pwd)/package.json" ]] && grep -q "$PACKAGE_JSON_IDENTIFIER" "$(pwd)/package.json" 2>/dev/null
}

warn_if_source_directory() {
    local project_dir="$1"

    if is_in_source_directory && [[ "$project_dir" == "$(pwd)" ]]; then
        log_warning "Warning: You appear to be running this script in the $PACKAGE_JSON_IDENTIFIER source directory"
        echo "This will configure spec-workflow for the source code directory itself."
        echo "If you want to configure a different project, run:"
        echo "  $0 /path/to/your/project"

        if ! confirm_action "Continue with current directory?"; then
            echo "Cancelled. Run the script with your target project directory as an argument."
            exit $EXIT_USER_CANCEL
        fi
    fi
}

generate_mcp_config() {
    local project_dir="$1"
    local user_id="$2"
    local group_id="$3"

    cat <<EOF
{
  "mcpServers": {
    "$MCP_SERVER_NAME": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "--user", "$user_id:$group_id",
        "-v", "$project_dir:$project_dir:rw",
        "--entrypoint=node",
        "$IMAGE_NAME",
        "/app/dist/index.js", "$project_dir"
      ]
    }
  }
}
EOF
}

has_jq() {
    command -v jq &> /dev/null
}

backup_file() {
    local file="$1"
    local backup_file="${file}.backup"

    log_info "Creating backup: $backup_file"
    cp "$file" "$backup_file"
}

update_existing_mcp_config() {
    local mcp_file="$1"
    local new_config="$2"

    if ! has_jq; then
        log_warning "jq not found. Please manually merge the following configuration:"
        echo ""
        echo "$new_config"
        exit $EXIT_ERROR
    fi

    local server_config
    server_config=$(echo "$new_config" | jq ".mcpServers.\"$MCP_SERVER_NAME\"")

    jq --argjson newconfig "$server_config" ".mcpServers.\"$MCP_SERVER_NAME\" = \$newconfig" "$mcp_file" > "${mcp_file}.tmp"
    mv "${mcp_file}.tmp" "$mcp_file"
}

handle_existing_mcp_file() {
    local mcp_file="$1"
    local mcp_config="$2"

    log_warning "Found existing $mcp_file"

    if grep -q "\"$MCP_SERVER_NAME\"" "$mcp_file"; then
        log_warning "$MCP_SERVER_NAME configuration already exists"

        if ! confirm_action "Overwrite existing $MCP_SERVER_NAME configuration?"; then
            echo "Setup cancelled."
            exit $EXIT_USER_CANCEL
        fi

        backup_file "$mcp_file"
        update_existing_mcp_config "$mcp_file" "$mcp_config"
        log_success "Updated existing $mcp_file"
    else
        log_info "Adding $MCP_SERVER_NAME to existing $mcp_file"
        update_existing_mcp_config "$mcp_file" "$mcp_config"
        log_success "Added $MCP_SERVER_NAME to existing $mcp_file"
    fi
}

create_new_mcp_file() {
    local mcp_file="$1"
    local mcp_config="$2"

    log_info "Creating new $mcp_file"
    echo "$mcp_config" > "$mcp_file"
    log_success "Created $mcp_file"
}

ensure_spec_workflow_directory() {
    local spec_workflow_dir="$1"
    local user_id="$2"
    local group_id="$3"

    if [[ ! -d "$spec_workflow_dir" ]]; then
        log_info "Creating $SPEC_WORKFLOW_DIRNAME directory"
        mkdir -p "$spec_workflow_dir"
        log_success "Created $spec_workflow_dir with user permissions (UID:$user_id, GID:$group_id)"
    else
        log_info "$SPEC_WORKFLOW_DIRNAME directory already exists"

        # Check if directory is owned by root
        local dir_owner_id=$(stat -c "%u" "$spec_workflow_dir" 2>/dev/null || stat -f "%u" "$spec_workflow_dir" 2>/dev/null)
        local dir_group_id=$(stat -c "%g" "$spec_workflow_dir" 2>/dev/null || stat -f "%g" "$spec_workflow_dir" 2>/dev/null)

        if [[ "$dir_owner_id" == "0" ]] || [[ "$dir_group_id" == "0" ]]; then
            log_warning "Warning: $SPEC_WORKFLOW_DIRNAME is owned by root (UID:$dir_owner_id, GID:$dir_group_id)"
            echo "This likely means the Docker container was run before this setup script."
            echo "The container may not be able to write to this directory."
            echo ""
            echo "To fix this, run:"
            echo "  sudo chown -R $user_id:$group_id $spec_workflow_dir"
            echo ""

            if ! confirm_action "Continue anyway?"; then
                exit $EXIT_USER_CANCEL
            fi
        elif [[ "$dir_owner_id" != "$user_id" ]] || [[ "$dir_group_id" != "$group_id" ]]; then
            log_warning "Warning: $SPEC_WORKFLOW_DIRNAME ownership (UID:$dir_owner_id, GID:$dir_group_id) doesn't match current user (UID:$user_id, GID:$group_id)"
            echo "The container may have permission issues."
            echo ""
            echo "To fix this, run:"
            echo "  sudo chown -R $user_id:$group_id $spec_workflow_dir"
            echo ""

            if ! confirm_action "Continue anyway?"; then
                exit $EXIT_USER_CANCEL
            fi
        else
            log_success "$SPEC_WORKFLOW_DIRNAME directory has correct permissions"
        fi
    fi
}

show_next_steps() {
    local user_id="$1"
    local group_id="$2"

    echo ""
    log_success "Setup complete!"
    echo ""

    local script_dir
    script_dir=$(dirname "$(realpath "$0")")

    if [[ "$script_dir" == */$PACKAGE_JSON_IDENTIFIER/containers* ]] || is_in_source_directory; then
        echo "Next steps:"
        echo "1. Build the Docker image:"
        echo "   docker build -t ${IMAGE_NAME%:*} ."
    else
        echo "Next steps:"
        echo "1. Build the Docker image (run from the $PACKAGE_JSON_IDENTIFIER repository):"
        echo "   cd /path/to/$PACKAGE_JSON_IDENTIFIER/containers/"
        echo "   docker build -t ${IMAGE_NAME%:*} ."
    fi

    cat << EOF

2. Restart Claude to pick up the new MCP configuration

3. Test the connection by asking Claude to use spec-workflow tools
EOF
}

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                shift
                exit $EXIT_SUCCESS
                ;;
            *)
                if [[ -z "${PROJECT_DIR:-}" ]]; then
                    PROJECT_DIR="$1"
                else
                    echo "Error: Multiple project directories specified"
                    exit $EXIT_ERROR
                fi
                shift
                ;;
        esac
    done
}

#############################################
# MAIN FUNCTION
#############################################

main() {
    parse_arguments "$@"

    # Get project directory and user info
    PROJECT_DIR=${PROJECT_DIR:-$(pwd)}
    PROJECT_DIR=$(realpath "$PROJECT_DIR")
    readonly USER_ID=$(id -u)
    readonly GROUP_ID=$(id -g)
    readonly MCP_FILE="$PROJECT_DIR/$MCP_FILENAME"
    readonly SPEC_WORKFLOW_DIR="$PROJECT_DIR/$SPEC_WORKFLOW_DIRNAME"

    log_info "Spec-Workflow MCP Container Setup"
    echo "=================================="
    echo "Project directory: $PROJECT_DIR"
    echo "User ID: $USER_ID"
    echo "Group ID: $GROUP_ID"
    echo ""

    check_docker_available
    check_image_exists
    warn_if_source_directory "$PROJECT_DIR"

    # Create .spec-workflow directory early with correct permissions
    ensure_spec_workflow_directory "$SPEC_WORKFLOW_DIR" "$USER_ID" "$GROUP_ID"

    local mcp_config
    mcp_config=$(generate_mcp_config "$PROJECT_DIR" "$USER_ID" "$GROUP_ID")

    if [[ -f "$MCP_FILE" ]]; then
        handle_existing_mcp_file "$MCP_FILE" "$mcp_config"
    else
        create_new_mcp_file "$MCP_FILE" "$mcp_config"
    fi

    show_next_steps "$USER_ID" "$GROUP_ID"
}

# Execute main function with all arguments
main "$@"
