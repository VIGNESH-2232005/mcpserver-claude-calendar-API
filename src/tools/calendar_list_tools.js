const { z } = require('zod');
const {
    listCalendarList,
    getCalendarList,
    insertCalendarList,
    deleteCalendarList,
    updateCalendarList,
    patchCalendarList,
    watchCalendarList
} = require('../calendar');

function registerCalendarListTools(server, checkAuth) {
    server.tool(
        'list_calendar_list',
        {},
        async () => {
            const authError = await checkAuth();
            if (authError) return authError;

            try {
                const list = await listCalendarList();
                return {
                    content: [{ type: 'text', text: JSON.stringify(list, null, 2) }],
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
        'get_calendar_list',
        {
            calendarId: z.string(),
        },
        async ({ calendarId }) => {
            const authError = await checkAuth();
            if (authError) return authError;

            try {
                const calendar = await getCalendarList({ calendarId });
                return {
                    content: [{ type: 'text', text: JSON.stringify(calendar, null, 2) }],
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
        'insert_calendar_list',
        {
            id: z.string().describe('The main calendar ID to add'),
            summaryOverride: z.string().optional(),
            colorId: z.string().optional(),
            hidden: z.boolean().optional(),
            selected: z.boolean().optional(),
            backgroundColor: z.string().optional(),
            foregroundColor: z.string().optional(),
        },
        async (args) => {
            const authError = await checkAuth();
            if (authError) return authError;

            try {
                // Construct the resource object from arguments
                const resource = {
                    id: args.id,
                };
                if (args.summaryOverride) resource.summaryOverride = args.summaryOverride;
                if (args.colorId) resource.colorId = args.colorId;
                if (args.hidden !== undefined) resource.hidden = args.hidden;
                if (args.selected !== undefined) resource.selected = args.selected;
                if (args.backgroundColor) resource.backgroundColor = args.backgroundColor;
                if (args.foregroundColor) resource.foregroundColor = args.foregroundColor;

                const calendar = await insertCalendarList({ resource });
                return {
                    content: [{ type: 'text', text: `Calendar Added to List: ${JSON.stringify(calendar, null, 2)}` }],
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
        'delete_calendar_list',
        {
            calendarId: z.string(),
        },
        async ({ calendarId }) => {
            const authError = await checkAuth();
            if (authError) return authError;

            try {
                await deleteCalendarList({ calendarId });
                return {
                    content: [{ type: 'text', text: `Calendar Removed from List` }],
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
        'update_calendar_list',
        {
            calendarId: z.string(),
            summaryOverride: z.string().optional(),
            colorId: z.string().optional(),
            hidden: z.boolean().optional(),
            selected: z.boolean().optional(),
            backgroundColor: z.string().optional(),
            foregroundColor: z.string().optional(),
        },
        async (args) => {
            const authError = await checkAuth();
            if (authError) return authError;

            try {
                const resource = {};
                // id is required in the resource for update technically, though client handles it. 
                // Google API typically needs the full resource for update, but here we construct partial.
                // However, 'update' replaces the resource. We should prob be careful or suggest patch.
                // But following the prompt's `update` definition.
                resource.id = args.calendarId;
                if (args.summaryOverride) resource.summaryOverride = args.summaryOverride;
                if (args.colorId) resource.colorId = args.colorId;
                if (args.hidden !== undefined) resource.hidden = args.hidden;
                if (args.selected !== undefined) resource.selected = args.selected;
                if (args.backgroundColor) resource.backgroundColor = args.backgroundColor;
                if (args.foregroundColor) resource.foregroundColor = args.foregroundColor;

                const calendar = await updateCalendarList({ calendarId: args.calendarId, resource });
                return {
                    content: [{ type: 'text', text: `Calendar List Updated: ${JSON.stringify(calendar, null, 2)}` }],
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
        'patch_calendar_list',
        {
            calendarId: z.string(),
            summaryOverride: z.string().optional(),
            colorId: z.string().optional(),
            hidden: z.boolean().optional(),
            selected: z.boolean().optional(),
            backgroundColor: z.string().optional(),
            foregroundColor: z.string().optional(),
        },
        async (args) => {
            const authError = await checkAuth();
            if (authError) return authError;

            try {
                const resource = {};
                if (args.summaryOverride) resource.summaryOverride = args.summaryOverride;
                if (args.colorId) resource.colorId = args.colorId;
                if (args.hidden !== undefined) resource.hidden = args.hidden;
                if (args.selected !== undefined) resource.selected = args.selected;
                if (args.backgroundColor) resource.backgroundColor = args.backgroundColor;
                if (args.foregroundColor) resource.foregroundColor = args.foregroundColor;

                const calendar = await patchCalendarList({ calendarId: args.calendarId, resource });
                return {
                    content: [{ type: 'text', text: `Calendar List Patched: ${JSON.stringify(calendar, null, 2)}` }],
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
        'watch_calendar_list',
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
                const result = await watchCalendarList({ resource });
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

module.exports = { registerCalendarListTools };
