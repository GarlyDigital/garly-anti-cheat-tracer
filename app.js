const {
  ActivityType,
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
} = require("discord.js");
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
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (!command.data || !command.execute) continue;
    commands.push(command.data.toJSON());
    commandMap.set(command.data.name, command);
    console.log(`[KOMUT] Komutlar/${file} yuklendi: /${command.data.name}`);
  }
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  presence: {
    activities: [{ name: "Develop by Garly", type: ActivityType.Playing }],
    status: "online",
  },
});

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`[BOT] ${readyClient.user.tag} olarak giris yapildi.`);

  if (commands.length > 0) {
    const rest = new REST({ version: "10" }).setToken(token);
    try {
      await rest.put(Routes.applicationCommands(readyClient.user.id), { body: commands });
      console.log(`[SLASH] Aktif komutlar: ${commands.map((c) => `/${c.name}`).join(", ")}`);
    } catch (error) {
      console.error("[SLASH] Komut kaydi basarisiz.", error);
    }
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = commandMap.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error("[KOMUT] Hata:", error);
    const message = "Komut calistirilirken bir hata olustu.";
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: message, ephemeral: true }).catch(() => {});
    } else {
      await interaction.reply({ content: message, ephemeral: true }).catch(() => {});
    }
  }
});

client.login(token).catch((error) => {
  console.error("[LOGIN] Bot giris yapamadi.", error);
  process.exit(1);
});
