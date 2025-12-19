const { z } = require('zod');
const { listAcl, getAcl, insertAcl, deleteAcl, updateAcl, patchAcl, watchAcl } = require('../calendar');

function registerAclTools(server, checkAuth) {
    server.tool(
        'list_acl',
        {
            calendarId: z.string().optional().default('primary'),
        },
        async ({ calendarId }) => {
            const authError = await checkAuth();
            if (authError) return authError;

            try {
                const acl = await listAcl({ calendarId });
                return {
                    content: [{ type: 'text', text: JSON.stringify(acl, null, 2) }],
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
        'get_acl',
        {
            calendarId: z.string().optional().default('primary'),
            ruleId: z.string(),
        },
        async ({ calendarId, ruleId }) => {
            const authError = await checkAuth();
            if (authError) return authError;

            try {
                const rule = await getAcl({ calendarId, ruleId });
                return {
                    content: [{ type: 'text', text: JSON.stringify(rule, null, 2) }],
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
        'insert_acl',
        {
            calendarId: z.string().optional().default('primary'),
            role: z.enum(['none', 'freeBusyReader', 'reader', 'writer', 'owner']),
            scope: z.object({
                type: z.enum(['user', 'group', 'domain', 'default']),
                value: z.string().optional(),
            }),
        },
        async ({ calendarId, role, scope }) => {
            const authError = await checkAuth();
            if (authError) return authError;

            try {
                const rule = await insertAcl({ calendarId, role, scope });
                return {
                    content: [{ type: 'text', text: `ACL Rule Created: ${JSON.stringify(rule, null, 2)}` }],
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
        'delete_acl',
        {
            calendarId: z.string().optional().default('primary'),
            ruleId: z.string(),
        },
        async ({ calendarId, ruleId }) => {
            const authError = await checkAuth();
            if (authError) return authError;

            try {
                await deleteAcl({ calendarId, ruleId });
                return {
                    content: [{ type: 'text', text: `ACL Rule Deleted Successfully` }],
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
        'update_acl',
        {
            calendarId: z.string().optional().default('primary'),
            ruleId: z.string(),
            role: z.enum(['none', 'freeBusyReader', 'reader', 'writer', 'owner']),
            scope: z.object({
                type: z.enum(['user', 'group', 'domain', 'default']),
                value: z.string().optional(),
            }),
        },
        async ({ calendarId, ruleId, role, scope }) => {
            const authError = await checkAuth();
            if (authError) return authError;

            try {
                const rule = await updateAcl({ calendarId, ruleId, role, scope });
                return {
                    content: [{ type: 'text', text: `ACL Rule Updated: ${JSON.stringify(rule, null, 2)}` }],
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
        'patch_acl',
        {
            calendarId: z.string().optional().default('primary'),
            ruleId: z.string(),
            role: z.enum(['none', 'freeBusyReader', 'reader', 'writer', 'owner']).optional(),
            scope: z.object({
                type: z.enum(['user', 'group', 'domain', 'default']),
                value: z.string().optional(),
            }).optional(),
        },
        async ({ calendarId, ruleId, role, scope }) => {
            const authError = await checkAuth();
            if (authError) return authError;

            try {
                const rule = await patchAcl({ calendarId, ruleId, role, scope });
                return {
                    content: [{ type: 'text', text: `ACL Rule Patched: ${JSON.stringify(rule, null, 2)}` }],
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
        'watch_acl',
        {
            calendarId: z.string().optional().default('primary'),
            resource: z.object({
                id: z.string(),
                type: z.literal('web_hook'),
                address: z.string(),
                token: z.string().optional(),
                expiration: z.string().optional(),
            }),
        },
        async ({ calendarId, resource }) => {
            const authError = await checkAuth();
            if (authError) return authError;

            try {
                const result = await watchAcl({ calendarId, resource });
                return {
                    content: [{ type: 'text', text: `Watch Started: ${JSON.stringify(result, null, 2)}` }],
                };
            } catch (e) {
                return {
                    content: [{ type: 'text', text: `Error: ${e.message}` }],
                    isError: true,
                };
            }
        }
    );
}

module.exports = { registerAclTools };
