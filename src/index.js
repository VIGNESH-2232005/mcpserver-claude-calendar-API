#!/usr/bin/env node
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');
const { listEmployees, addEmployee, updateEmployee, deleteEmployee } = require('./storage');
const { startCallbackServer, getAuthUrl } = require('./auth');

// Global state for auth
let lastAuthenticatedUser = null;

// Initialize MCP Server
const server = new McpServer({
    name: 'google-employees-link-auth',
    version: '1.0.0',
});

// Helper: Check Auth or Return Link
async function checkAuthOrGetLink() {
    if (lastAuthenticatedUser) {
        // Authenticated! Return user and CLEAR it to enforce "auth every time"
        const user = lastAuthenticatedUser;
        lastAuthenticatedUser = null; // Consume the token
        return { authenticated: true, user };
    } else {
        // Not authenticated. Generate link.
        const url = await getAuthUrl();
        return {
            authenticated: false,
            message: `Authentication Required. Please click the link below to sign in with Google:\n\n${url}\n\nAfter you see "Authentication successful" in your browser, please start this command again.`
        };
    }
}

// Register Tools
server.tool(
    'list_employees',
    {},
    async () => {
        try {
            const authStatus = await checkAuthOrGetLink();
            if (!authStatus.authenticated) {
                return { content: [{ type: 'text', text: authStatus.message }] };
            }

            const employees = await listEmployees();
            return {
                content: [{
                    type: 'text',
                    text: `(Authenticated as ${authStatus.user.email})\n\n${JSON.stringify(employees, null, 2)}`
                }]
            };
        } catch (error) {
            return {
                content: [{ type: 'text', text: `Error: ${error.message}` }],
                isError: true,
            }
        }
    }
);

server.tool(
    'add_employee',
    {
        name: z.string(),
        role: z.string(),
        email: z.string().email(),
    },
    async ({ name, role, email }) => {
        try {
            const authStatus = await checkAuthOrGetLink();
            if (!authStatus.authenticated) {
                return { content: [{ type: 'text', text: authStatus.message }] };
            }

            const result = await addEmployee({ name, role, email });
            return {
                content: [{
                    type: 'text',
                    text: `(Authenticated as ${authStatus.user.email}) Successfully added employee: ${JSON.stringify(result, null, 2)}`
                }]
            };
        } catch (error) {
            return {
                content: [{ type: 'text', text: `Error: ${error.message}` }],
                isError: true,
            }
        }
    }
);

server.tool(
    'update_employee',
    {
        id: z.string(),
        name: z.string().optional(),
        role: z.string().optional(),
        email: z.string().email().optional(),
    },
    async ({ id, name, role, email }) => {
        try {
            const authStatus = await checkAuthOrGetLink();
            if (!authStatus.authenticated) {
                return { content: [{ type: 'text', text: authStatus.message }] };
            }

            const result = await updateEmployee(id, { name, role, email });
            return {
                content: [{
                    type: 'text',
                    text: `(Authenticated as ${authStatus.user.email}) Updated employee: ${JSON.stringify(result, null, 2)}`
                }]
            }
        } catch (error) {
            return {
                content: [{ type: 'text', text: `Error: ${error.message}` }],
                isError: true,
            }
        }
    }
);

server.tool(
    'delete_employee',
    {
        id: z.string(),
    },
    async ({ id }) => {
        try {
            const authStatus = await checkAuthOrGetLink();
            if (!authStatus.authenticated) {
                return { content: [{ type: 'text', text: authStatus.message }] };
            }

            await deleteEmployee(id);
            return {
                content: [{
                    type: 'text',
                    text: `(Authenticated as ${authStatus.user.email}) Deleted employee: ${id}`
                }]
            }
        } catch (error) {
            return {
                content: [{ type: 'text', text: `Error: ${error.message}` }],
                isError: true,
            }
        }
    }
);

// Start Server
async function main() {
    // Start background listener
    startCallbackServer((user) => {
        // console.error(`User logged in: ${user.email}`);
        lastAuthenticatedUser = user;
    });

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Manual Link Auth MCP Server running on stdio');
}

main();
