const ss = require("../spreadsheet");
const credentials = require('../credentials.json');
const token = require('../token.json');
const {google} = require('googleapis');
const Fuse = require('fuse.js')
const Discord = require("discord.js");


module.exports = {

    name: 'price-check',
    description: 'Shows the price of a ship.',
    aliases: ['pc'],
    async execute(message, args) {
        message.react('👀');
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        let creds = {access_token:token.access_token, refresh_token:token.refresh_token, scope:token.scope, token_type:token.token_type, expiry_date:token.expiry_date};

        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);
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

        let shipNameListMessageFrigates = ""; // 16
        let shipNameListMessageDestroyers = ""; // 1
        let shipNameListMessageCruisers = ""; // 24
        let shipNameListMessageBattleCruisers = ""; // 8
        let shipNameListMessageBattleShips = ""; // 5
        let shipNameListMessageIndustrials = ""; // 3
        let shipNameListMessage = []; // all




        if (args[0].toLowerCase() === "list") {
            let i = 0;
            shipNames.forEach(e => {
                i += 1;
                if (i <= 16) {
                    shipNameListMessageFrigates += e.name + "\n";
                } else if (i > 16 && i < 18) {
                    shipNameListMessageDestroyers += e.name + "\n";
                } else if (i >= 18 && i < 41) {
                    shipNameListMessageCruisers += e.name + "\n";
                } else if (i >= 41 && i <= 48) {
                    shipNameListMessageBattleCruisers += e.name + "\n";
                } else if (i > 48 && i < 54) {
                    shipNameListMessageBattleShips += e.name + "\n";
                } else if (i >= 54 && i < 57) {
                    shipNameListMessageIndustrials += e.name + "\n";
                }
                shipNameListMessage += e.name + "\n"
            })

            if (args[1] === undefined) {
                message.channel.send(shipNameListMessage);
            } else if (args[1].toLowerCase() === "frigates") {
                message.channel.send(shipNameListMessageFrigates);
            } else if (args[1].toLowerCase() === "destroyers") {
                message.channel.send(shipNameListMessageDestroyers);
            } else if (args[1].toLowerCase() === "cruisers") {
                message.channel.send(shipNameListMessageCruisers);
            } else if (args[1].toLowerCase() === "battlecruisers") {
                message.channel.send(shipNameListMessageBattleCruisers);
            } else if (args[1].toLowerCase() === "battleships") {
                message.channel.send(shipNameListMessageBattleCruisers);
            } else if (args[1].toLowerCase() === "industrials") {
                message.channel.send(shipNameListMessageIndustrials);
            }

        } else {

            const fuse = new Fuse(shipNames, {
                keys: ['name']
            })
            let shipNameInput = args.slice(0, args.length).toString().replace(/,/g, ' ');
            let search = fuse.search(shipNameInput);
            search = search[0].item.name;

            await ss.getShipsWithPrice(oAuth2Client).then(result => {
                console.log(`${result.data.valueRanges.length} ranges retrieved.`);
                const rows = result.data.valueRanges;
                if (rows.length) {
                    rows.map((row => {
                        row.values.forEach(ship => {
                            if (ship.length !== 0) {
                                let shipName = ship[0].replace(/[*^]+/, '');
                                if (shipName === search) {
                                    try {
                                        const priceCheckEmbed = new Discord.MessageEmbed()
                                            .setColor('#0099ff')
                                            .setTitle(`Price Check | ${search}`)
                                            .addField("Ship", search, true)
                                            .addField('Market price', ship[1], true)
                                            .addField("BP + Hull Corp", ship[2], true)
                                            .addField("Corp Hull Only", ship[3], true)
                                            .addField("Blueprint Only", ship[4] + " million", true)
                                            .addField("Corp discount", String(Math.round(((parseFloat(ship[1].replace(",", ".")) - parseFloat(ship[2].replace(",", "."))) + Number.EPSILON) * 100) / 100) + " million", true)
                                            .setTimestamp()

                                        message.channel.send(priceCheckEmbed);
                                    } catch (e) {
                                        message.channel.send("All prices are not defined yet for this ship.");
                                    }
                                    // message.channel.send(`Ship: ${search}\nMarket price: ${ship[1]}\nBP + Hull Corp: ${ship[2]}\nCorp Hull only:${ship[3]}\nBP cost: ${ship[4]}`);
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
