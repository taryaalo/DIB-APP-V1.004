'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WorkIncomeInfo extends Model {
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
  WorkIncomeInfo.init({
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
    employmentStatus: {
        type: DataTypes.STRING(50),
        field: 'employment_status'
    },
    jobTitle: {
        type: DataTypes.STRING(100),
        field: 'job_title'
    },
    employer: {
        type: DataTypes.STRING(100)
    },
    employerAddress: {
        type: DataTypes.TEXT,
        field: 'employer_address'
    },
    employerPhone: {
        type: DataTypes.STRING(20),
        field: 'employer_phone'
    },
    sourceOfIncome: {
        type: DataTypes.STRING(100),
        field: 'source_of_income'
    },
    monthlyIncome: {
        type: DataTypes.STRING(100),
        field: 'monthly_income'
    },
    workCountry: {
        type: DataTypes.STRING(50),
        field: 'work_country'
    },
    workCity: {
        type: DataTypes.STRING(50),
        field: 'work_city'
    },
    confirmedByAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'confirmed_by_admin'
    },
    workSector: {
        type: DataTypes.STRING(100),
        field: 'work_sector'
    },
    fieldOfWork: {
        type: DataTypes.STRING(100),
        field: 'field_of_work'
    },
    workStartDate: {
        type: DataTypes.DATE,
        field: 'work_start_date'
    }
  }, {
    sequelize,
    modelName: 'WorkIncomeInfo',
    tableName: 'work_income_info',
    timestamps: false
  });
  return WorkIncomeInfo;
};
