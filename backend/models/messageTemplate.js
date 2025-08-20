'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MessageTemplate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  MessageTemplate.init({
    templateKey: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'template_key'
    },
    media: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    englishTemplate: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'english_template'
    },
    arabicTemplate: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'arabic_template'
    }
  }, {
    sequelize,
    modelName: 'MessageTemplate',
    tableName: 'message_templates',
    timestamps: false
  });
  return MessageTemplate;
};
