const { z } = require('zod');
const { getSetting, listSettings, watchSettings } = require('../calendar');

function registerSettingsTools(server, checkAuth) {
    server.tool(
        'get_setting',
        {
            setting: z.string().describe('The id of the user setting.'),
        },
        async ({ setting }) => {
            const authError = await checkAuth();
            if (authError) return authError;

            try {
                const result = await getSetting({ setting });
                return {
                    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
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
        'list_settings',
        {
            maxResults: z.number().optional(),
            pageToken: z.string().optional(),
            syncToken: z.string().optional(),
        },
        async ({ maxResults, pageToken, syncToken }) => {
            const authError = await checkAuth();
            if (authError) return authError;

            try {
                const result = await listSettings({ maxResults, pageToken, syncToken });
                return {
                    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
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
        'watch_settings',
        {
            resource: z.object({
                id: z.string(),
                type: z.literal('web_hook'),
                address: z.string(),
                token: z.string().optional(),
                expiration: z.string().optional(),
            }),
        },
        async ({ resource }) => {
            const authError = await checkAuth();
            if (authError) return authError;

            try {
                const result = await watchSettings({ resource });
                return {
                    content: [{ type: 'text', text: `Watch Settings Started: ${JSON.stringify(result, null, 2)}` }],
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

module.exports = { registerSettingsTools };
