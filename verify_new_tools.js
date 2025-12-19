const { listCalendarList, queryFreeBusy, getColors } = require('./src/calendar');
const { loadToken } = require('./src/auth');

async function verify() {
    console.log('--- Verifying New Calendar Tools ---');

    // Auth check
    const tokens = await loadToken();
    if (!tokens) {
        console.error('Authentication required. Run auth flow first.');
        return;
    }

    try {
        // 1. List Calendars
        console.log('\n[1/3] Testing listCalendarList...');
        const calendars = await listCalendarList();
        console.log(`Success! Found ${calendars.length} calendars.`);
        const primary = calendars.find(c => c.primary) || calendars[0];

        // 2. Get Colors
        console.log('\n[2/3] Testing getColors...');
        const colors = await getColors();
        console.log('Success! Retrieved color definitions.');

        // 3. Get Free/Busy
        console.log('\n[3/3] Testing queryFreeBusy...');
        const now = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const freeBusy = await queryFreeBusy({
            resource: {
                timeMin: now.toISOString(),
                timeMax: tomorrow.toISOString(),
                timeZone: 'UTC',
                items: [{ id: primary.id }]
            }
        });
        console.log('Success! Retrieved free/busy info.');
        console.log('Calendar ID checked:', primary.id);

    } catch (e) {
        console.error('Verification failed:', e.message);
        if (e.response && e.response.data) {
            console.error('API Error:', JSON.stringify(e.response.data, null, 2));
        }
    }
}

verify();
