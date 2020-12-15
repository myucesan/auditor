const Discord = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Prints help',
    aliases: [],
    execute(message, args) {
        message.delete();

        if (args.length ===  0) {
            message.channel.send("> Specify for which command you want help for: \n\n" +
                "```!!help ship-request```")

        } else if (args[0].toLowerCase() === "ship-request" || args[0].toLowerCase() === "sr") {
            if (message.member.roles.cache.some(r => ["Auditor's Boss"].includes(r.name))) {
                const bossUser = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle('Auditor Help | Ship Request | Auditor\'s Boss Mode')
                    .setDescription('The ship request is intended to streamline ship manufacturing process of the corporation.This command has several arguments ' +
                        'one of them being the ship name. You can enter any ship name sold by the corporation WITHOUT SPACES. The next argument is one for the blueprints. You indicate this with [yes, y, no, n] to inform if you will supply the blueprint or not. ' +
                        'Last one indicates your payment method, there are three options available. One is "credit", indicating you have some withstanding balance in the corp wallet ' +
                        'and you want to substract from there. Another one is "donate", indicating you will pay donating to the corporation wallet. The last one is "srp", meaning you will not pay anything because you lost it in a CTA.')
                    .addField("Command", "!!ship-request", true)
                    .addField("Alias(es)", "!!sr", true)
                    .addField("To place an order", "!!sr [Ship] [BP(yes/y/no/n] [Payment(credit/donate/srp)]")
                    .addField("Show all the orders you placed", '!!sr myorders', true)
                    .addField("Show all incompleted orders", "!!sr list", true)
                    .addField("Show all orders of given status", "!!sr list [status]", true)
                    .addField("Change status of 1 order", "!!sr manage ID status cap", true)
                    .addField("Change status of multiple orders", "!!sr manage ID,ID,ID status cap", true)
                    .addField("Put a note on multiple orders", "!!sr manage ID,ID,UD(NO SPACE ELSE DEFAULT VALUE) [notes here, spaces allowed]")
                    .setTimestamp()
                    .setFooter('Developed by Semarin');
                message.member.send(bossUser)

                const statuses = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle("Statuses for orders")
                    .setDescription("Statuses for orders are explained here.")
                    .addField("Pending", "This is the default status of orders the moment they are placed. If something fails at the status update it is likely the status will be reset to pending.")
                    .addField("In production (inproduction as argument)", "This means your ship is in the oven.")
                    .addField("Contracted, Awaiting Payment (cap as argument)", "This means your ship is done and has been contracted to your toon. You will be notified by DM for this.")
                    .addField("Completed", "This is the status your order gets when you accept the contract.")
                    .addField("Cancelled", "You might have accidentally placed an order. If you ask an industry officer to cancel it, it will get this status.")
                message.member.send(statuses)
            } else {
                const normalUser = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle('Auditor Help | Ship Request')
                    .setDescription('The ship request is intended to streamline ship manufacturing process of the corporation.This command has several arguments ' +
                        'one of them being the ship name. You can enter any ship name sold by the corporation WITHOUT SPACES. The next argument is one for the blueprints. You indicate this with [yes, y, no, n] to inform if you will supply the blueprint or not. ' +
                        'Last one indicates your payment method, there are three options available. One is "credit", indicating you have some withstanding balance in the corp wallet ' +
                        'and you want to substract from there. Another one is "donate", indicating you will pay donating to the corporation wallet. The last one is "srp", meaning you will not pay anything because you lost it in a CTA.')
                    .addField("Command", "!!ship-request", true)
                    .addField("Alias(es)", "!!sr", true)
                    .addField("To place an order", "!!sr [Ship] [BP(yes/y/no/n] [Payment(credit/donate/srp)]")
                    .addField("Show all the orders you placed", '!!sr myorders')
                    .setTimestamp()
                    .setFooter('Developed by Semarin');
                    message.member.send(normalUser)
            }

        }




    },
};
