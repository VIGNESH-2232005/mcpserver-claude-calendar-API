const { getAuthUrl, REDIRECT_URI } = require('./src/auth');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

async function check() {
    const logFile = path.join(__dirname, 'debug_output.txt');
    const logs = [];
    const log = (...args) => {
        console.log(...args);
        logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '));
    };

    try {
        log('--- Starting Auth Check ---');
        const url = await getAuthUrl();
        log('Generated Auth URL:', url);

        const params = new URLSearchParams(url.split('?')[1]);

        log('\n--- Current Configuration ---');
        log('Redirect_URI_Sent_To_Google:', params.get('redirect_uri'));
        log('Client_ID_Sent_To_Google:   ', params.get('client_id'));

        log('\n--- Credentials File Check ---');
        if (fs.existsSync(CREDENTIALS_PATH)) {
            log('credentials.json exists at:', CREDENTIALS_PATH);
            const content = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
            try {
                const json = JSON.parse(content);
                const key = json.installed || json.web;
                log('Client_ID_In_File:        ', key.client_id);
            } catch (err) {
                log('Error parsing credentials.json:', err.message);
            }
        } else {
            log('credentials.json NOT FOUND at:', CREDENTIALS_PATH);
        }

    } catch (e) {
        log('An error occurred:', e);
    } finally {
        fs.writeFileSync(logFile, logs.join('\n'), 'utf8');
        console.log('Logs written to:', logFile);
    }
}

check();
