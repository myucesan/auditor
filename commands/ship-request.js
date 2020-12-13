const database = require("../orm/database.js");
const ss = require("../spreadsheet");
const credentials = require('../credentials.json');
const token = require('../token.json');
const {google} = require('googleapis');
const Fuse = require('fuse.js')

module.exports = {
    name: 'ship-request',
    description: 'Puts in a ship request.',
    aliases: ['sr'],
    async execute(message, args) {
        // args: shipname amount bp:yes/no payment:cc/donate/additional notes
        message.react('👀');
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        let creds = {access_token:token.access_token, refresh_token:token.refresh_token, scope:token.scope, token_type:token.token_type, expiry_date:token.expiry_date};

        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        oAuth2Client.setCredentials(creds);
        let shipNames = [];
        await ss.getShipNames(oAuth2Client).then(result => {
            const rows = result.data.valueRanges;
            if (rows.length) {
                rows.map((row => {
                    row.values.forEach(ship => {
                        if (ship.length !== 0) {
                            let shipName = ship[0].replace(/[*^]+/, '');
                            shipNames.push({
                                name: shipName
                            });
                        }
                    });
                }))
            }
        }).catch(error => {
            console.log(error);
        })

        if (args[0] === "format") {
            message.channel.send("Orders are stored in the following format:\n" +
                "\n" +
                "@name\n" +
                "Ship name x amount\n" +
                "BP : Yes / No\n" +
                "Payment: Corp Credit / Isks (donation) / Additional notes");

        } else if (args[0] === "list") {
            let msg = ``;
            let statusEmoji = '';
            if (args[1] === "completed") {
                await database.getShipRequests("completed").then(function (result) {

                    console.log(result.map(e => {
                        msg += `\`\`\`✅ ID: ${e.id} | @${e.pilot} | Ship: ${e.ship} | Blueprint: ${e.blueprint} | Payment: ${e.payment}| Status: ${e.status}\n\`\`\``;
                    }));
                    message.channel.send(msg);

                }).catch(function (error) {
                    console.log(error);
                })
            } else {

                await database.getOngoingShipRequests().then(function (result) {


                    result.map(e => {
                        switch (e.status.toLowerCase()) {
                            case "pending":
                                statusEmoji = '⚒️';
                                break;
                            case "inproduction":
                                statusEmoji = '⏳';
                                break;
                            case "cap":
                                statusEmoji = '📧';
                                break;
                            case "completed":
                                statusEmoji = '✅';
                                break;
                            case "cancelled":
                                statusEmoji = '🚫';
                                break;

                        }
                        msg += `\`\`\`${statusEmoji} ID: ${e.id} | @${e.pilot} | Ship: ${e.ship} | Blueprint: ${e.blueprint} | Payment: ${e.payment}| Status: ${e.status}\n\`\`\``;
                    });


                }).catch(function (error) {
                    console.log(error);
                })
                message.channel.send(msg);

            }
        } else if (args[0] === "manage") {
            // check authorisation
            if (message.member.roles.cache.some(r => ["Auditor's Boss"].includes(r.name))) {
                message.channel.send("**You are authorised**\n\n");
                if (!isNaN(args[1])) {
                    // args[1] should be id and args 2 should be operation
                    let manageId = args[1];
                    console.log(manageId);
                    if (args[2] === "status") {
                        let status = args[3];
                        console.log(status);
                        await database.updateShipRequest(manageId, "status", status);
                    }
                }
            } else {
                message.channel.send("**You are unauthorised**\n\n");

            }
        } else {
            if (args.length !== 3) {
                message.channel.send("Incorrect amount of arguments. Usage:\n !ship-request [Ship] BP(yes/no] Payment[credit/donate]\n!ship-request list\n!!ship-request-list complete")
            } else {
                const fuse = new Fuse(shipNames, {
                    keys: ['name']
                })

                let search = fuse.search(args[0]);
                let searchResultLen = search.length;
                if (searchResultLen !== 0) {
                    args[0] = search[0].item.name
                }

                if (!(args[1].toLowerCase() === "no" || args[1].toLowerCase() === "n" || args[1].toLowerCase() === "yes" || args[1].toLowerCase() === "y")) {
                    message.channel.send(">>> Blueprint defaults to 'no' because of invalid input");
                    args[1] = false;
                } else {
                    args[1] = true;
                }

                if (!(args[2].toLowerCase() === "credit" || args[2].toLowerCase() === "donate" || args[2].toLowerCase() === "srp")) {
                    message.channel.send(">>> Payment method defaults to 'donate' because of invalid input");
                    args[2] = "Donate";
                }

                if (searchResultLen > 1) {
                    message.channel.send(">>> The ship name input has multiple matches, I chose the best one for you but in case it's wrong ask the industry officers to cancel it.");
                }
                message.channel.send(`@${message.author.username}\nShip: ${args[0]}\nBlueprint: ${args[1]}\nPayment method: ${args[2]}`)
                const authorId = message.author.id;
                const authorUsername = message.author.username;
                database.addShipRequest(args[0], args[1], authorUsername, authorId, args[2])
                database.shipRequestModel().sync();
            }


        }
    }
};