const database = require("../orm/database.js");

module.exports = {
    name: 'ship-request',
    description: 'Puts in a ship request.',
    aliases: ['sr'],
    async execute(message, args) {
        // args: shipname amount bp:yes/no payment:cc/donate/additional notes

        if (args[0] === "format") {
            message.channel.send("Orders are stored in the following format:\n" +
                "\n" +
                "@name\n" +
                "Ship name x amount\n" +
                "BP : Yes / No\n" +
                "Payment: Corp Credit / Isks (donation) / Additional notes");

        } else if (args[0] === "list") {
            let msg = ``;

            if (args[1] === "complete") {
                database.getShipRequests("complete").then(function (result) {

                    console.log(result.map(e => message.channel.send(`\`\`\`ID: ${e.id}\n@${e.pilot} \nShip: ${e.ship}\nBlueprint: ${e.blueprint}\nPayment: ${e.payment}\nStatus: ${e.status}\n\`\`\``)));

                }).catch(function (error) {
                    console.log(error);
                })
            } else {
                database.getShipRequests().then(function (result) {

                    console.log(result.map(e => message.channel.send(`\`\`\`ID: ${e.id}\n@${e.pilot} \nShip: ${e.ship}\nBlueprint: ${e.blueprint}\nPayment: ${e.payment}\nStatus: ${e.status}\n\`\`\``)));

                }).catch(function (error) {
                    console.log(error);
                })

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
                message.channel.send(`@${message.author.username}\nShip: ${args[0]}\nBlueprint: ${args[1]}\nPayment method: ${args[2]}`)
                const authorId = message.author.id;
                const authorUsername = message.author.username;
                database.addShipRequest(args[0], args[1], authorUsername, authorId, args[2])
                database.shipRequestModel().sync();
            }


        }
    }
};