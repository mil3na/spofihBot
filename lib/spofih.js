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

Spofih.prototype.run = function () {
  var bot = new TelegramBot(this.settings.token, {polling: true});

  bot.onText(/\/music (.+)/, function (msg, match) {
    var mtx = msg.text.match(/spotify:track:\w*/);
    var id = mtx[0].replace('spotify:track:', '');
    var music = _getMusicInfo(id);
    music.then(function(response){
      bot.sendMessage(msg.chat.id, response.external_urls.spotify, {reply_to_message_id: msg.message_id});
    });
  });

  bot.onText(/spotify:track:\w*/, function (msg, match) {
    if(msg.text.indexOf("/music") < 0){
      var id = match[0].replace('spotify:track:', '');
      var music = _getMusicInfo(id);
      music.then(function(response){
        bot.sendMessage(msg.from.id, response.external_urls.spotify, {reply_to_message_id: msg.message_id});
      });
    }
   
  });
};

module.exports = Spofih;