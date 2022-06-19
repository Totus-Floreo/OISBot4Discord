const { Client, Intents } = require('discord.js'); // Подключаем библиотеку discord.js
const bot = new Client({ intents: [Intents.FLAGS.GUILDS] }); // Объявляем, что bot это класс Client 
const fs = require('fs'); // Подключаем родной модуль файловой системы node.js
const live = 'live'; // Костыль для проверки JSON ответа от twitch о состоянии стримера
const streamer = "kutabaremeow"; // Объявляем никнейм стримера
const channel_ID = "763339131002028093"; // Объявляем id канала в discord
let config = require('./config.json'); // Подключаем файл с параметрами и информацией
let token = config.token; // Вытаскиваем из него токен бота
let CLIENT_ID = config.clientId_tw; // Вытаскием номер бота в системе discord
let secret_token_tw = config.secret_token_tw; // Вытаскием скрытый токен бота в системе discord
const body = 'client_id='+ CLIENT_ID + '&client_secret='+ secret_token_tw + '&grant_type=client_credentials'; // создаем строку для POST запроса
stream_status = false; // Костыль для проверки отправлялось ли оповещение о стриме 

bot.once('ready', () => { // Обычное опевещение о запуске бота
  console.log('Ready!');
});

async function getOAUTH2() { // Создание POST запроса на получение OAUTH2 ключа для работы с Twitch API

  const response = await fetch('https://id.twitch.tv/oauth2/token', 
  { 
    method: 'POST', 
    body: body, 
    headers: { 'Content-Type':'application/x-www-form-urlencoded'}
  });

  const keys = await response.json();

  return keys;
}

async function isStreamerLive() { // Создание запроса на получение состояния стримера через Twitch API

  const access = await getOAUTH2();

  const response = await fetch('https://api.twitch.tv/helix/streams?user_login=' + streamer,
    {
    headers: { 
      'Client-Id': CLIENT_ID,
      'Authorization': 'Bearer ' + access['access_token']
    }});// Запрос к twitch API о стримере

  const data = await response.json();

  if (data?.data?.find(s => s.type === live.toLocaleLowerCase())) // проверка JSON ответа от twitch API на ключевое слово
  {
    return true;
  }
  else
  {
    return false;
  }
};

setInterval(
  async function() {
     if (await isStreamerLive())
      {
        if(!stream_status)
        {
          stream_status = true;
          const channel = bot.channels.cache.get(channel_ID);
          channel.send('Капибара стримит \nhttps://www.twitch.tv/kutabaremeow');
        }
      }
      else
      {
        if(stream_status)
        {
          stream_status = false;
          const channel = bot.channels.cache.get(channel_ID);
          channel.send('Капибара офнул \nhttps://www.twitch.tv/kutabaremeow');
        }
      }
  },
  6000
);

bot.on('interactionCreate', async interaction => { // Реагирование на slash commands 
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'stream') {
    if(await isStreamerLive())
    {
      await interaction.reply(interaction.user.username + ', Капибара сейчас стримит! https://www.twitch.tv/kutabaremeow');
    }
    else
    {
      await interaction.reply(interaction.user.username + ', Капибара сейчас спит!');
    }    
  }
});


bot.login(token); // Авторизация бота в системе discord