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
const { initErrorReporter, reportError } = require("./utils/errorReporter");
const { token } = settings;

if (!token || token === "BOT_TOKEN_BURAYA") {
  logApp("error", "CONFIG", "ayarlar.json icinde gecerli token bulunamadi.");
  process.exit(1);
}

const commands = [];
const commandMap = new Collection();
const commandsPath = path.join(__dirname, "Komutlar");

if (fs.existsSync(commandsPath)) {
  for (const file of fs.readdirSync(commandsPath).filter((f) => f.endsWith(".js"))) {
    const command = require(path.join(commandsPath, file));
    if (!command.data || !command.execute) {
      logApp("warn", "KOMUT", `${file} dosyasinda data veya execute eksik.`);
      continue;
    }
    commands.push(command.data.toJSON());
    commandMap.set(command.data.name, command);
    logApp("success", "KOMUT", `Komutlar/${file} yuklendi: /${command.data.name}`);
  }
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  presence: {
    activities: [{ name: "Develop by Garly", type: ActivityType.Playing }],
    status: "online",
  },
});

initErrorReporter({
  client,
  channelId: settings.errorLogChannelId || null,
});

client.once(Events.ClientReady, async (readyClient) => {
  logApp("success", "BOT", `${readyClient.user.tag} olarak giris yapildi.`);

  const rest = new REST({ version: "10" }).setToken(token);
  try {
    await rest.put(Routes.applicationCommands(readyClient.user.id), { body: commands });
    const activeNames = commands.map((cmd) => `/${cmd.name}`).join(", ") || "(yok)";
    logApp("success", "SLASH", `Slash komutlari sifirlandi. Aktif komutlar: ${activeNames}`);
  } catch (error) {
    logApp("error", "SLASH", "Slash komutu yuklenirken hata olustu.", error);
  }
});

client.on(Events.Error, (error) => {
  logApp("error", "DISCORD", "Discord client hatasi.", error);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = commandMap.get(interaction.commandName);
  if (!command) return;

  try {
    logApp("command", "KOMUT", `@${interaction.user.username} /${interaction.commandName}`);
    await command.execute(interaction);
  } catch (error) {
    logApp("error", "KOMUT", "Komut calistirilirken hata olustu.", error);
    const message = "Komut calistirilirken bir hata olustu.";
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: message, ephemeral: true }).catch(() => {});
    } else {
      await interaction.reply({ content: message, ephemeral: true }).catch(() => {});
    }
  }
});

function logApp(level, scope, message, error = null) {
  const styles = {
    info: { tag: "OK", color: "\x1b[36m" },
    success: { tag: "OK", color: "\x1b[32m" },
    command: { tag: "CMD", color: "\x1b[35m" },
    warn: { tag: "WARN", color: "\x1b[33m" },
    error: { tag: "ERR", color: "\x1b[31m" },
  };
  const reset = "\x1b[0m";
  const scopeColor = "\x1b[34m";
  const style = styles[level] || styles.info;
  const plainMessage = `[${scope}] ${message}`;
  const padding = " ".repeat(Math.max(62 - plainMessage.length, 1));
  const line = `${scopeColor}[${scope}]${reset} ${message}${padding}${style.color}[${style.tag}]${reset}`;
  const writer = level === "error" ? console.error : console.log;
  writer(line);
  if (error) console.error(error);
  if (level === "error") reportError(scope, message, error, { source: "app", level });
}

process.on("unhandledRejection", (error) => {
  logApp("error", "SISTEM", "Yakalanmamis hata.", error);
});

process.on("uncaughtException", (error) => {
  logApp("error", "SISTEM", "Yakalanmamis kritik hata.", error);
});

client.login(token).catch((error) => {
  logApp("error", "LOGIN", "Bot giris yapamadi.", error);
  process.exit(1);
});
