const { ActivityType, Client, Events, GatewayIntentBits } = require("discord.js");
const settings = require("./ayarlar.json");
const { token } = settings;

if (!token || token === "BOT_TOKEN_BURAYA") {
  console.error("[CONFIG] ayarlar.json icinde gecerli token bulunamadi.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  presence: {
    activities: [{ name: "Develop by Garly", type: ActivityType.Playing }],
    status: "online",
  },
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`[BOT] ${readyClient.user.tag} olarak giris yapildi.`);
});

client.login(token).catch((error) => {
  console.error("[LOGIN] Bot giris yapamadi.", error);
  process.exit(1);
});
