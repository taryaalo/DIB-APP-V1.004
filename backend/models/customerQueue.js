'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CustomerQueue extends Model {
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
  CustomerQueue.init({
    branch: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    referenceNumber: {
      type: DataTypes.STRING(100),
      field: 'reference_number'
    },
    appointmentTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'appointment_time'
    }
  }, {
    sequelize,
    modelName: 'CustomerQueue',
    tableName: 'customer_queue',
    createdAt: 'created_at',
    updatedAt: false
  });
  return CustomerQueue;
};
