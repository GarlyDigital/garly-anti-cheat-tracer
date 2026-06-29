const { ActivityType, Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const settings = require("./ayarlar.json");
const { token } = settings;

if (!token || token === "BOT_TOKEN_BURAYA") {
  console.error("[CONFIG] ayarlar.json icinde gecerli token bulunamadi.");
  process.exit(1);
}

const commands = [];
const commandMap = new Collection();
const commandsPath = path.join(__dirname, "Komutlar");

if (fs.existsSync(commandsPath)) {
  for (const file of fs.readdirSync(commandsPath).filter((f) => f.endsWith(".js"))) {
    const command = require(path.join(commandsPath, file));
    if (!command.data || !command.execute) continue;
    commands.push(command.data.toJSON());
    commandMap.set(command.data.name, command);
    console.log(`[KOMUT] /${command.data.name} yuklendi`);
  }
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
