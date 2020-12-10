const ss = require("../spreadsheet");
const credentials = require('../credentials.json');
const token = require('../token.json');
const {google} = require('googleapis');

module.exports = {

    name: 'stock',
    description: 'Shows stock',
    execute(message, args) {
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        let creds = {access_token:token.access_token, refresh_token:token.refresh_token, scope:token.scope, token_type:token.token_type, expiry_date:token.expiry_date};

        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);
        oAuth2Client.setCredentials(creds);

        if (args.length != 1) {
            message.channel.send(`Incorrect usage: format:\n!price-check [ship] \nEx:!price-check Vigilant`);
        } else {
            ss.getShipsWithPrice(oAuth2Client, args[0]).then(result => {
                console.log(`${result.data.valueRanges.length} ranges retrieved.`);
                const rows = result.data.valueRanges;
                if (rows.length) {
                    rows.map((row => {
                        // console.log("----------------");
                        row.values.forEach(ship => {
                            if (ship.length !== 0) {
                                let shipName = ship[0].replace(/[*^]+/, '');
                                if (shipName === (args[0].charAt(0).toUpperCase() + args[0].substring(1))) {
                                    args.forEach(e => {
                                        if (typeof e === "undefined") {
                                            console.log(e)
                                        }
                                    })
                                    message.channel.send(`Market price: ${ship[1]}\nBP + Hull Corp: ${ship[2]}\nCorp Hull only:${ship[3]}\nBP cost: ${ship[4]}`);

                                }
                            }
                        });
                    }))
                }

            }).catch(error => {
                console.log(error);
            });

            // message.channel.send(oAuth2Client);
        }


    },
};