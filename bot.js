const { Client, Intents } = require('discord.js'); // Подключаем библиотеку discord.js
const robot = new Client({ intents: [Intents.FLAGS.GUILDS] }); // Объявляем, что robot - бот
const fs = require('fs'); // Подключаем родной модуль файловой системы node.js  
let config = require('./config.json'); // Подключаем файл с параметрами и информацией
let serverToken = config.token; // «Вытаскиваем» из него токен

robot.once('ready', () => {
  console.log('Ready!');
});

/*
robot.on('presenceUpdate', async newPresence  => { 
});
*/

robot.on('interactionCreate', async interaction => { // Реагирование на команды
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'test') {
    await interaction.reply(interaction.user.username + ' пошёл нахуй, не трогай!!');
  } else if (commandName === 'server') {
    await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
  } else if (commandName === 'user') {
    await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
  }
});

robot.login(serverToken); // Авторизация бота