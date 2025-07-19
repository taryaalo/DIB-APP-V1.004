import React, { useState, createContext, useContext } from 'react';

const FormContext = createContext();
export const useFormData = () => useContext(FormContext);

export const FormProvider = ({ children }) => {
  const [formData, setFormData] = useState({ provider: 'gemini' });
  return (
    <FormContext.Provider value={{ formData, setFormData }}>
      {children}
    </FormContext.Provider>
  );
};
