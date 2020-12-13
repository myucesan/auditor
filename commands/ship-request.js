const database = require("../orm/database.js");
const ss = require("../spreadsheet");
const credentials = require('../credentials.json');
const token = require('../token.json');
const {google} = require('googleapis');
const Fuse = require('fuse.js')
const Discord = require('discord.js');

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

        }
        else if (args[0] === "list") {
            let msg = ``;
            let statusEmoji = '';
            if (args[1] === undefined) {args[1] = "undefined"}
            if (args[1].toString().toLowerCase() === "completed") {
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
                            case "in production":
                                statusEmoji = '⏳';
                                break;
                            case "contracted":
                                statusEmoji = '📧';
                                break;
                            case "completed":
                                statusEmoji = '✅';
                                break;
                            case "cancelled":
                                statusEmoji = '🚫';
                                break;
                        }
                        msg += `${statusEmoji}\`${e.id}\` - @${e.pilot} - ${e.ship} | ${e.payment} | _${e.status}_ | ${e.blueprint ? '**BP**' : ''}\n`;
                    });


                }).catch(function (error) {
                    console.log(error);
                })
                message.channel.send(msg);

            }
        }
        else if (args[0] === "manage") {
            // check authorisation
            if (message.member.roles.cache.some(r => ["Auditor's Boss"].includes(r.name))) {
                let managedIds = args[1].split(',').map(id=> +id);
                let allNumbers = managedIds.every(function(element) {return typeof element === 'number';})
                if (allNumbers) {
                    // args[1] should be id and args 2 should be operation
                    let manageId = args[1];
                    let manageArgument = args[2];
                    if (manageArgument === "status") {
                        let status = args[3];
                        switch (status.toLowerCase()) {
                            case "pending":
                                status = "Pending";
                                break;
                            case "inproduction":
                                status = "In production";
                                break;
                            case "cap":
                                status = "Contracted";
                                break;
                            case "completed":
                                status = "Completed";
                                break;
                            case "cancelled":
                                status = "Cancelled";
                                break;
                            default:
                                message.channel.send("Invalid status, resetting to status: Pending.")
                                status = "Pending";
                                break;
                        }

                        managedIds.forEach(id => {
                                let contractedOrder = new Discord.MessageEmbed()
                                    .setColor('#0099ff')
                                    .setTitle('Congratulations, your order has been contracted!')
                                    .setAuthor('Semarin')
                                    .setImage("https://cdn.discordapp.com/attachments/766158782286921738/787414543545532426/image0.jpg")
                            database.getUserByShipRequestID(id).then(function (result) {


                                result.map(e => {
                                    const user = message.guild.members.cache.get(e.pilot_id);
                                    contractedOrder = contractedOrder
                                        .setFooter(`Ordered at: ${e.createdAt}`)
                                        .addField("Ship", e.ship, true)
                                        .addField("Price", 'Contact Industry', true)
                                        .addField("Payment method:", e.payment, true)
                                    user.send(contractedOrder);
                                });

                            }).catch(function (error) {
                                console.log(error);
                            })
                        }
                        )
                        managedIds.forEach(id => {
                            database.updateShipRequest(id, "status", status)
                        } );
                    } else if (manageArgument == "notes") {
                        let notes = args.slice(3, args.length).toString().replace(/,/g, ' ');
                        console.log(notes);

                        managedIds.forEach(id => {
                            database.updateShipRequest(id, "notes", notes)
                        } );
                    }
                }
            }
            else {
                message.channel.send("**You are unauthorised**\n\n");
            }
        } else {
            if (args.length !== 3) {
                message.channel.send("Incorrect amount of arguments. Usage:\n !ship-request [Ship] BP(yes/no] Payment[credit/donate]\n!ship-request list\n!!ship-request-list complete")
            } else {
                const fuse = new Fuse(shipNames, {
                    keys: ['name']
                })
                let booleanStatus = "";
                let search = fuse.search(args[0]);
                let searchResultLen = search.length;
                if (searchResultLen !== 0) {
                    args[0] = search[0].item.name
                }

                if (!(args[1].toLowerCase() === "no" || args[1].toLowerCase() === "n" || args[1].toLowerCase() === "yes" || args[1].toLowerCase() === "y")) {
                    message.channel.send(">>> Blueprint defaults to 'no' because of invalid input");
                    args[1] = false;

                } else if (args[1] === "no" || args[1] === "y") {
                    args[1] = false;
                    booleanStatus = "No";
                } else if (args[1] === "yes" || args[1] === "y") {
                    args[1] = true;
                    booleanStatus = "Yes";
                }

                if (!(args[2].toLowerCase() === "credit" || args[2].toLowerCase() === "donate" || args[2].toLowerCase() === "srp")) {
                    message.channel.send(">>> Payment method defaults to 'donate' because of invalid input");
                    args[2] = "Donate";
                } else {
                    args[2] = args[2][0].toUpperCase() + args[2].substring(1)
                }

                console.log(searchResultLen);
                if (searchResultLen > 1) {
                    message.channel.send(">>> The ship name input has multiple matches, I chose the best one for you but in case it's wrong ask the industry officers to cancel it.");
                }



                message.channel.send(`@${message.author.username}\nShip: ${args[0]}\nBlueprint: ${booleanStatus}\nPayment method: ${args[2]}`)
                const authorId = message.author.id;
                const authorUsername = message.author.username;
                await database.addShipRequest(args[0], args[1], authorUsername, authorId, args[2])
                await database.shipRequestModel().sync();
            }


        }
    }
};

