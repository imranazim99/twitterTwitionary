
const sequelize = require('../config/dbconfig');
var Sequelize = require('sequelize');

  var roles = sequelize.define("roles", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    permission: {
      type: Sequelize.ENUM,
      values: ['admin','admin_user','user', 'guest'],
      defaultValue: 'guest'
    },
    isDelete: {
      type: Sequelize.INTEGER,
      defaultValue: '1'
    }
  }, {freezeTableName: true});

module.exports = roles;