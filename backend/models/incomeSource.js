'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class IncomeSource extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  IncomeSource.init({
    nameEn: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'name_en'
    },
    nameAr: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'name_ar'
    }
  }, {
    sequelize,
    modelName: 'IncomeSource',
    tableName: 'income_sources',
    timestamps: false
  });
  return IncomeSource;
};
