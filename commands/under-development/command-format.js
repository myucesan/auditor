module.exports = {
    name: 'command-format',
    description: 'Congratulations! You found a very secret command you were never meant to find!',
    aliases: [],
    execute(message, args) {
        message.react('👀');
        message.channel.send('Congratulations! You found a very secret command you were never meant to find!');
    },
};