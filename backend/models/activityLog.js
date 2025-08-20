'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ActivityLog extends Model {
    static associate(models) {
      // define association here
    }
  }
  ActivityLog.init({
    activity: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ActivityLog',
    tableName: 'activity_log',
    createdAt: 'created_at',
    updatedAt: false
  });
  return ActivityLog;
};
