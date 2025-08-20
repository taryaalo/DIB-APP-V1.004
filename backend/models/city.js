'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class City extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Country, { foreignKey: 'countryCode' });
    }
  }
  City.init({
    countryCode: {
      type: DataTypes.STRING(5),
      allowNull: false,
      primaryKey: true,
      field: 'country_code'
    },
    cityCode: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true,
      field: 'city_code'
    },
    nameAr: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'name_ar'
    },
    nameEn: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'name_en'
    }
  }, {
    sequelize,
    modelName: 'City',
    tableName: 'cities',
    timestamps: false
  });
  return City;
};
