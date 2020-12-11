const ss = require("../spreadsheet");
const credentials = require('../credentials.json');
const token = require('../token.json');
const {google} = require('googleapis');

module.exports = {

    name: 'stock',
    description: 'Shows stock',
    aliases: [],
    execute(message, args) {
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        let creds = {
            access_token: token.access_token,
            refresh_token: token.refresh_token,
            scope: token.scope,
            token_type: token.token_type,
            expiry_date: token.expiry_date
        };

        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);
        oAuth2Client.setCredentials(creds);
        ss.getStock(oAuth2Client).then(result => {
            console.log(`${result.data.valueRanges.length} ranges retrieved.`);
            const rows = result.data.valueRanges;
            if (rows.length) {
                rows.map((row => {
                    // console.log("----------------");
                    row.values.forEach(player => {
                        message.channel.send(`**Mineral: ${player[0]}** | Total Stock: ${player[1]} | Required Amount: ${player[2]}\n`);
                    });
                }))
            }

        }).catch(error => {
            console.log(error);
        });
    },
};