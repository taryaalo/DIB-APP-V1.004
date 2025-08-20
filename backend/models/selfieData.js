'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SelfieData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.PersonalInfo, { foreignKey: 'referenceNumber', targetKey: 'referenceNumber' });
    }
  }
  SelfieData.init({
    referenceNumber: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'reference_number'
    },
    photoPaths: {
      type: DataTypes.JSONB,
      field: 'photo_paths'
    },
    descriptors: {
      type: DataTypes.JSONB
    }
  }, {
    sequelize,
    modelName: 'SelfieData',
    tableName: 'selfie_data',
    createdAt: 'created_at',
    updatedAt: false
  });
  return SelfieData;
};
