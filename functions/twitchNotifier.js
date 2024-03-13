require('dotenv').config();
const axios = require('axios');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const twitchChannelName = process.env.TWITCH_CHANNEL_NAME;
const twitchClientId = process.env.TWITCH_CLIENT_ID;
const twitchClientSecret = process.env.TWITCH_CLIENT_SECRET;
const discordToken = process.env.DISCORD_TOKEN;
const discordChannelId = process.env.DISCORD_STREAM_CHANNEL_ID;

let twitchAccessToken = null;
let isLive = false;

async function getTwitchAccessToken() {
    try {
        const response = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${twitchClientId}&client_secret=${twitchClientSecret}&grant_type=client_credentials`);
        twitchAccessToken = response.data.access_token;
    }
    catch (error) {
        console.error('Failed to get Twitch access token:', error);
    }
}

async function checkLiveStatus() {
    try {
        const response = await axios.get(`https://api.twitch.tv/helix/streams?user_login=${twitchChannelName}`, {
            headers: {
                'Client-ID': twitchClientId,
                'Authorization': `Bearer ${twitchAccessToken}`
            }
        });

        const streamData = response.data.data[0];
        if (streamData && !isLive) {
            isLive = true;
            const discordChannel = await client.channels.fetch(discordChannelId);
            discordChannel.send(`We are live! https://twitch.tv/${streamData.user_name} @everyone`);
        } else if (!streamData) {
            isLive = false;
        }
    }
    catch (error) {
        console.error('Failed to check live status:', error);
    }
}

client.once('ready', () => {
    console.log('Twitch notifications are ready');
    getTwitchAccessToken().then(() => {
        setInterval(checkLiveStatus, 60000); // Check every minute
    });
});

client.login(discordToken);