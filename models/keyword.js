const sequelize = require('../config/dbconfig');
var Sequelize = require('sequelize');

  var Keyword = sequelize.define("keywords", {
    ID: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    keyword: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    }
  }, {freezeTableName: true});

module.exports = Keyword;