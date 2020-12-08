module.exports = {
    name: 'boss',
    description: 'Tells who has industry privilege over Auditor.',
    execute(message, args) {
        // 785652854902882334 boss
        let userRole = message.guild.roles.cache.find(role => role.name === "Auditor's Boss")
        let membersWithRole = message.guild.roles.cache.get(userRole.id).members;
        if (message.member.roles.cache.has(userRole.id)) {
            message.channel.send("You are my boss! A list with all my bosses: \n\n");
            membersWithRole.forEach(b => message.channel.send(b.displayName));
        } else {
            message.channel.send("You are not my boss! My bosses are: \n\n");
            membersWithRole.forEach(b => message.channel.send(b.displayName));
        }



    },
};