# Antigravity CLI as MCP Agent in Claude Code

Gemini CLI migrated to **Antigravity CLI** on June 18, 2026. This guide sets up `agy` (Antigravity) as a callable MCP subagent inside Claude Code.

---

## Prerequisites

- Claude Code installed
- Node.js installed
- Antigravity CLI installed and authenticated

---

## Step 1 — Install Antigravity CLI

Download from [antigravity.google](https://antigravity.google) and authenticate:

```bash
antigravity auth login
```

Verify the `agy` binary (WSL wrapper) is available:

```bash
agy --version
# expected: 1.0.x
```

Test headless mode works:

```bash
agy -p "hello" --print --dangerously-skip-permissions
```

---

## Step 2 — Install agy-mcp

Install the MCP server package to your local prefix (avoids permission issues):

```bash
npm install -g agy-mcp --prefix ~/.local
```

Verify:

```bash
ls ~/.local/bin/agy-mcp
# /home/<user>/.local/bin/agy-mcp -> ../lib/node_modules/agy-mcp/dist/server.js
```

---

## Step 3 — Add to Claude Code config

Open `~/.claude.json` and find the top-level `mcpServers` object (not inside any project). Add the `antigravity` entry:

```json
"mcpServers": {
  "antigravity": {
    "type": "stdio",
    "command": "node",
    "args": ["/home/<your-user>/.local/lib/node_modules/agy-mcp/dist/server.js"],
    "env": {}
  }
}
```

> **Why `node` instead of the bin path?**
> `agy-mcp` has a broken `isMainModule` guard that uses `path.resolve()` which does not dereference symlinks. When launched via the bin symlink, `main()` never runs and the process exits silently (MCP error `-32000`). Pointing directly at the real `.js` file via `node` bypasses this bug.

Replace `<your-user>` with your actual Linux username. On WSL: `bueno`.

---

## Step 4 — Restart Claude Code

Fully close and reopen Claude Code. The MCP server starts automatically.

Verify in Claude Code:

```
/mcp
```

`antigravity` should show with green status.

---

## Step 5 — Use it

Claude Code can now call Antigravity as a subagent via the `antigravity_code` MCP tool. Example prompt to Claude:

```
Use agy to search the web for X
```

The tool supports:

| Parameter | Description |
|---|---|
| `prompt` | Prompt string to send to agy |
| `workFolder` | Absolute path for agy's working directory |
| `sessionId` | Resume same agy conversation across calls |
| `autoContinue` | Continue most recent agy conversation (`agy -c`) |
| `promptFile` | Path to file containing the prompt |

---

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `-32000 Failed to reconnect` | Symlink `isMainModule` bug | Use `node /path/to/dist/server.js` as command |
| `agy not found` | `agy` not in PATH | Set `AGY_CLI_PATH=/home/<user>/.local/bin/agy` in env |
| MCP not showing | Wrong scope | Ensure entry is in top-level `mcpServers`, not inside a project |
| Silent exit on `npx -y agy-mcp` | Same symlink bug | Use `npm install --prefix ~/.local` + direct node path |

### Enable debug logging temporarily

```json
"env": { "AGY_MCP_DEBUG": "true" }
```

Remove after debugging.

---

## Final config reference

```json
"mcpServers": {
  "antigravity": {
    "type": "stdio",
    "command": "node",
    "args": ["/home/bueno/.local/lib/node_modules/agy-mcp/dist/server.js"],
    "env": {}
  }
}
```
