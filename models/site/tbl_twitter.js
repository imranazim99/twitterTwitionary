const sequelize = require('../../config/dbconfig');
var Sequelize = require('sequelize');

const tblHashtag = require('./tbl_hashtag');

  var tblTwitter = sequelize.define("tbl_twitter", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    location: {
        type: Sequelize.STRING,
        allowNull: true
    },
    tweetcreatedts: {
        type: Sequelize.STRING,
        allowNull: true
    },
    retweetcount: {
        type: Sequelize.STRING,
        allowNull: true
    },
    text: {
        type: Sequelize.STRING,
        allowNull: true
    },
    Username: {
        type: Sequelize.STRING,
        allowNull: true
    },
    links: {
        type: Sequelize.STRING,
        allowNull: true
    },
    acctdesc: {
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
    totaltweets: {
        type: Sequelize.STRING,
        allowNull: true
    },
    usercreatedts: {
        type: Sequelize.STRING,
        allowNull: true
    },
    key_words: {
        type: Sequelize.STRING,
        allowNull: true
    },
    hashtags: {
        type: Sequelize.STRING,
        allowNull: true
    }
  }, {freezeTableName: true});

  tblTwitter.belongsTo(tblHashtag, {foreinKey: 'twitter_id', as: 'tbl_hashtags'});

module.exports = tblTwitter;