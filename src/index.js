#!/usr/bin/env node
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');
const { startCallbackServer, getAuthUrl } = require('./auth');
const { listEvents, createEvent } = require('./calendar');

// Global state for auth
let lastAuthenticatedUser = null;

// Initialize MCP Server
const server = new McpServer({
    name: 'google-calendar-manager',
    version: '1.0.0',
});

// Helper check for auth
async function checkAuth() {
    if (!lastAuthenticatedUser) {
        const authUrl = await getAuthUrl();
        return {
            content: [{ type: 'text', text: `Please log in to continue: ${authUrl}` }],
            isError: true
        };
    }
    return null;
}

server.tool(
    'list_events',
    {
        timeMin: z.string().optional().describe('ISO date string (default: now)'),
        timeMax: z.string().optional().describe('ISO date string'),
        maxResults: z.number().optional().default(10),
    },
    async ({ timeMin, timeMax, maxResults }) => {
        const authError = await checkAuth();
        if (authError) return authError;

        try {
            const events = await listEvents({ timeMin, timeMax, maxResults });
            return {
                content: [{ type: 'text', text: JSON.stringify(events, null, 2) }],
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error: ${e.message}` }],
                isError: true,
            };
        }
    }
);

server.tool(
    'create_event',
    {
        summary: z.string(),
        description: z.string().optional(),
        start: z.string().describe('ISO date string (e.g., 2025-12-25T10:00:00)'),
        end: z.string().describe('ISO date string'),
        attendees: z.array(z.string().email()).optional(),
        location: z.string().optional(),
    },
    async ({ summary, description, start, end, attendees, location }) => {
        const authError = await checkAuth();
        if (authError) return authError;

        try {
            const event = await createEvent({ summary, description, start, end, attendees, location });
            return {
                content: [{ type: 'text', text: `Event Created: ${event.htmlLink}` }],
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error: ${e.message}` }],
                isError: true,
            };
        }
    }
);

// Start Server
async function main() {
    // Start background listener
    startCallbackServer((user) => {
        console.error(`User logged in: ${user.email}`);
        lastAuthenticatedUser = user;
    });

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Google Calendar MCP Server running on stdio');
}

main();
