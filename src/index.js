#!/usr/bin/env node
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');
const { startCallbackServer, getAuthUrl } = require('./auth');


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

const { registerAclTools } = require('./tools/acl_tools');
const { registerCalendarListTools } = require('./tools/calendar_list_tools');
const { registerCalendarsTools } = require('./tools/calendars_tools');
const { registerChannelsTools } = require('./tools/channels_tools');
const { registerColorsTools } = require('./tools/colors_tools');
const { registerEventsTools } = require('./tools/events_tools');
const { registerFreebusyTools } = require('./tools/freebusy_tools');
const { registerSettingsTools } = require('./tools/settings_tools');

registerAclTools(server, checkAuth);
registerCalendarListTools(server, checkAuth);
registerCalendarsTools(server, checkAuth);
registerChannelsTools(server, checkAuth);
registerColorsTools(server, checkAuth);
registerEventsTools(server, checkAuth);
registerFreebusyTools(server, checkAuth);
registerSettingsTools(server, checkAuth);


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
