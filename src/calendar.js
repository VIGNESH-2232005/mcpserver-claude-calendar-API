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
    createEvent,
    // ACL Methods
    listAcl,
    getAcl,
    insertAcl,
    deleteAcl,
    updateAcl,
    patchAcl,
    watchAcl,
    // CalendarList Methods
    listCalendarList,
    getCalendarList,
    insertCalendarList,
    deleteCalendarList,
    updateCalendarList,
    patchCalendarList,
    watchCalendarList,
    // Calendars Resource Methods
    clearCalendar,
    deleteCalendar,
    getCalendarMetadata,
    insertCalendar,
    updateCalendar,
    patchCalendar,
    // Channels & Colors Resource Methods
    stopChannel,
    getColors,
    // Events Resource Methods
    deleteEvent,
    getEvent,
    importEvent,
    insertEvent,
    instancesEvent,
    moveEvent,
    patchEvent,
    quickAddEvent,
    updateEvent,
    watchEvents,
    // Freebusy Resource Methods
    queryFreeBusy,
    // Settings Resource Methods
    getSetting,
    listSettings,
    watchSettings
};

// --- ACL Functions ---

async function listAcl({ calendarId }) {
    const calendar = await getCalendar();
    const res = await calendar.acl.list({
        calendarId: calendarId || 'primary',
    });
    return res.data;
}

async function getAcl({ calendarId, ruleId }) {
    const calendar = await getCalendar();
    const res = await calendar.acl.get({
        calendarId: calendarId || 'primary',
        ruleId,
    });
    return res.data;
}

async function insertAcl({ calendarId, role, scope }) {
    const calendar = await getCalendar();
    const res = await calendar.acl.insert({
        calendarId: calendarId || 'primary',
        resource: {
            role,
            scope,
        },
    });
    return res.data;
}

async function deleteAcl({ calendarId, ruleId }) {
    const calendar = await getCalendar();
    await calendar.acl.delete({
        calendarId: calendarId || 'primary',
        ruleId,
    });
    return { success: true };
}

async function updateAcl({ calendarId, ruleId, role, scope }) {
    const calendar = await getCalendar();
    const res = await calendar.acl.update({
        calendarId: calendarId || 'primary',
        ruleId,
        resource: {
            role,
            scope,
        },
    });
    return res.data;
}

async function patchAcl({ calendarId, ruleId, role, scope }) {
    const calendar = await getCalendar();
    const resource = {};
    if (role) resource.role = role;
    if (scope) resource.scope = scope;

    const res = await calendar.acl.patch({
        calendarId: calendarId || 'primary',
        ruleId,
        resource,
    });
    return res.data;
}

async function watchAcl({ calendarId, resource }) {
    const calendar = await getCalendar();
    const res = await calendar.acl.watch({
        calendarId: calendarId || 'primary',
        resource,
    });
    return res.data;
}

// --- CalendarList Functions ---

async function listCalendarList() {
    const calendar = await getCalendar();
    const res = await calendar.calendarList.list();
    return res.data.items;
}

async function getCalendarList({ calendarId }) {
    const calendar = await getCalendar();
    const res = await calendar.calendarList.get({
        calendarId,
    });
    return res.data;
}

async function insertCalendarList({ resource }) {
    const calendar = await getCalendar();
    const res = await calendar.calendarList.insert({
        resource,
    });
    return res.data;
}

async function deleteCalendarList({ calendarId }) {
    const calendar = await getCalendar();
    await calendar.calendarList.delete({
        calendarId,
    });
    return { success: true };
}

async function updateCalendarList({ calendarId, resource }) {
    const calendar = await getCalendar();
    const res = await calendar.calendarList.update({
        calendarId,
        resource,
    });
    return res.data;
}

async function patchCalendarList({ calendarId, resource }) {
    const calendar = await getCalendar();
    const res = await calendar.calendarList.patch({
        calendarId,
        resource,
    });
    return res.data;
}

async function watchCalendarList({ resource }) {
    const calendar = await getCalendar();
    const res = await calendar.calendarList.watch({
        resource,
    });
    return res.data;
}

// --- Calendars Resource Functions ---

async function clearCalendar({ calendarId }) {
    const calendar = await getCalendar();
    // 'primary' is the only valid value for clear, but user might pass it explicitly
    // standard api says /calendars/primary/clear
    await calendar.calendars.clear({
        calendarId: calendarId || 'primary',
    });
    return { success: true };
}

async function deleteCalendar({ calendarId }) {
    const calendar = await getCalendar();
    await calendar.calendars.delete({
        calendarId,
    });
    return { success: true };
}

async function getCalendarMetadata({ calendarId }) {
    const calendar = await getCalendar();
    const res = await calendar.calendars.get({
        calendarId: calendarId || 'primary',
    });
    return res.data;
}

async function insertCalendar({ resource }) {
    const calendar = await getCalendar();
    const res = await calendar.calendars.insert({
        requestBody: resource, // googleapis uses requestBody for post body usually, or resource. lets check usage above.
        // Above used 'resource' for insert. Let's consistency check.
        // googleapis v3 insert: params: { resource: {} }
        resource,
    });
    return res.data;
}

async function updateCalendar({ calendarId, resource }) {
    const calendar = await getCalendar();
    const res = await calendar.calendars.update({
        calendarId: calendarId || 'primary',
        resource,
    });
    return res.data;
}

async function patchCalendar({ calendarId, resource }) {
    const calendar = await getCalendar();
    const res = await calendar.calendars.patch({
        calendarId: calendarId || 'primary',
        resource,
    });
    return res.data;
}

// --- Channels Resource Functions ---

async function stopChannel({ resource }) {
    const calendar = await getCalendar();
    await calendar.channels.stop({
        resource,
    });
    return { success: true };
}

// --- Colors Resource Functions ---

async function getColors() {
    const calendar = await getCalendar();
    const res = await calendar.colors.get();
    return res.data;
}

// --- Events Resource Functions ---

async function deleteEvent({ calendarId, eventId }) {
    const calendar = await getCalendar();
    await calendar.events.delete({
        calendarId: calendarId || 'primary',
        eventId,
    });
    return { success: true };
}

async function getEvent({ calendarId, eventId }) {
    const calendar = await getCalendar();
    const res = await calendar.events.get({
        calendarId: calendarId || 'primary',
        eventId,
    });
    return res.data;
}

async function importEvent({ calendarId, resource }) {
    const calendar = await getCalendar();
    const res = await calendar.events.import({
        calendarId: calendarId || 'primary',
        resource,
    });
    return res.data;
}

async function insertEvent({ calendarId, resource }) {
    const calendar = await getCalendar();
    const res = await calendar.events.insert({
        calendarId: calendarId || 'primary',
        resource,
    });
    return res.data;
}

async function instancesEvent({ calendarId, eventId }) {
    const calendar = await getCalendar();
    const res = await calendar.events.instances({
        calendarId: calendarId || 'primary',
        eventId,
    });
    return res.data;
}

async function moveEvent({ calendarId, eventId, destination }) {
    const calendar = await getCalendar();
    const res = await calendar.events.move({
        calendarId: calendarId || 'primary',
        eventId,
        destination,
    });
    return res.data;
}

async function patchEvent({ calendarId, eventId, resource }) {
    const calendar = await getCalendar();
    const res = await calendar.events.patch({
        calendarId: calendarId || 'primary',
        eventId,
        resource,
    });
    return res.data;
}

async function quickAddEvent({ calendarId, text }) {
    const calendar = await getCalendar();
    const res = await calendar.events.quickAdd({
        calendarId: calendarId || 'primary',
        text,
    });
    return res.data;
}

async function updateEvent({ calendarId, eventId, resource }) {
    const calendar = await getCalendar();
    const res = await calendar.events.update({
        calendarId: calendarId || 'primary',
        eventId,
        resource,
    });
    return res.data;
}

async function watchEvents({ calendarId, resource }) {
    const calendar = await getCalendar();
    const res = await calendar.events.watch({
        calendarId: calendarId || 'primary',
        resource,
    });
    return res.data;
}

// --- Freebusy Resource Functions ---

async function queryFreeBusy({ resource }) {
    const calendar = await getCalendar();
    const res = await calendar.freebusy.query({
        requestBody: resource,
    });
    return res.data;
}

// --- Settings Resource Functions ---

async function getSetting({ setting }) {
    const calendar = await getCalendar();
    const res = await calendar.settings.get({
        setting,
    });
    return res.data;
}

async function listSettings({ maxResults, pageToken, syncToken }) {
    const calendar = await getCalendar();
    const res = await calendar.settings.list({
        maxResults,
        pageToken,
        syncToken,
    });
    return res.data;
}

async function watchSettings({ resource }) {
    const calendar = await getCalendar();
    const res = await calendar.settings.watch({
        resource,
    });
    return res.data;
}
