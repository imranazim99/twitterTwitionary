const sequelize = require('../../config/dbconfig');
var Sequelize = require('sequelize');

  var tblKeyword = sequelize.define("tbl_keywords", {
    Id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    Keyword: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    }
  }, {freezeTableName: true});

module.exports = tblKeyword;