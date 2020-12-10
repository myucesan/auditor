const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Sheets API.
    module.exports.authorize(JSON.parse(content), module.exports.getShipsWithPrice);
});

// /**
//  * Create an OAuth2 client with the given credentials, and then execute the
//  * given callback function.
//  * @param {Object} credentials The authorization client credentials.
//  * @param {function} callback The callback to call with the authorized client.
//  */
// function authorize(credentials, callback) {
//     const {client_secret, client_id, redirect_uris} = credentials.installed;
//     const oAuth2Client = new google.auth.OAuth2(
//         client_id, client_secret, redirect_uris[0]);
//
//     // Check if we have previously stored a token.
//     fs.readFile(TOKEN_PATH, (err, token) => {
//         if (err) return getNewToken(oAuth2Client, callback);
//         oAuth2Client.setCredentials(JSON.parse(token));
//         callback(oAuth2Client);
//     });
// }

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}


function getShipNamesWithPrices(auth) {
    let ranges = [
        'EVO1 Ship List!B12:F27', // frigates
        'EVO1 Ship List!B30:F30' // destroyers
        ];

    const sheets = google.sheets({version: 'v4', auth});
        sheets.spreadsheets.values.get({
        spreadsheetId: '1VNUfGdSPF6dqvcFwFMP8iS_oajD5728JzufZ33UpA88',
        range: ranges[0]
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const rows = res.data.values;
        if (rows.length) {
            console.log('Name, Major:');
            let shipNames = new Set();
            let marketPrice = new Set();
            let bpPlusHullCorp = new Set();
            let corpHullOnly = new Set();
            let bpOnly = new Set();
            rows.map((row) => {
                if (row[0] != null) {
                    shipNames.add(row[0]);
                }
                marketPrice.add(row[1]);
                bpPlusHullCorp.add(row[2]);
                corpHullOnly.add(row[3])
                bpPlusHullCorp.add(row[4]);
            });
            shipNames.forEach(e => console.log(e))

        } else {
            console.log('No data found.');
        }
    });
}
module.exports = {
    getShipsWithPrice: function(auth=auth, shippings = "Vigilant") {
        const sheets = google.sheets({version: 'v4', auth});
        let spreadsheetId = '1VNUfGdSPF6dqvcFwFMP8iS_oajD5728JzufZ33UpA88';
        let ranges = [
            'EVO1 Ship List!B12:F27', // frigates
            'EVO1 Ship List!B30:F30', // destroyers
            'EVO1 Ship List!B37:F61', // cruisers
            'EVO1 Ship List!B70:F77', // battle cruisers
            'EVO1 Ship List!B83:F87', // battle ships
            'EVO1 Ship List!B92:F102', // industrials

        ];
            return sheets.spreadsheets.values.batchGet({spreadsheetId, ranges,});


    }, getCorpPlayerAccount(auth) {
        const sheets = google.sheets({version: 'v4', auth});
        let spreadsheetId = '1CIAmCZTy6TYM2ZHyYeubA00-DWStKXNhay5Sm0xdpvA';
        let ranges = [
            'EVO Player Credits!B5:E27'
        ];
        return sheets.spreadsheets.values.batchGet({spreadsheetId, ranges,});
    }, getStock(auth) {
        const sheets = google.sheets({version: 'v4', auth});
        let spreadsheetId = '1CIAmCZTy6TYM2ZHyYeubA00-DWStKXNhay5Sm0xdpvA';
        let ranges = [
            'Mineral Status!B9:D16'
        ];
        return sheets.spreadsheets.values.batchGet({spreadsheetId, ranges,});
    },

    authorize(credentials, callback) {
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) return getNewToken(oAuth2Client, callback);
            oAuth2Client.setCredentials(JSON.parse(token));
            callback(oAuth2Client);
            // return oAuth2Client;


        });
    },
    readCredentials(callback) {
        fs.readFile('credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Sheets API.
            // callback(this.authorize(JSON.parse(content)));
            this.authorize(JSON.parse(content), () => {
                callback("heyaheyahyea");
            })

        });
    },
    getAuth(auth) {
        console.log("Brother");
        console.log(auth);
        const auths = auth;
        return auths;
    }
}

// this.authorize(JSON.parse(content), () => {
//     callback()
// })


//    async readCredentials(shipName) {
//         // using fs.promises
//         return fs.readFile('credentials.json')
//           .then(content => {
//               // I would avoid using module.exports that's real confusing
//               this.auth = module.exports.authorize(JSON.parse(content));
//           })
//           .catch(err => console.log('Error loading client secret file:', err))
//     }