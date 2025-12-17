const { google } = require('googleapis');
const { getOAuthClient, loadToken } = require('./auth');

async function getCalendar() {
    // Always load the latest token to ensure we are authenticated
    const tokens = await loadToken();
    if (!tokens) {
        throw new Error('Authentication required');
    }

    const client = await getOAuthClient();
    client.setCredentials(tokens);
    return google.calendar({ version: 'v3', auth: client });
}

async function listEvents({ timeMin, timeMax, maxResults = 10 }) {
    const calendar = await getCalendar();
    const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin || (new Date()).toISOString(),
        timeMax: timeMax,
        maxResults: maxResults,
        singleEvents: true,
        orderBy: 'startTime',
    });
    return res.data.items;
}

async function createEvent({ summary, description, start, end, attendees = [], location }) {
    const calendar = await getCalendar();

    // Ensure dates are stringified if they are passed as Date objects
    const event = {
        summary,
        location,
        description,
        start: {
            dateTime: new Date(start).toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
            dateTime: new Date(end).toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        attendees: attendees.map(email => ({ email })),
    };

    const res = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
    });
    return res.data;
}

module.exports = {
    listEvents,
    createEvent
};
