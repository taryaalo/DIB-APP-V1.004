'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CustomerDetail extends Model {
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
  CustomerDetail.init({
    personalInfoId: {
      type: DataTypes.INTEGER,
      field: 'personal_info_id'
    },
    customerId: {
      type: DataTypes.STRING(100),
      field: 'customer_id'
    },
    createdBy: {
      type: DataTypes.STRING(100),
      field: 'created_by'
    }
  }, {
    sequelize,
    modelName: 'CustomerDetail',
    tableName: 'customer_details',
    createdAt: 'created_at',
    updatedAt: false
  });
  return CustomerDetail;
};
