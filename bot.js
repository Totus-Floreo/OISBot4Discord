const { Client, Intents } = require('discord.js'); // Подключаем библиотеку discord.js
const robot = new Client({ intents: [Intents.FLAGS.GUILDS] }); // Объявляем, что robot - бот
const fs = require('fs'); // Подключаем родной модуль файловой системы node.js  
let config = require('./config.json'); // Подключаем файл с параметрами и информацией
let serverToken = config.token; // «Вытаскиваем» из него токен
let CLIENT_ID = config.clientId_tw;
let secret_token_tw = config.secret_token_tw;

robot.once('ready', () => {
  console.log('Ready!');
});

const body = 'client_id='+ CLIENT_ID + '&client_secret='+ secret_token_tw + '&grant_type=client_credentials';

async function getOAUTH2() {

  const response = await fetch('https://id.twitch.tv/oauth2/token', 
  { 
    method: 'POST', 
    body: body, 
    headers: { 'Content-Type':'application/x-www-form-urlencoded'}
  });

  const keys = await response.json();

  return keys;
}

async function isStreamerLive() {

  const access = await getOAUTH2();

  const header = {   
    "Client-Id": CLIENT_ID,
    "Authorization": 'Bearer ' + access['access_token']    
  }

  const response = await fetch('https://api.twitch.tv/helix/streams?user_login=kutabaremeow', 
    {headers: 
      { 'Client-Id': CLIENT_ID,
      'Authorization': 'Bearer ' + access['access_token']
    }});

  const data = await response.json();

  const live = 'live';

  if (data?.data?.find(s => s.type === live.toLocaleLowerCase()))
  {
    return true;
  }
  else
  {
    return false;
  }
};

robot.on('interactionCreate', async interaction => { // Реагирование на команды
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'oleg') {
    if(isStreamerLive())
    {
      await interaction.reply(interaction.user.username + ', Олег сейчас стримит!');
    }
    else
    {
      await interaction.reply(interaction.user.username + ', Олег сейчас спит!');
    }    
  } else if (commandName === 'server') {
    await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
  } else if (commandName === 'user') {
    await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
  }
});

robot.login(serverToken); // Авторизация бота
