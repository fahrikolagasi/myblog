const fs = require('fs');
const http = require('http');
const https = require('https');
const url = require('url');
const crypto = require('crypto');
const querystring = require('querystring');
const { exec } = require('child_process');

// --- CONFIGURATION ---
// User will be prompted to enter these if not found in .env
let CLIENT_ID = process.env.VITE_SPOTIFY_CLIENT_ID || '';
let CLIENT_SECRET = process.env.VITE_SPOTIFY_CLIENT_SECRET || '';
const REDIRECT_URI = 'http://localhost:8888/callback';
const SCOPES = 'user-read-currently-playing user-read-recently-played';

// --- MAIN ---
async function main() {
    console.log("--- SPOTIFY REFRESH TOKEN GENERATOR ---");

    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.log("\nPlease enter your Spotify credentials.");
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        if (!CLIENT_ID) {
            CLIENT_ID = await new Promise(resolve => readline.question('Client ID: ', resolve));
        }
        if (!CLIENT_SECRET) {
            CLIENT_SECRET = await new Promise(resolve => readline.question('Client Secret: ', resolve));
        }
        readline.close();
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.error("Error: Client ID and Secret are required.");
        process.exit(1);
    }

    console.log(`\n1. Ensure your Redirect URI in Spotify Dashboard is set to: ${REDIRECT_URI}`);
    console.log("2. Opening browser to authorize...");

    // Start local server to catch the callback
    const server = http.createServer(async (req, res) => {
        const parsedUrl = url.parse(req.url, true);

        if (parsedUrl.pathname === '/callback') {
            const code = parsedUrl.query.code;
            if (code) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end('<h1>Success! You can close this window. Check your terminal.</h1>');
                server.close();

                // Exchange code for tokens
                try {
                    const tokens = await getTokens(code);
                    console.log("\n--- SUCCESS! ---");
                    console.log("Add these to your .env file:\n");
                    console.log(`VITE_SPOTIFY_CLIENT_ID=${CLIENT_ID}`);
                    console.log(`VITE_SPOTIFY_CLIENT_SECRET=${CLIENT_SECRET}`);
                    console.log(`VITE_SPOTIFY_REFRESH_TOKEN=${tokens.refresh_token}`);
                    console.log("\nNote: The Access Token expires quickly. The Refresh Token is what we need.");
                } catch (err) {
                    console.error("Error getting tokens:", err);
                }
            } else {
                res.end('No code found.');
            }
        }
    }).listen(8888);

    const authUrl = 'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: SCOPES,
            redirect_uri: REDIRECT_URI,
        });

    // Try to open browser
    const start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
    exec(`${start} "${authUrl}"`);
    console.log(`If browser doesn't open, visit: ${authUrl}`);
}

function getTokens(code) {
    return new Promise((resolve, reject) => {
        const postData = querystring.stringify({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
        });

        const req = https.request('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')),
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': postData.length
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.error) reject(json);
                    else resolve(json);
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

main();
