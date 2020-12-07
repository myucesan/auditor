module.exports = {
    name: 'future',
    description: 'Auditor will tell about the future plans of him.',
    execute(message, args) {
        message.channel.send('**Emboldened** features are features that are already quite mature or finished and the *italic ones* are currently being worked on.\n\n' +
            '- *Ship requests management*\n' +
            '- Industry Inventory (know the corp mineral/PI stocks)\n' +
            '- Corp player accounts - request the amount of debt or credit you have at the corp\n' +
            '- Members can pass skills \n' +
            '- Pricecheck\n' +
            '' +
            'Statistics:\n\n' +
            '- Monthly reports\n' +
            '- Predict usage\n');
    },
};