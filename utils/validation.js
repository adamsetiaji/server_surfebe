// utils/validation.js

// Helper functions for common validations
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password) => {
  // At least 6 chars, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return passwordRegex.test(password);
};

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates user data for creation or update
 * @param {Object} data - User data to validate
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Object} Validation result with error field
 */
exports.validateUser = (data, isUpdate = false) => {
  const errors = [];

  // Skip validation for fields not present during update
  if (!isUpdate || data.name !== undefined) {
    if (!data.name) {
      errors.push('Name is required');
    } else if (typeof data.name !== 'string') {
      errors.push('Name must be a string');
    } else if (data.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    } else if (data.name.trim().length > 100) {
      errors.push('Name cannot exceed 100 characters');
    }
  }

  if (!isUpdate || data.email !== undefined) {
    if (!data.email) {
      errors.push('Email is required');
    } else if (typeof data.email !== 'string') {
      errors.push('Email must be a string');
    } else if (!isValidEmail(data.email.trim())) {
      errors.push('Please provide a valid email address');
    }
  }

  if (!isUpdate || data.password_surfebe !== undefined) {
    if (!data.password_surfebe) {
      errors.push('Password is required');
    } else if (typeof data.password_surfebe !== 'string') {
      errors.push('Password must be a string');
    } else if (!isValidPassword(data.password_surfebe)) {
      errors.push('Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number');
    }
  }

  // Optional fields validation
  if (data.phone !== undefined) {
    if (typeof data.phone !== 'string') {
      errors.push('Phone must be a string');
    } else if (!/^\+?[\d\s-]{10,}$/.test(data.phone.trim())) {
      errors.push('Please provide a valid phone number');
    }
  }

  if (data.role !== undefined) {
    const validRoles = ['user', 'admin', 'moderator'];
    if (!validRoles.includes(data.role)) {
      errors.push(`Role must be one of: ${validRoles.join(', ')}`);
    }
  }

  return {
    error: errors.length > 0 ? errors.join(', ') : null,
    sanitizedData: errors.length === 0 ? sanitizeData(data) : null
  };
};

/**
 * Validates reCAPTCHA data for creation or update
 * @param {Object} data - reCAPTCHA data to validate
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Object} Validation result with error field
 */
exports.validateRecaptcha = (data, isUpdate = false) => {
  const errors = [];

  // Skip validation for fields not present during update
  if (!isUpdate || data.site !== undefined) {
    if (!data.site) {
      errors.push('Site is required');
    } else if (typeof data.site !== 'string') {
      errors.push('Site must be a string');
    } else if (!isValidUrl(data.site)) {
      errors.push('Site must be a valid URL');
    }
  }

  if (!isUpdate || data.site_key !== undefined) {
    if (!data.site_key) {
      errors.push('Site key is required');
    } else if (typeof data.site_key !== 'string') {
      errors.push('Site key must be a string');
    } else if (!/^[a-zA-Z0-9_-]{40}$/.test(data.site_key)) {
      errors.push('Invalid site key format');
    }
  }

  if (data.settings !== undefined) {
    if (typeof data.settings !== 'object' || Array.isArray(data.settings)) {
      errors.push('Settings must be an object');
    } else {
      // Validate specific settings properties
      const validThemes = ['light', 'dark'];
      if (data.settings.theme && !validThemes.includes(data.settings.theme)) {
        errors.push(`Theme must be one of: ${validThemes.join(', ')}`);
      }

      if (data.settings.timeout !== undefined && 
          (typeof data.settings.timeout !== 'number' || 
           data.settings.timeout < 30 || 
           data.settings.timeout > 600)) {
        errors.push('Timeout must be a number between 30 and 600 seconds');
      }
    }
  }

  return {
    error: errors.length > 0 ? errors.join(', ') : null,
    sanitizedData: errors.length === 0 ? sanitizeData(data) : null
  };
};

/**
 * Sanitizes data by trimming strings and removing undefined values
 * @param {Object} data - Data to sanitize
 * @returns {Object} Sanitized data
 */
const sanitizeData = (data) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (typeof value === 'string') {
        sanitized[key] = value.trim();
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
};
