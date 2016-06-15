'use strict';

var Spofih = require('./lib/spofih');

var properties = require ("properties");

properties.parse ("config", { path: true }, function (error, configs){
  if (error) return console.error (error);

  var bot = new Spofih({ token: configs.token });
  bot.run();
});




