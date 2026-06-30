const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Botun calisip calismadigini test eder."),

  async execute(interaction) {
    await interaction.reply("Test basarili!");
  },
};
