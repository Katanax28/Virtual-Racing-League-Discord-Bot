const { parentPort } = require('worker_threads');
const { Client, Intents, GatewayIntentBits} = require('discord.js');

parentPort.on('message', async (data) => {
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
    await client.login(data.token);

    const modChannel = await client.channels.fetch(data.modChannelId);

    const sendReminder = async () => {
        // If there are any members in this field, send a message to ping them
        if (data.declinedField.value !== 'None') {
            await modChannel.send(`List of drivers who declined more than 24h before the race:\n${data.declinedField.value}`);
            console.log(`Attendance log sent for ${data.title}: ${data.countryName}`);
        } else {
            console.log(`No logs have been sent.`);
            console.log(data.declinedField)
            console.log(`contents: ${data.declinedField.value}`)
        }
        console.log('attendance log complete'); //debug

        // Schedule the next reminder
        const now = new Date();
        const nextLogTime = new Date(data.logTime);
        if (now > nextLogTime) {
            nextLogTime.setDate(nextLogTime.getDate() + 1);
        }
        const delay = nextLogTime - now;
        setTimeout(sendReminder, delay);
    };

    // Schedule the first reminder
    const now = new Date();
    const firstLogTime = new Date(data.logTime);
    console.log(firstLogTime)
    if (now > firstLogTime) {
        firstLogTime.setDate(firstLogTime.getDate() + 0.5);
    }
    const delay = firstLogTime - now;
    setTimeout(sendReminder, delay);
});