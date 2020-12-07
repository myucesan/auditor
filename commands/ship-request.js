module.exports = {
    name: 'ship-request',
    description: 'Puts in a ship request.',
    execute(message, args) {
        // args: shipname bp:yes/no payment:cc/donate/additional notes

        if (args[0] === "format") {
            message.channel.send("Subsequent orders to be in following format\n" +
                "\n" +
                "@name\n" +
                "Ship name x amount\n" +
                "BP : Yes / No\n" +
                "Payment: Corp Credit / Isks (donation) / Additional notes")
        } else {
            message.channel.send(`@${message.author.username}\nShip: ${args[0]}\nBlueprint: ${args[1]}\nPayment method: ${args[2]}`)

        }
    }
};