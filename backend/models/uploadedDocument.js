'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UploadedDocument extends Model {
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
  UploadedDocument.init({
    personalId: {
        type: DataTypes.INTEGER,
        field: 'personal_id'
    },
    nationalId: {
        type: DataTypes.STRING(20),
        field: 'national_id'
    },
    docType: {
        type: DataTypes.STRING(50),
        field: 'doc_type'
    },
    fileName: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'file_name'
    },
    referenceNumber: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'reference_number'
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
    }
  }, {
    sequelize,
    modelName: 'UploadedDocument',
    tableName: 'uploaded_documents',
    createdAt: 'created_at',
    updatedAt: false
  });
  return UploadedDocument;
};
