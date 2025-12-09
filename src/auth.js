const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');

const SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
];
const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

let globalAuthSuccessCallback = null;

// Initialize Client Helper
async function getOAuthClient() {
    const content = await fs.promises.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    return new google.auth.OAuth2(key.client_id, key.client_secret, REDIRECT_URI);
}

// Generate the URL for the user to visit
async function getAuthUrl() {
    const client = await getOAuthClient();
    return client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent', // Force consent to get refresh token
    });
}

// Start a persistent server listening for the callback
async function startCallbackServer(onSuccess) {
    globalAuthSuccessCallback = onSuccess;

    const server = http.createServer(async (req, res) => {
        try {
            if (req.url.startsWith('/oauth2callback')) {
                const qs = new url.URL(req.url, REDIRECT_URI).searchParams;
                const code = qs.get('code');

                if (code) {
                    res.end('Authentication successful! You can close this tab and return to Claude.');

                    // Process tokens
                    const client = await getOAuthClient();
                    const { tokens } = await client.getToken(code);
                    client.setCredentials(tokens);

                    // Get User Info
                    const oauth2 = google.oauth2({ version: 'v2', auth: client });
                    const userInfo = await oauth2.userinfo.get();

                    // Notify the application
                    if (globalAuthSuccessCallback) {
                        globalAuthSuccessCallback(userInfo.data);
                    }
                }
            }
        } catch (e) {
            console.error(e);
            res.end('Error during auth exchange.');
        }
    });

    server.on('error', (e) => {
        // Critical: Prevent crash if port is in use
        console.error('Auth Server Error (ignored):', e.message);
    });

    server.listen(3000, () => {
        // console.error('Auth Server listening on 3000');
    });
}

module.exports = { startCallbackServer, getAuthUrl };
