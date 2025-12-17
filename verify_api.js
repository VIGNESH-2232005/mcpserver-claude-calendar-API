const { listEvents } = require('./src/calendar');
const { loadToken } = require('./src/auth');

async function verify() {
    console.log('--- Verifying Calendar API Access ---');

    // 1. Check if we have tokens (Auth check)
    const tokens = await loadToken();
    if (!tokens) {
        console.error('Error: No authentication tokens found. Please run the auth flow first.');
        return;
    }
    console.log('Authentication tokens found.');

    // 2. Try to list events (API check)
    try {
        console.log('Attempting to list events...');
        const events = await listEvents({ maxResults: 1 });
        console.log('Success! Calendar API is enabled and working.');
        console.log(`Found ${events.length} events.`);
    } catch (e) {
        // console.error('Full Error:', e);
        if (e.message.includes('Calendar API has not been enabled') ||
            (e.response && e.response.data && e.response.data.error && e.response.data.error.message.includes('Calendar API has not been enabled'))) {
            console.error('\n!!! ERROR: Google Calendar API is NOT enabled. !!!');
            console.error('Please visit this URL to enable it:');
            console.error('https://console.developers.google.com/apis/api/calendar-json.googleapis.com/overview');
        } else {
            console.error('An unexpected error occurred:', e.message);
        }
    }
}

verify();
