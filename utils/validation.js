// utils/validation.js
exports.validateUser = (data) => {
    const errors = [];
  
    if (!data.name || typeof data.name !== 'string') {
      errors.push('Name is required and must be a string');
    }
  
    if (!data.email || !data.email.includes('@')) {
      errors.push('Valid email is required');
    }
  
    if (!data.password_surfebe || data.password_surfebe.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
  
    if (errors.length > 0) {
      return { error: errors.join(', ') };
    }
  
    return { error: null };
  };
  
  exports.validateRecaptcha = (data) => {
    const errors = [];
  
    if (!data.site || typeof data.site !== 'string') {
      errors.push('Site is required and must be a string');
    }
  
    if (!data.site_key || typeof data.site_key !== 'string') {
      errors.push('Site key is required and must be a string');
    }
  
    if (errors.length > 0) {
      return { error: errors.join(', ') };
    }
  
    return { error: null };
  };