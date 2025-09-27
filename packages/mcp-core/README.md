# MCP Core

This package contains the core logic and CLI for all APIMatic-generated MCP Servers.

It supports `stdio`(standard input/output) and `http` transports.

## Prerequisite

Node.js version 22 or greater is required. This is necessary for installing dependencies and running tests.

## Technical Details

The entry point to the CLI is the `executeMcpServerCli` function. Use it to run the CLI programmatically.

This package uses [`metadata-interfaces`](../metadata-interfaces/) to consume the SDK.
