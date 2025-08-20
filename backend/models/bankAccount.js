'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BankAccount extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.PersonalInfo, { foreignKey: 'personal_info_id' });
    }
  }
  BankAccount.init({
    personalInfoId: {
      type: DataTypes.INTEGER,
      field: 'personal_info_id'
    },
    customerId: {
      type: DataTypes.STRING(100),
      field: 'customer_id'
    },
    requestData: {
      type: DataTypes.JSONB,
      field: 'request_data'
    },
    responseData: {
      type: DataTypes.JSONB,
      field: 'response_data'
    },
    accountNumber: {
      type: DataTypes.STRING(50),
      field: 'account_number'
    },
    status: {
      type: DataTypes.STRING(20)
    }
  }, {
    sequelize,
    modelName: 'BankAccount',
    tableName: 'bank_accounts',
    createdAt: 'created_at',
    updatedAt: false
  });
  return BankAccount;
};
