const database = require("../orm/database.js");
const Sequelize = require("sequelize");


module.exports = {
    name: 'ship-request',
    description: 'Puts in a ship request.',
    execute(message, args) {
        // args: shipname amount bp:yes/no payment:cc/donate/additional notes

        if (args[0] === "format") {
            message.channel.send("Orders are stored in the following format:\n" +
                "\n" +
                "@name\n" +
                "Ship name x amount\n" +
                "BP : Yes / No\n" +
                "Payment: Corp Credit / Isks (donation) / Additional notes");

        } else if (false) {
            // placeholder
        } else {
             if (args.length !== 4) {
                 message.channel.send("Incorrect amount of arguments.")
             } else {
                 message.channel.send(`@${message.author.username}\nShip: ${args[0]}\nAmount: ${args[1]}\nBlueprint: ${args[2]}\nPayment method: ${args[3]}`)
                 const authorId = message.author.id;
                 const authorUsername = message.author.username;

                 const errorMessage = database.addShipRequest(args[0], args[1], args[2], authorUsername, authorId, args[3])
                 message.channel.send(errorMessage[Symbol.toStringTag])
                 // database.shipRequestModel().sync();
             }


        }
    }
};