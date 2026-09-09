# pm2-mcp pkgx package

This pantry entry installs PM2 with Model Context Protocol (MCP) server support. PM2 is a production process manager for Node.js applications, and this fork adds MCP server capabilities for managing processes through MCP-compatible clients like Claude Code and Codex.

## Features

- **PM2 Process Manager**: All standard PM2 functionality for managing Node.js applications
- **MCP Server**: Built-in `pm2-mcp` binary that exposes process management via MCP
- **12 MCP Tools**: Process lifecycle management, logging, and monitoring
- **2 MCP Resources**: Real-time process list and detailed process information
- **Sandbox Detection**: Automatically adapts to sandboxed environments
- **Multiple Transports**: Supports stdio and HTTP transports

## Installation

```bash
# Install with pkgx
pkgx install github.com/PromptExecution/pm2-mcp

# Or use directly
pkgx pm2-mcp --help
pkgx pm2 --version
```

## Packaging details

- Downloads source tarball from GitHub releases
- Installs using `npm install --global` to `{{prefix}}`
- Provides all PM2 binaries: `pm2`, `pm2-dev`, `pm2-docker`, `pm2-runtime`, `pm2-mcp`
- Requires Node.js >= 22.0.0
- Version discovery via GitHub tags (strips leading `v`)

## Usage with MCP Clients

### Claude Code
```bash
claude mcp add pm2-mcp -- pm2-mcp
```

### Codex
```bash
codex mcp add pm2-mcp -- pm2-mcp
```

## MCP Tools Available

- `pm2_list_processes` - List all PM2 processes
- `pm2_describe_process` - Get detailed process information
- `pm2_start_process` - Start a new process
- `pm2_restart_process` - Restart a process
- `pm2_reload_process` - Zero-downtime reload (cluster mode)
- `pm2_stop_process` - Stop a process
- `pm2_delete_process` - Delete a process
- `pm2_flush_logs` - Flush process logs
- `pm2_reload_logs` - Rotate and reopen logs
- `pm2_dump` - Save process list to disk
- `pm2_tail_logs` - Read last N lines from logs
- `pm2_kill_daemon` - Stop PM2 daemon

## More Information

- **Repository**: https://github.com/PromptExecution/pm2-mcp
- **Original PM2**: https://github.com/Unitech/pm2
- **MCP Specification**: https://modelcontextprotocol.io/
- **Documentation**: See README.md in the repository for complete MCP server documentation
