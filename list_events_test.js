const { listEvents } = require('./src/calendar');
const { loadToken } = require('./src/auth');

async function main() {
    console.log('Checking auth...');
    const tokens = await loadToken();
    if (!tokens) {
        console.error('No token found. Please authenticate first.');
        return;
    }
    console.log('Listing next 10 events...');
    try {
        const events = await listEvents({ maxResults: 10 });
        if (events.length === 0) {
            console.log('No upcoming events found.');
        } else {
            console.log(`Found ${events.length} events:`);
            events.forEach((event, i) => {
                const start = event.start.dateTime || event.start.date;
                console.log(`${i + 1}. ${start} - ${event.summary}`);
            });
        }
    } catch (error) {
        console.error('Error listing events:', error);
    }
}

main();
