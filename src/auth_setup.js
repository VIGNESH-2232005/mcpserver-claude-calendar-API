const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { SCOPES, CREDENTIALS_PATH, TOKEN_PATH } = require('./auth');

async function saveCredentials(client) {
    const content = await fs.promises.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.promises.writeFile(TOKEN_PATH, payload);
}

const http = require('http');
const url = require('url');
const opener = require('child_process');

async function main() {
    let content;
    try {
        content = await fs.promises.readFile(CREDENTIALS_PATH);
    } catch (e) {
        console.error("Error loading credentials.json.");
        process.exit(1);
    }

    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;

    // Use localhost:3000/oauth2callback
    const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

    const client = new google.auth.OAuth2(
        key.client_id,
        key.client_secret,
        REDIRECT_URI
    );

    const authUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
    });

    console.log('Starting local server on port 3000...');

    const server = http.createServer(async (req, res) => {
        try {
            if (req.url.startsWith('/oauth2callback')) {
                const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
                const code = qs.get('code');

                if (code) {
                    res.end('Authentication successful! You can close this tab.');
                    server.close();

                    console.log('Code received. Fetching tokens...');
                    const { tokens } = await client.getToken(code);
                    client.setCredentials(tokens);
                    await saveCredentials(client);
                    console.log('Key stored to', TOKEN_PATH);
                    process.exit(0);
                }
            }
        } catch (e) {
            console.error(e);
        }
    });

    server.listen(3000, () => {
        console.log('Opening browser...');
        const start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
        opener.exec(`${start} "${authUrl}"`);
        console.log(`If browser doesn't open, visit: ${authUrl}`);
    });
}

main();
