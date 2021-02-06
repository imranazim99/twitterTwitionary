const sequelize = require('../../config/dbconfig');
var Sequelize = require('sequelize');

const tblTwitter = require('./tbl_twitter');

  var tblHashtag = sequelize.define("tbl_hashtags", {
    Id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: Sequelize.STRING
    },
    twitter_id: {
        type: Sequelize.INTEGER
    }
  }, {freezeTableName: true});

  // tblHashtag.belongsTo(tblTwitter, {as: 'tbl_twitters', foreinKey: 'twitter_id'});

module.exports = tblHashtag;