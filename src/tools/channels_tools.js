const { z } = require('zod');
const { stopChannel } = require('../calendar');

function registerChannelsTools(server, checkAuth) {
    server.tool(
        'stop_channel',
        {
            resource: z.object({
                id: z.string(),
                resourceId: z.string(),
            }),
        },
        async ({ resource }) => {
            const authError = await checkAuth();
            if (authError) return authError;

            try {
                await stopChannel({ resource });
                return {
                    content: [{ type: 'text', text: `Channel Stopped Successfully` }],
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

module.exports = { registerChannelsTools };
