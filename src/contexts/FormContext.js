import React, { useState, createContext, useContext, useCallback } from 'react';

const FormContext = createContext();
export const useFormData = () => useContext(FormContext);

const initialState = {
  userType: null,
  highestCompletedStep: 0,
  documents: {
    nationalId: { data: null, file: null },
    passport: { data: null, file: null },
    residenceProof: { data: null, file: null },
  },
  personalInfo: {
    firstNameAr: '',
    middleNameAr: '',
    lastNameAr: '',
    surnameAr: '',
    firstNameEn: '',
    middleNameEn: '',
    lastNameEn: '',
    surnameEn: '',
    motherFullName: '',
    maritalStatus: '',
    passportNumber: '',
    passportIssueDate: '',
    passportExpiryDate: '',
    birthPlace: '',
    dob: '',
    gender: '',
    nationality: '',
    familyRecordNumber: '',
    nidDigits: Array(12).fill(''),
    phone: '',
    email: '',
    enableEmail: false,
    residenceExpiry: '',
    censusCardNumber: '',
    documentType: ''
  },
  workInfo: {
    employmentStatus: '',
    jobTitle: '',
    employer: '',
    employerAddress: '',
    employerPhone: '',
    sourceOfIncome: '',
    monthlyIncome: '',
    workSector: '',
    fieldOfWork: '',
    workStartDate: '',
    workCountry: '',
    workCity: '',
  },
  contactInfo: {},
  companyInfo: {},
  companyContact: {},
  legalRepInfo: {},
  financialInfo: {},
};

export const FormProvider = ({ children }) => {
  const [formData, setFormData] = useState(initialState);

  const isObject = (item) => {
    return (item && typeof item === 'object' && !Array.isArray(item));
  };

  const mergeDeep = (target, source) => {
    let output = { ...target };
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key]) && key in target) {
          output[key] = mergeDeep(target[key], source[key]);
        } else {
          output[key] = source[key];
        }
      });
    }
    return output;
  };

  const updateFormData = useCallback((newData) => {
    setFormData(prevData => mergeDeep(prevData, newData));
  }, []);

  const updateHighestCompletedStep = useCallback((stepIndex) => {
    setFormData(prevData => {
      if (stepIndex > prevData.highestCompletedStep) {
        return { ...prevData, highestCompletedStep: stepIndex };
      }
      return prevData;
    });
  }, []);

  const resetForm = useCallback(() => {
      setFormData(initialState);
  }, []);

  return (
    <FormContext.Provider value={{
        formData,
        updateFormData,
        highestCompletedStep: formData.highestCompletedStep,
        updateHighestCompletedStep,
        resetForm
    }}>
      {children}
    </FormContext.Provider>
  );
};
