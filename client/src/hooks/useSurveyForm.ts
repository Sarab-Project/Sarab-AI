import { useState } from 'react';

export const useSurveyForm = () => {
  const [form, setForm] = useState({
    EyeSide: '',
    Gender: '',
    Age: '',
    City: '',
    Status: '',
    Profession: '',
    Notes: '',
  });

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    const { Notes, ...requiredFields } = form;
    return Object.values(requiredFields).every(value => value.trim() !== '');
  };

  return { form, updateField, isFormValid };
};