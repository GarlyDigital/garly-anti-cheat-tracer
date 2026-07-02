const { EmbedBuilder } = require("discord.js");

let clientRef = null;
let channelIdRef = null;
const queue = [];
let flushing = false;

function initErrorReporter({ client, channelId }) {
  clientRef = client;
  channelIdRef = channelId || null;
}

async function reportError(scope, message, error = null, meta = {}) {
  const payload = formatPayload(scope, message, error, meta);
  console.error(`[${scope}] ${message}`, error || "");

  if (!clientRef || !channelIdRef) return;

  queue.push(payload);
  if (!flushing) {
    flushing = true;
    try {
      while (queue.length > 0) {
        const item = queue.shift();
        await sendToChannel(item);
      }
    } finally {
      flushing = false;
    }
  }
}

function formatPayload(scope, message, error, meta) {
  const lines = [`**Kapsam:** \`${scope}\``, `**Mesaj:** ${message}`];
  if (meta?.source) lines.push(`**Kaynak:** \`${meta.source}\``);
  if (error?.message) lines.push(`**Hata:** \`${String(error.message).slice(0, 900)}\``);
  if (error?.stack) {
    const stack = String(error.stack).split("\n").slice(0, 6).join("\n");
    lines.push("```", stack.slice(0, 900), "```");
  }
  return { scope, description: lines.join("\n").slice(0, 4096) };
}

async function sendToChannel({ scope, description }) {
  try {
    const channel = await clientRef.channels.fetch(channelIdRef);
    if (!channel || !channel.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setColor(0xef4444)
      .setTitle(`GarlyBot Hata — ${scope}`)
      .setDescription(description)
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (_error) {}
}

module.exports = { initErrorReporter, reportError };
