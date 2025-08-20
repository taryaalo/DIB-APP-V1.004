'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ErrorLog extends Model {
    static associate(models) {
      // define association here
    }
  }
  ErrorLog.init({
    error: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ErrorLog',
    tableName: 'error_log',
    createdAt: 'created_at',
    updatedAt: false
  });
  return ErrorLog;
};
