export const APP_CONSTANTS = {
  BCRYPT_SALT_ROUNDS: 10,

  ERRORS: {
    USER_ALREADY_EXISTS: 'User with this email already exists',
    INVALID_CREDENTIALS: 'Invalid credentials',
    CONTACT_NOT_FOUND: 'Contact not found',
    UNAUTHORIZED_ACCESS: 'You do not have permission to access this resource',
    UNAUTHORIZED: 'Unauthorized access',
  },

  SUCCESS: {
    USER_REGISTERED: 'User registered successfully',
    USER_LOGGED_IN: 'User logged in successfully',
    CONTACT_CREATED: 'Contact created successfully',
    CONTACT_UPDATED: 'Contact updated successfully',
    CONTACT_DELETED: 'Contact deleted successfully',
  },

  VALIDATION: {
    PASSWORD_MIN_LENGTH: 6,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
} as const;

