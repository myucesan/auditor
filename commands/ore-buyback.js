module.exports = {
    name: 'ore-buyback',
    description: 'Gives the ore buyback guide and the link to sheet',
    aliases: ['ob'],
    execute(message, args) {
        message.react('👀');
        message.member.send('You can' +
            'check the google sheet pinned in #mining called ORE BUYBACK\n' +
            'Fill in player name, and amount you want to sell\n' +
            'Printscreen the sheet and paste it in #mining \n' +
            'Contract the ores to "Mat Book"\n' +
            '\n' +
            'Insert the stated isk in sheet in the "Isk Request" part of the contract if you want isk directly\n' +
            '\n' +
            'If none placed, isks will be assigned as corp credit.');
    },
};