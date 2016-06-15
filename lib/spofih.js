'use strict';

var unirest = require("unirest");
var TelegramBot = require('node-telegram-bot-api');

var Spofih = function Constructor(settings) {
  this.settings = settings;
};

var _getMusicInfo = function(id){
  return new Promise(function(fulfill, reject){
    unirest.get('https://api.spotify.com/v1/tracks/' + id)
      .end(function (response) {
        if(response.error){console.log("error"); reject(response.error)}
        else fulfill(response.body);
      });
  });
};

var _sendMusicInfo = function(id, sendTo, replyTo, bot){
  var music = _getMusicInfo(id);
  music.then(function(response){
    bot.sendMessage(sendTo, response.external_urls.spotify, {reply_to_message_id: replyTo});},
    function(error){
      bot.sendMessage(sendTo, "Could not find your music!", {reply_to_message_id: replyTo})
    });
}

var _findMusicId = function(msg){
  var mtx = msg.match(/spotify:track:\w*/);
  return mtx[0].replace('spotify:track:', '');
}

Spofih.prototype.run = function () {
  var bot = new TelegramBot(this.settings.token, {polling: true});

  //This is for groups
  bot.onText(/\/music (.+)/, function (msg, match) {
    _sendMusicInfo(_findMusicId(msg.text), msg.chat.id, msg.message_id, bot);
  });

  //This is for private messages
  bot.onText(/spotify:track:\w*/, function (msg, match) {
    //little hack to not send the same message twice. FIXME
    if(msg.text.indexOf("/music") < 0){
      _sendMusicInfo(_findMusicId(msg.text), msg.from.id, msg.message_id, bot);
    }
   
  });
};

module.exports = Spofih;