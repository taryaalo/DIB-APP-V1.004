'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PersonalInfo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasOne(models.AddressInfo, { foreignKey: 'personalId' });
      this.hasOne(models.WorkIncomeInfo, { foreignKey: 'personalId' });
      this.hasMany(models.UploadedDocument, { foreignKey: 'personalId' });
      this.hasOne(models.CustomerDetail, { foreignKey: 'personal_info_id' });
      this.hasMany(models.BankAccount, { foreignKey: 'personal_info_id' });
      this.hasOne(models.SelfieData, { foreignKey: 'referenceNumber', sourceKey: 'referenceNumber' });
      this.hasMany(models.CustomerQueue, { foreignKey: 'referenceNumber', sourceKey: 'referenceNumber' });
    }
  }
  PersonalInfo.init({
    fullName: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'full_name'
    },
    firstName: {
        type: DataTypes.STRING(100),
        field: 'first_name'
    },
    middleName: {
        type: DataTypes.STRING(100),
        field: 'middle_name'
    },
    lastName: {
        type: DataTypes.STRING(100),
        field: 'last_name'
    },
    passportNumber: {
        type: DataTypes.STRING(50),
        field: 'passport_number'
    },
    passportIssueDate: {
        type: DataTypes.DATE,
        field: 'passport_issue_date'
    },
    passportExpiryDate: {
        type: DataTypes.DATE,
        field: 'passport_expiry_date'
    },
    birthPlace: {
        type: DataTypes.STRING(100),
        field: 'birth_place'
    },
    dob: {
        type: DataTypes.DATE
    },
    gender: {
        type: DataTypes.STRING(10)
    },
    nationality: {
        type: DataTypes.STRING(50)
    },
    familyRecordNumber: {
        type: DataTypes.STRING(50),
        field: 'family_record_number'
    },
    nationalId: {
        type: DataTypes.STRING(20),
        field: 'national_id'
    },
    phone: {
        type: DataTypes.STRING(20)
    },
    email: {
        type: DataTypes.STRING(100)
    },
    residenceExpiry: {
        type: DataTypes.DATE,
        field: 'residence_expiry'
    },
    censusCardNumber: {
        type: DataTypes.STRING(50),
        field: 'census_card_number'
    },
    referenceNumber: {
        type: DataTypes.STRING(100),
        unique: true,
        field: 'reference_number'
    },
    aiModel: {
        type: DataTypes.STRING(20),
        field: 'ai_model'
    },
    serviceType: {
        type: DataTypes.STRING(50),
        field: 'service_type'
    },
    manualFields: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        field: 'manual_fields'
    },
    confirmedByAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'confirmed_by_admin'
    },
    approvedByAdminName: {
        type: DataTypes.STRING(100),
        field: 'approved_by_admin_name'
    },
    approvedByAdminIp: {
        type: DataTypes.STRING(50),
        field: 'approved_by_admin_ip'
    },
    firstNameAr: {
        type: DataTypes.STRING(100),
        field: 'first_name_ar'
    },
    middleNameAr: {
        type: DataTypes.STRING(100),
        field: 'middle_name_ar'
    },
    lastNameAr: {
        type: DataTypes.STRING(100),
        field: 'last_name_ar'
    },
    surnameAr: {
        type: DataTypes.STRING(100),
        field: 'surname_ar'
    },
    surnameEn: {
        type: DataTypes.STRING(100),
        field: 'surname_en'
    },
    motherFullName: {
        type: DataTypes.STRING(255),
        field: 'mother_full_name'
    },
    maritalStatus: {
        type: DataTypes.STRING(50),
        field: 'marital_status'
    },
    branchId: {
        type: DataTypes.INTEGER,
        field: 'branch_id'
    },
    language: {
        type: DataTypes.STRING(5)
    }
  }, {
    sequelize,
    modelName: 'PersonalInfo',
    tableName: 'personal_info',
    createdAt: 'created_at',
    updatedAt: false
  });
  return PersonalInfo;
};
