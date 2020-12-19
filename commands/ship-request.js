const database = require("../orm/database.js");
const ss = require("../spreadsheet");
const credentials = require('../credentials.json');
const token = require('../token.json');
const {google} = require('googleapis');
const Fuse = require('fuse.js')
const Discord = require('discord.js');
const { zonedTimeToUtc, utcToZonedTime, format, setHours} = require('date-fns-tz')

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
            if (message.member.roles.cache.some(r => ["Auditor's Boss"].includes(r.name))) {
                let msg = ``;
            let statusEmoji = '';
            if (args[1] === undefined) {args[1] = "undefined"}
            if (args[1].toString().toLowerCase() === "completed") {
                await database.getShipRequests("completed").then(function (result) {

                    console.log(result.map(e => {
                        msg += `\`\`\`✅ ID: ${e.id} | @${e.pilot} | Ship: ${e.ship} | Blueprint: ${e.blueprint} | Payment: ${e.payment}| Status: ${e.status}\n\`\`\``;

                        if (msg.length > 1900) {
                            message.channel.send(msg);
                            msg = ``;
                        }
                    }));
                    message.channel.send(msg);

                }).catch(function (error) {
                    console.log(error);
                })
            } else {
                let pendingOrders = ``;
                let inproductionOrders = ``;
                let contractedOrders = ``;

                await database.getOngoingShipRequests().then(function (result) {

                    result.map(e => {
                        switch (e.status.toLowerCase()) {
                            case "pending":
                                statusEmoji = '⚒️';
                                pendingOrders += `${statusEmoji}\`${e.id}\` - @${e.pilot} - ${e.ship} | ${e.payment} | _${e.status}_ | ${e.blueprint ? '**BP**' : ''}\n`;
                                break;
                            case "in production":
                                statusEmoji = '⏳';
                                inproductionOrders += `${statusEmoji}\`${e.id}\` - @${e.pilot} - ${e.ship} | ${e.payment} | _${e.status}_ | ${e.blueprint ? '**BP**' : ''}\n`;
                                break;
                            case "contracted":
                                statusEmoji = '📧';
                                contractedOrders += `${statusEmoji}\`${e.id}\` - @${e.pilot} - ${e.ship} | ${e.payment} | _${e.status}_ | ${e.blueprint ? '**BP**' : ''}\n`;
                                break;
                            case "completed":
                                statusEmoji = '✅';
                                break;
                            case "cancelled":
                                statusEmoji = '🚫';
                                break;
                        }
                        msg = pendingOrders + inproductionOrders + contractedOrders;
                    });


                }).catch(function (error) {
                    console.log(error);

                })
                let size;
                let splitted = "";
                if (msg.length > 1900) {
                    if (msg == null) return [];
                    msg = String(msg);
                    size = ~~1900;
                    splitted = size > 0 ? msg.match(new RegExp('.{1,' + size + '}', 'g')) : [msg];
                    splitted.forEach(e => message.channel.send(e));
                } else {
                    message.channel.send(msg);
                }

            }
        }}
        else if (args[0].toLowerCase() === "manage") {
            // check authorisation
            if (message.member.roles.cache.some(r => ["Auditor's Boss"].includes(r.name))) {
                let managedIds = args[1].split(',').map(id=> +id);
                if (managedIds.length > 10) {
                    message.channel.send("This command is capped to 10 id's. '");
                    return;
                }
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
                            database.getUserByShipRequestID("srid", id).then(function (result) {

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
                        });
                    }
                }
            }
            else {
                message.channel.send("**You are unauthorised**\n\n");
            }
        } else if (args[0].toLowerCase() === "myorders") {

            let myOrdersEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Your (uncompleted) orders')
                .setAuthor(message.author.username)
            await database.getUserByShipRequestID("by_pilot", message.author.id).then(function (result) {
                result.map(e => {
                    myOrdersEmbed.addField(e.ship, e.status, true);
                    myOrdersEmbed.addField("Notes:", e.notes, true);
                    myOrdersEmbed.addField("\u200B", "\u200B", true)

                })}).catch(e => console.log(e));
                message.author.send(myOrdersEmbed);
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
                    booleanStatus = "No";


                } else if (args[1].toLowerCase() === "no" || args[1].toLowerCase() === "y") {
                    args[1] = false;
                    booleanStatus = "No";
                } else if (args[1].toLowerCase() === "yes" || args[1].toLowerCase() === "y") {
                    args[1] = true;
                    booleanStatus = "Yes";
                }

                if (!(args[2].toLowerCase() === "credit" || args[2].toLowerCase() === "donate" || args[2].toLowerCase() === "srp")) {
                    message.channel.send(">>> Payment method defaults to 'donate' because of invalid input");
                    args[2] = "Donate";
                } else if (args[2].toLowerCase() === "srp") {
                    args[2] = args[2].toUpperCase()
                } else {
                    args[2] = args[2][0].toUpperCase() + args[2].substring(1)
                }

                console.log(searchResultLen);
                if (searchResultLen > 1) {
                    message.channel.send(">>> The ship name input has multiple matches, I chose the best one for you but in case it's wrong ask the industry officers to cancel it.");
                }

                let marketPrice = 0;
                let bpHullCorp = 0;
                let hullCorp = 0
                await ss.getShipsWithPrice(oAuth2Client).then(result => {
                    const rows = result.data.valueRanges;

                    if (rows.length) {
                        rows.map(row => {
                            row.values.forEach(ship => {
                                if (ship.length !== 0) {
                                    let shipName = ship[0].replace(/[*^]+/, '');

                                    if (shipName === args[0]) {
                                        marketPrice = parseFloat(ship[1].replace(",", "."));
                                        bpHullCorp = parseFloat(ship[2].replace(",", "."));
                                        hullCorp = parseFloat(ship[3].replace(",", "."));

                                    }
                                }
                            })
                        })
                    }
                })



                message.channel.send(`@${message.author.username}\nShip: ${args[0]}\nBlueprint: ${booleanStatus}\nPayment method: ${args[2]}`)
                const authorId = message.author.id;
                const authorUsername = message.author.username;
                console.log("Adding ship request")
                await database.addShipRequest(args[0], args[1], marketPrice, bpHullCorp, hullCorp, authorUsername, authorId, args[2])
                await database.shipRequestModel().sync();
            }


        }
    }
};

