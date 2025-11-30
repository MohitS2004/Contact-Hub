import {
  validateContactForm,
  validateEmail,
  validatePhone,
  validateRequired,
  validatePassword,
} from '../validation';

describe('Validation Functions', () => {
  describe('validateEmail', () => {
    it('should return null for valid email', () => {
      expect(validateEmail('test@example.com')).toBeNull();
    });

    it('should return error for invalid email', () => {
      expect(validateEmail('invalid-email')).toBeTruthy();
    });

    it('should return error for empty email', () => {
      expect(validateEmail('')).toBeTruthy();
    });
  });

  describe('validatePhone', () => {
    it('should return null for valid phone', () => {
      expect(validatePhone('+1234567890')).toBeNull();
    });

    it('should return error for invalid phone', () => {
      expect(validatePhone('123')).toBeTruthy();
    });

    it('should return error for empty phone', () => {
      expect(validatePhone('')).toBeTruthy();
    });
  });

  describe('validateRequired', () => {
    it('should return null for non-empty value', () => {
      expect(validateRequired('test', 'Field')).toBeNull();
    });

    it('should return error for empty value', () => {
      expect(validateRequired('', 'Field')).toBeTruthy();
    });
  });

  describe('validatePassword', () => {
    it('should return null for valid password', () => {
      expect(validatePassword('password123')).toBeNull();
    });

    it('should return error for short password', () => {
      expect(validatePassword('12345')).toBeTruthy();
    });
  });

  describe('validateContactForm', () => {
    it('should return no errors for valid contact', () => {
      const contact = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
      };

      const errors = validateContactForm(contact);
      expect(errors).toEqual([]);
    });

    it('should return errors for invalid contact', () => {
      const contact = {
        name: '',
        email: 'invalid-email',
        phone: '',
      };

      const errors = validateContactForm(contact);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});

