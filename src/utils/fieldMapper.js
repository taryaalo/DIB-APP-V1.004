export function mapPassportFields(data = {}) {
  if (!data || typeof data !== 'object') return data;
  const fieldMap = {
    'Full Name (Arabic)': 'fullNameArabic',
    'Given Name (English)': 'givenNameEng',
    'Surname (English)': 'surnameEng',
    'Passport No': 'passportNo',
    'Date of Birth': 'dateOfBirth',
    'Place of Birth': 'placeOfBirth',
    'Date of Issue': 'dateOfIssue',
    'Issuing Place': 'issuingPlace',
    'Sex': 'sex',
    'Nationality': 'nationality',
    'Expiry Date': 'expiryDate',
  };
  const mapped = {};
  Object.keys(data).forEach(k => {
    mapped[fieldMap[k] || k] = data[k];
  });
  return mapped;
}

export function mapNIDFields(data = {}) {
  if (!data || typeof data !== 'object') return data;
  const fieldMap = {
    'Family Record Number': 'familyId',
    'National ID': 'nationalId',
    'Sex': 'sex',
    'Day of Birth': 'birthDay',
    'Month of Birth': 'birthMonth',
    'Year of Birth': 'birthYear',
    "Mother's Full Name": 'motherFullName',
    'Marital Status': 'maritalStatus',
  };
  const mapped = {};
  Object.keys(data).forEach(k => {
    mapped[fieldMap[k] || k] = data[k];
  });
  return mapped;
}

export function mapExtractedFields(docType, data) {
  if (docType === 'passport') return mapPassportFields(data);
  if (docType === 'nationalId') return mapNIDFields(data);
  return data;
}