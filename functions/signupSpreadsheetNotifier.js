require('dotenv').config();
const { google } = require('googleapis');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});
const discordToken = process.env.DISCORD_TOKEN;
const discordChannelId = process.env.DISCORD_SIGNUP_CHANNEL_ID;
const sheetsApiCredentials = JSON.parse(process.env.GOOGLE_SHEETS_API_CREDENTIALS); // Add this to your .env file
const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID; // Add this to your .env file

let lastCheckedRow = null;

const sheets = google.sheets({ version: 'v4', auth: sheetsApiCredentials });

async function getLastRow() {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Form Responses 1', // Update this with your sheet name
    });

    return response.data.values.pop();
}

async function sendDiscordMessage(content) {
    const channel = await client.channels.fetch(discordChannelId);
    channel.send(content);
}

async function checkForNewSignups() {
    const lastRow = await getLastRow();
    if (lastRow !== lastCheckedRow) {
        lastCheckedRow = lastRow;
        sendDiscordMessage(`New signup: ${lastRow.join(', ')}`);
    }
}

client.once('ready', () => {
    console.log('Checking for new signups...');
    setInterval(checkForNewSignups, 5000); // Check every minute
});

client.login(discordToken);