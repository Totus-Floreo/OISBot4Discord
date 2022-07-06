const { Client, Intents } = require('discord.js'); // Подключаем библиотеку discord.js
const bot = new Client({ intents: [Intents.FLAGS.GUILDS] }); // Объявляем, что bot это класс Client
const fs = require('fs'); // Подключаем родной модуль файловой системы node.js
const channel_ID = "763339131002028093"; // Объявляем id канала в discord
const channel_ID_log = "988228924834205709"; // Объявляем id лог-канала в discord
const favorite_streamer = "kutabaremeow";
let config = require('./config.json'); // Подключаем файл с параметрами и информацией
let token = config.token; // Вытаскиваем из него токен бота
let CLIENT_ID = config.clientId_tw; // Вытаскием номер бота в системе twitch
let secret_token_tw = config.secret_token_tw; // Вытаскием скрытый токен бота в системе discord
const body = 'client_id='+ CLIENT_ID + '&client_secret='+ secret_token_tw + '&grant_type=client_credentials'; // создаем строку для POST запроса
stream_status = false; // Костыль для проверки отправлялось ли оповещение о стриме

bot.once('ready', () => { // Обычное опевещение о запуске бота
  console.log('Ready!');
});

class Streamer {
  constructor(stream_data) {
      //data?.data?.find(s => s.type === live.toLocaleLowerCase()
      try {
        const streamer = stream_data?.data?.find(data => data.user_login);
        this.user_login = streamer['user_login'];
        this.user_name = streamer['user_name'];
        this.game_name = streamer['game_name'];
        this.type = streamer['type'];
        this.title = streamer['title'];
        this.viewer_count = streamer['viewer_count'];
        this.started_at = streamer['started_at'];
      } catch (e) {
        console.log('No data!');
      }
  }

  isStreamLive() {
    return (this.type === 'live') ? true : false;
  }
}

async function getOAUTH2() { // Создание POST запроса на получение OAUTH2 ключа для работы с Twitch API

  const response = await fetch('https://id.twitch.tv/oauth2/token',
  {
    method: 'POST',
    body: body,
    headers: { 'Content-Type':'application/x-www-form-urlencoded'}
  });

  return await response.json();
};

async function getStreamerClass(streamer_name) { // Создание запроса на получение состояния стримера через Twitch API
  try {
    const access = await getOAUTH2();

    const response = await fetch('https://api.twitch.tv/helix/streams?user_login=' + streamer_name,
      {
      headers: {
        'Client-Id': CLIENT_ID,
        'Authorization': 'Bearer ' + access['access_token']
      }});// Запрос к twitch API о стримере

    const stream_data = await response.json();

    return new Streamer(stream_data);

  } catch (e) {
    console.log('Fetch error' + new Date(Date.now()).toString());
  }

};

setInterval(
  async function() {
    let streamer = await getStreamerClass(favorite_streamer);
     if (streamer.isStreamLive())
      {
        if(!stream_status)
        {
          stream_status = true;
          const channelMain = bot.channels.cache.get(channel_ID);
          channelMain.send(favorite_streamer + ' стримит \nhttps://www.twitch.tv/' + favorite_streamer);
          const channelLog = bot.channels.cache.get(channel_ID_log);
          channelLog.send(favorite_streamer + ' стримит. :) Время: ' + new Date(Date.now()).toString());
        }
      }
      else
      {
        if(stream_status)
        {
          stream_status = false;
          const channelMain = bot.channels.cache.get(channel_ID);
          channelMain.send(favorite_streamer + ' офнул. :(');
          const channelLog = bot.channels.cache.get(channel_ID_log);
          channelLog.send(favorite_streamer + ' офнул. :( Время: ' + new Date(Date.now()).toString());
        }
      }
  },
  6000
);

bot.on('interactionCreate', async interaction => { // Реагирование на slash commands
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'stream') {
    let streamer = await getStreamerClass(interaction.options.getString('streamer'));
    if(streamer.isStreamLive())
    {
      await interaction.reply(interaction.user.username + ', ' + streamer.user_name + ' сейчас стримит! \nhttps://www.twitch.tv/' + streamer.user_login);
    }
    else
    {
      if (interaction.channelId === channel_ID_log)
      {
        await interaction.reply(interaction.user.username + ', ' + interaction.options.getString('streamer') + ' сейчас спит! Время: ' + new Date(Date.now()).toString());
      }
      else
      {
        await interaction.reply(interaction.user.username + ', ' + interaction.options.getString('streamer') + ' сейчас спит! ');
      }
    }
  }
});


bot.login(token); // Авторизация бота в системе discord
