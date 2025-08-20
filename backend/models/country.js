'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Country extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.City, { foreignKey: 'countryCode' });
    }
  }
  Country.init({
    code: {
      type: DataTypes.STRING(5),
      primaryKey: true
    },
    nameEn: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'name_en'
    },
    nameAr: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'name_ar'
    }
  }, {
    sequelize,
    modelName: 'Country',
    tableName: 'countries',
    timestamps: false
  });
  return Country;
};
