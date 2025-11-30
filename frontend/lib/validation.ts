export interface ValidationError {
  field: string;
  message: string;
}

export function validateEmail(email: string): string | null {
  if (!email) {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone) {
    return 'Phone is required';
  }
  // Basic phone validation - allows various formats
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  if (!phoneRegex.test(phone) || phone.replace(/\D/g, '').length < 10) {
    return 'Please enter a valid phone number';
  }
  return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim().length === 0) {
    return `${fieldName} is required`;
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  return null;
}

export function validateContactForm(data: {
  name: string;
  email: string;
  phone: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  const nameError = validateRequired(data.name, 'Name');
  if (nameError) {
    errors.push({ field: 'name', message: nameError });
  }

  const emailError = validateEmail(data.email);
  if (emailError) {
    errors.push({ field: 'email', message: emailError });
  }

  const phoneError = validatePhone(data.phone);
  if (phoneError) {
    errors.push({ field: 'phone', message: phoneError });
  }

  return errors;
}

export function validateLoginForm(data: {
  email: string;
  password: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  const emailError = validateEmail(data.email);
  if (emailError) {
    errors.push({ field: 'email', message: emailError });
  }

  const passwordError = validatePassword(data.password);
  if (passwordError) {
    errors.push({ field: 'password', message: passwordError });
  }

  return errors;
}

export function validateRegisterForm(data: {
  email: string;
  password: string;
  confirmPassword?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  const emailError = validateEmail(data.email);
  if (emailError) {
    errors.push({ field: 'email', message: emailError });
  }

  const passwordError = validatePassword(data.password);
  if (passwordError) {
    errors.push({ field: 'password', message: passwordError });
  }

  if (data.confirmPassword && data.password !== data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }

  return errors;
}

