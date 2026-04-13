import { useState } from 'react';

export const useSurveyForm = () => {
  const [form, setForm] = useState({
    eye_side: '',
    gender: '',
    age: '',
    city: '',
    status: '',
    profession: '',
    notes: '',
  });

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    const { notes, ...requiredFields } = form;
    return Object.values(requiredFields).every(value => value.trim() !== '');
  };

  return { form, updateField, isFormValid };
};