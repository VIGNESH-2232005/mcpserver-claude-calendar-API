const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
const crypto = require('crypto');

const SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
];
const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';
const TOKEN_PATH = path.join(__dirname, '../token.json');
const ENCRYPTION_KEY_PATH = path.join(__dirname, '../encryption.key');

let globalAuthSuccessCallback = null;

// --- Encryption Helpers ---

function getEncryptionKey() {
    if (fs.existsSync(ENCRYPTION_KEY_PATH)) {
        return Buffer.from(fs.readFileSync(ENCRYPTION_KEY_PATH, 'utf-8'), 'hex');
    }
    const key = crypto.randomBytes(32); // 256 bits
    fs.writeFileSync(ENCRYPTION_KEY_PATH, key.toString('hex'));
    return key;
}

function encrypt(text) {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    const key = getEncryptionKey();
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

async function saveToken(tokens) {
    const json = JSON.stringify(tokens);
    const encrypted = encrypt(json);
    await fs.promises.writeFile(TOKEN_PATH, encrypted);
}

async function loadToken() {
    if (!fs.existsSync(TOKEN_PATH)) {
        return null;
    }
    try {
        const encrypted = await fs.promises.readFile(TOKEN_PATH, 'utf-8');
        // Handle case where file might be unencrypted legacy JSON
        if (encrypted.trim().startsWith('{')) {
            return JSON.parse(encrypted);
        }
        const json = decrypt(encrypted);
        return JSON.parse(json);
    } catch (e) {
        console.error('Error loading token:', e.message);
        return null;
    }
}

// --- OAuth Logic ---

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

                    // Save tokens encrypted
                    await saveToken(tokens);

                    // Get User Info
                    const oauth2 = google.oauth2({ version: 'v2', auth: client });
                    const userInfo = await oauth2.userinfo.get();

                    // Notify the application
                    if (globalAuthSuccessCallback) {
                        globalAuthSuccessCallback(userInfo.data, client);
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

module.exports = {
    startCallbackServer,
    getAuthUrl,
    getOAuthClient,
    loadToken,
    SCOPES,
    CREDENTIALS_PATH,
    TOKEN_PATH
};
