const sequelize = require('../config/dbconfig');
var Sequelize = require('sequelize');

const Hashtag = require('./hashtag');

  var Tweet = sequelize.define("tweets", {
    ID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    location: {
        type: Sequelize.STRING,
        allowNull: true
    },
    tweetCreatedAt: {
        type: Sequelize.STRING,
        allowNull: true
    },
    retweetCount: {
        type: Sequelize.STRING,
        allowNull: true
    },
    text: {
        type: Sequelize.STRING,
        allowNull: true
    },
    username: {
        type: Sequelize.STRING,
        allowNull: true
    },
    userUrl: {
        type: Sequelize.STRING,
        allowNull: true
    },
    description: {
        type: Sequelize.STRING,
        allowNull: true
    },
    following: {
        type: Sequelize.STRING,
        allowNull: true
    },
    followers: {
        type: Sequelize.STRING,
        allowNull: true
    },
    totalTweets: {
        type: Sequelize.STRING,
        allowNull: true
    },
    userCreatedAt: {
        type: Sequelize.STRING,
        allowNull: true
    }
  }, {freezeTableName: true});

  Tweet.belongsTo(Hashtag, {foreinKey: 'tweet_ID', as: 'hashtags'});

module.exports = Tweet;