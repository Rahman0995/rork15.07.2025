export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Обязательное поле');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Некорректный формат email');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Обязательное поле');
  } else {
    if (password.length < 6) {
      errors.push('Минимум 6 символов');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePhone = (phone: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!phone) {
    errors.push('Обязательное поле');
  } else {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      errors.push('Некорректный формат телефона');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!value || value.trim().length === 0) {
    errors.push(`${fieldName} - обязательное поле`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateMinLength = (value: string, minLength: number, fieldName: string): ValidationResult => {
  const errors: string[] = [];
  
  if (value && value.length < minLength) {
    errors.push(`${fieldName} должно содержать минимум ${minLength} символов`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateMaxLength = (value: string, maxLength: number, fieldName: string): ValidationResult => {
  const errors: string[] = [];
  
  if (value && value.length > maxLength) {
    errors.push(`${fieldName} не должно превышать ${maxLength} символов`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateDate = (dateString: string, fieldName: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!dateString) {
    errors.push(`${fieldName} - обязательное поле`);
  } else {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      errors.push(`${fieldName} - некорректная дата`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateFutureDate = (dateString: string, fieldName: string): ValidationResult => {
  const errors: string[] = [];
  const dateValidation = validateDate(dateString, fieldName);
  
  if (!dateValidation.isValid) {
    return dateValidation;
  }
  
  const date = new Date(dateString);
  const now = new Date();
  
  if (date <= now) {
    errors.push(`${fieldName} должна быть в будущем`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateReportForm = (data: {
  title: string;
  content: string;
  unit: string;
  priority: string;
  dueDate?: string;
}): ValidationResult => {
  const errors: string[] = [];
  
  const titleValidation = validateRequired(data.title, 'Заголовок');
  if (!titleValidation.isValid) {
    errors.push(...titleValidation.errors);
  }
  
  const contentValidation = validateRequired(data.content, 'Содержание');
  if (!contentValidation.isValid) {
    errors.push(...contentValidation.errors);
  }
  
  const unitValidation = validateRequired(data.unit, 'Подразделение');
  if (!unitValidation.isValid) {
    errors.push(...unitValidation.errors);
  }
  
  const priorityValidation = validateRequired(data.priority, 'Приоритет');
  if (!priorityValidation.isValid) {
    errors.push(...priorityValidation.errors);
  }
  
  if (data.dueDate) {
    const dueDateValidation = validateFutureDate(data.dueDate, 'Срок выполнения');
    if (!dueDateValidation.isValid) {
      errors.push(...dueDateValidation.errors);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateTaskForm = (data: {
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  priority: string;
}): ValidationResult => {
  const errors: string[] = [];
  
  const titleValidation = validateRequired(data.title, 'Название задачи');
  if (!titleValidation.isValid) {
    errors.push(...titleValidation.errors);
  }
  
  const descriptionValidation = validateRequired(data.description, 'Описание');
  if (!descriptionValidation.isValid) {
    errors.push(...descriptionValidation.errors);
  }
  
  const assignedToValidation = validateRequired(data.assignedTo, 'Ответственный');
  if (!assignedToValidation.isValid) {
    errors.push(...assignedToValidation.errors);
  }
  
  const dueDateValidation = validateFutureDate(data.dueDate, 'Срок выполнения');
  if (!dueDateValidation.isValid) {
    errors.push(...dueDateValidation.errors);
  }
  
  const priorityValidation = validateRequired(data.priority, 'Приоритет');
  if (!priorityValidation.isValid) {
    errors.push(...priorityValidation.errors);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateEventForm = (data: {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location?: string;
  type: string;
}): ValidationResult => {
  const errors: string[] = [];
  
  const titleValidation = validateRequired(data.title, 'Название события');
  if (!titleValidation.isValid) {
    errors.push(...titleValidation.errors);
  }
  
  const descriptionValidation = validateRequired(data.description, 'Описание');
  if (!descriptionValidation.isValid) {
    errors.push(...descriptionValidation.errors);
  }
  
  const startDateValidation = validateDate(data.startDate, 'Дата начала');
  if (!startDateValidation.isValid) {
    errors.push(...startDateValidation.errors);
  }
  
  const endDateValidation = validateDate(data.endDate, 'Дата окончания');
  if (!endDateValidation.isValid) {
    errors.push(...endDateValidation.errors);
  }
  
  // Check if end date is after start date
  if (startDateValidation.isValid && endDateValidation.isValid) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    
    if (endDate <= startDate) {
      errors.push('Дата окончания должна быть после даты начала');
    }
  }
  
  const typeValidation = validateRequired(data.type, 'Тип события');
  if (!typeValidation.isValid) {
    errors.push(...typeValidation.errors);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const combineValidations = (...validations: ValidationResult[]): ValidationResult => {
  const allErrors: string[] = [];
  
  validations.forEach(validation => {
    if (!validation.isValid) {
      allErrors.push(...validation.errors);
    }
  });
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};