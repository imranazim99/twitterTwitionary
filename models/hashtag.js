const sequelize = require('../config/dbconfig');
var Sequelize = require('sequelize');

const Tweet = require('./tweet');

  var Hashtag = sequelize.define("hashtags", {
    ID: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: Sequelize.STRING
    },
    tweet_ID: {
        type: Sequelize.INTEGER
    }
  }, {freezeTableName: true});

  // Hashtag.belongsTo(Tweet, {as: 'tweets', foreinKey: 'tweet_ID'});

module.exports = Hashtag;