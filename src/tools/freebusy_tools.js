const { z } = require('zod');
const { queryFreeBusy } = require('../calendar');

function registerFreebusyTools(server, checkAuth) {
    server.tool(
        'query_freebusy',
        {
            timeMin: z.string().describe('ISO date string (e.g., 2025-12-25T10:00:00)'),
            timeMax: z.string().describe('ISO date string'),
            timeZone: z.string().optional().default('UTC'),
            items: z.array(z.object({ id: z.string() })).describe('List of calendars to query'),
        },
        async ({ timeMin, timeMax, timeZone, items }) => {
            const authError = await checkAuth();
            if (authError) return authError;

            try {
                const resource = {
                    timeMin,
                    timeMax,
                    timeZone,
                    items,
                };
                const result = await queryFreeBusy({ resource });
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
}

module.exports = { registerFreebusyTools };
