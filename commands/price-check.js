module.exports = {
    name: 'price-check',
    description: 'Shows the price of a ship.',
    execute(message, args) {
        const ss = require("spreadsheet");
        const fs = require('fs');
        message.channel.send('**Not been implemented yet. Ask corp ship prices soon here**\n\n');
        if (args.length != 1) {
            message.channel.send(`Incorrect usage: format:\n!price-check [ship] \nEx:!price-check Vigilant`);
        } else {
            message.channel.send(`Price of ${args[0]} is ***ISK`);
            fs.readFile('credentials.json', (err, content) => {
                if (err) return console.log('Error loading client secret file:', err);
// Authorize a client with credentials, then call the Google Sheets API.
                ss.authorize(JSON.parse(content), ss.lol);
            });
        }
    },
};