'use strict';
module.exports = function(sequelize, DataTypes) {
  var Step = sequelize.define('Step', {
    key: DataTypes.STRING,
    value: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Step;
};