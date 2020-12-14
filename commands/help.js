const Discord = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Prints help',
    aliases: [],
    execute(message, args) {
        message.delete();
        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Auditor Help')
            .setDescription('Auditor is meant to ease the administration of EVO1 activities.')
            .addFields(
                { name: 'Available commands:', value: null },
                { name: '!ship-request', value: ' !ship-request [Ship] [Amount] BP(yes/no] Payment[credit/donate]\n' +
                        '!ship-request list\n' +
                        '!!ship-request-list complete', inline: true },
                { name: '!price-check', value: 'Some value here', inline: true },
            )
            .addField('Inline field title', 'Some value here', true)
            .setTimestamp()
            .setFooter('Developed by Semarin');
            message.member.send(exampleEmbed)

        // message.member.send("" +
        //     "```**Help**\n" +
        //     "\n" +
        //     "Below are the available commands I have the power of executing!\n\n" +
        //     "!ship-request (aliases: !sr): Command revolving around the management of ship requests. \n" +
        //     "\tlol```");
    },
};