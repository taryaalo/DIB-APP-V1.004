'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AddressInfo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.PersonalInfo, { foreignKey: 'personalId' });
    }
  }
  AddressInfo.init({
    personalId: {
        type: DataTypes.INTEGER,
        field: 'personal_id'
    },
    nationalId: {
        type: DataTypes.STRING(20),
        field: 'national_id'
    },
    referenceNumber: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'reference_number'
    },
    country: {
        type: DataTypes.STRING(50)
    },
    city: {
        type: DataTypes.STRING(50)
    },
    area: {
        type: DataTypes.STRING(100)
    },
    residentialAddress: {
        type: DataTypes.TEXT,
        field: 'residential_address'
    },
    confirmedByAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'confirmed_by_admin'
    }
  }, {
    sequelize,
    modelName: 'AddressInfo',
    tableName: 'address_info',
    timestamps: false
  });
  return AddressInfo;
};
