module.exports = {
    name: 'help',
    description: 'Prints help',
    execute(message, args) {
        message.channel.send('!ship-request\n!boss\n!corp-player-accounts\n!stock\n!price-check');
    },
};