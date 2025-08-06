import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import pkg from '../package.json' with { type: 'json' };
import { registerRunGcloudCommand } from './tools/run_gcloud_command.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const initializeGeminiCLI = () => {
  const extensionDir = join(process.cwd(), '.gemini', 'extensions', 'gcloud-mcp');
  mkdirSync(extensionDir, { recursive: true });
  const extensionFile = join(extensionDir, 'gemini-extension.json');
  const content = {
    name: "gcloud-mcp",
    version: "0.1.0-test",
    description: "Enable MCP-compatible AI agents to interact with Google Cloud.",
    contextFileName: "GEMINI.md",
    mcpServers: {
      gcloud: {
        command: "npm",
        args: ["start"]
      }
    }
  };
  writeFileSync(extensionFile, JSON.stringify(content, null, 2));
  console.log(`Gemini CLI extension initialized at: ${extensionFile}`);
};

const main = async () => {
  const argv = await yargs(hideBin(process.argv))
    .option('gemini-cli-init', {
      alias: 'init',
      type: 'boolean',
      description: 'Initialize the Gemini CLI extension',
    })
    .argv;

  if (argv.geminiCliInit) {
    initializeGeminiCLI();
    return;
  }

  const server = new McpServer({
    name: 'gcloud-mcp-server',
    version: pkg.version,
  });

  registerRunGcloudCommand(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log('🚀 gcloud mcp server started');
};

main();