module.exports = {
    name: 'command-format',
    description: 'Congratulations! You found a very secret command you were never meant to find!',
    execute(message, args) {
        message.channel.send('Congratulations! You found a very secret command you were never meant to find!');
    },
};