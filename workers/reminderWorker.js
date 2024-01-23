const { parentPort } = require('worker_threads');
const { Client, Intents, GatewayIntentBits} = require('discord.js');

parentPort.on('message', async (data) => {
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
    await client.login(data.token);

    const checkinChannel = client.channels.fetch(data.checkinChannelId);

    const sendReminder = async () => {
        console.log('reminder program started');

        // const checkinChannel = await client.channels.fetch('1197557758778679337');
        // const messages = await checkinChannel.messages.fetch({ limit: 1 });
        // const message = messages.first();
        // console.log(`message: ` . message)
        // const embed = message.embeds[0];
        // console.log(`embed: ` . message.embeds[0])

        // const pendingField = data.embed.fields.find(field => field.name === '❓ Pending:');
        console.log(`Pending field value: ${data.pendingField.value}`); // Log the value of the 'Pending:' field

        // If there are any members in this field, send a message to ping them
        if (data.pendingField.value !== 'None') {
            console.log('Sending reminder...'); // debug
            await checkinChannel.send(`Reminder for those who have not yet confirmed their attendance: ${data.pendingField.value}`);
            console.log(`Reminder sent for ${data.title}: ${data.countryName}`);
            console.log('Reminder sent.'); // debug
        } else {
            console.log(`No reminders have been sent.`);
        }
        console.log('reminder program complete'); //debug

        // Schedule the next reminder
        const now = new Date();
        const nextReminderTime = new Date(data.reminderTime);
        if (now > nextReminderTime) {
            nextReminderTime.setDate(nextReminderTime.getDate() + 1);
        }
        const delay = nextReminderTime - now;
        setTimeout(sendReminder, delay);
    };

    // Schedule the first reminder
    const now = new Date();
    const firstReminderTime = new Date(data.reminderTime);
    console.log(firstReminderTime)
    if (now > firstReminderTime) {
        firstReminderTime.setDate(firstReminderTime.getDate() + 1);
    }
    const delay = firstReminderTime - now;
    setTimeout(sendReminder, delay);
});