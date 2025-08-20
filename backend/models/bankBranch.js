'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BankBranch extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  BankBranch.init({
    branchId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'branch_id'
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
    },
    city: {
      type: DataTypes.STRING(100)
    },
    location: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'BankBranch',
    tableName: 'bank_branches',
    timestamps: false
  });
  return BankBranch;
};
