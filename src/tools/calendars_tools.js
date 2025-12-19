const { z } = require('zod');
const {
    clearCalendar,
    deleteCalendar,
    getCalendarMetadata,
    insertCalendar,
    updateCalendar,
    patchCalendar
} = require('../calendar');

function registerCalendarsTools(server, checkAuth) {
    server.tool(
        'clear_calendar',
        {
            calendarId: z.string().optional().default('primary').describe('ID of the calendar to clear (usually primary)'),
        },
        async ({ calendarId }) => {
            const authError = await checkAuth();
            if (authError) return authError;

            try {
                await clearCalendar({ calendarId });
                return {
                    content: [{ type: 'text', text: `Calendar Cleared Successfully` }],
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
        'delete_calendar',
        {
            calendarId: z.string().describe('ID of the secondary calendar to delete'),
        },
        async ({ calendarId }) => {
            const authError = await checkAuth();
            if (authError) return authError;

            try {
                await deleteCalendar({ calendarId });
                return {
                    content: [{ type: 'text', text: `Calendar Deleted Successfully` }],
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
        'get_calendar',
        {
            calendarId: z.string().optional().default('primary'),
        },
        async ({ calendarId }) => {
            const authError = await checkAuth();
            if (authError) return authError;

            try {
                const metadata = await getCalendarMetadata({ calendarId });
                return {
                    content: [{ type: 'text', text: JSON.stringify(metadata, null, 2) }],
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
        'insert_calendar',
        {
            summary: z.string().describe('Title of the calendar'),
            description: z.string().optional(),
            location: z.string().optional(),
            timeZone: z.string().optional(),
        },
        async (args) => {
            const authError = await checkAuth();
            if (authError) return authError;

            try {
                const resource = {
                    summary: args.summary,
                };
                if (args.description) resource.description = args.description;
                if (args.location) resource.location = args.location;
                if (args.timeZone) resource.timeZone = args.timeZone;

                const calendar = await insertCalendar({ resource });
                return {
                    content: [{ type: 'text', text: `Calendar Created: ${JSON.stringify(calendar, null, 2)}` }],
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
        'update_calendar',
        {
            calendarId: z.string().optional().default('primary'),
            summary: z.string().optional(),
            description: z.string().optional(),
            location: z.string().optional(),
            timeZone: z.string().optional(),
        },
        async (args) => {
            const authError = await checkAuth();
            if (authError) return authError;

            try {
                const resource = {};
                if (args.summary) resource.summary = args.summary;
                if (args.description) resource.description = args.description;
                if (args.location) resource.location = args.location;
                if (args.timeZone) resource.timeZone = args.timeZone;

                const calendar = await updateCalendar({ calendarId: args.calendarId, resource });
                return {
                    content: [{ type: 'text', text: `Calendar Updated: ${JSON.stringify(calendar, null, 2)}` }],
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
        'patch_calendar',
        {
            calendarId: z.string().optional().default('primary'),
            summary: z.string().optional(),
            description: z.string().optional(),
            location: z.string().optional(),
            timeZone: z.string().optional(),
        },
        async (args) => {
            const authError = await checkAuth();
            if (authError) return authError;

            try {
                const resource = {};
                if (args.summary) resource.summary = args.summary;
                if (args.description) resource.description = args.description;
                if (args.location) resource.location = args.location;
                if (args.timeZone) resource.timeZone = args.timeZone;

                const calendar = await patchCalendar({ calendarId: args.calendarId, resource });
                return {
                    content: [{ type: 'text', text: `Calendar Patched: ${JSON.stringify(calendar, null, 2)}` }],
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

module.exports = { registerCalendarsTools };
