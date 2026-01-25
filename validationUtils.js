/**
 * validationUtils.js - Centralized validation and error handling utilities
 * Consolidates repetitive validation logic for consistent error handling
 */

/**
 * Validate if a string is not empty
 * @param {string} value - value to validate
 * @param {string} fieldName - name of the field for error message
 * @returns {Object} { valid: boolean, error: string }
 */
function validateRequired(value, fieldName = "Field") {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return {
      valid: false,
      error: `${fieldName} je obavezan.`
    };
  }
  return { valid: true, error: "" };
}

/**
 * Validate multiple required fields
 * @param {Array} fields - array of {value, name} objects
 * @returns {Object} { valid: boolean, error: string }
 */
function validateRequiredFields(fields) {
  for (const field of fields) {
    const result = validateRequired(field.value, field.name);
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true, error: "" };
}

/**
 * Validate email format
 * @param {string} email - email to validate
 * @returns {Object} { valid: boolean, error: string }
 */
function validateEmail(email) {
  const trimmed = String(email || "").trim();
  if (!trimmed) {
    return { valid: false, error: "Email je obavezan." };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: "Nevažeća email adresa." };
  }
  
  return { valid: true, error: "" };
}

/**
 * Validate number format
 * @param {*} value - value to validate
 * @param {string} fieldName - name of the field for error message
 * @param {Object} options - validation options (min, max, integer)
 * @returns {Object} { valid: boolean, error: string, value: number }
 */
function validateNumber(value, fieldName = "Broj", options = {}) {
  const num = Number(value);
  
  if (!Number.isFinite(num)) {
    return {
      valid: false,
      error: `${fieldName} mora biti validan broj.`,
      value: null
    };
  }
  
  if (options.integer && !Number.isInteger(num)) {
    return {
      valid: false,
      error: `${fieldName} mora biti ceo broj.`,
      value: null
    };
  }
  
  if (options.min !== undefined && num < options.min) {
    return {
      valid: false,
      error: `${fieldName} mora biti najmanje ${options.min}.`,
      value: null
    };
  }
  
  if (options.max !== undefined && num > options.max) {
    return {
      valid: false,
      error: `${fieldName} ne sme biti veći od ${options.max}.`,
      value: null
    };
  }
  
  return { valid: true, error: "", value: num };
}

/**
 * Validate file size
 * @param {File} file - file object to validate
 * @param {number} maxSizeMB - maximum file size in megabytes
 * @returns {Object} { valid: boolean, error: string }
 */
function validateFileSize(file, maxSizeMB = 5) {
  if (!file) {
    return { valid: false, error: "Fajl nije izabran." };
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Fajl je prevelik. Maksimalna veličina je ${maxSizeMB}MB.`
    };
  }
  
  if (file.size === 0) {
    return {
      valid: false,
      error: "Fajl je prazan."
    };
  }
  
  return { valid: true, error: "" };
}

/**
 * Validate file type
 * @param {File} file - file object to validate
 * @param {Array} allowedTypes - array of allowed MIME types or extensions
 * @returns {Object} { valid: boolean, error: string }
 */
function validateFileType(file, allowedTypes = []) {
  if (!file) {
    return { valid: false, error: "Fajl nije izabran." };
  }
  
  if (!allowedTypes || allowedTypes.length === 0) {
    return { valid: true, error: "" };
  }
  
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  const isValid = allowedTypes.some(type => {
    if (type.startsWith('.')) {
      // Extension check
      return fileName.endsWith(type.toLowerCase());
    } else {
      // MIME type check
      return fileType === type.toLowerCase() || fileType.startsWith(type.toLowerCase() + '/');
    }
  });
  
  if (!isValid) {
    return {
      valid: false,
      error: `Nedozvoljen tip fajla. Dozvoljeni tipovi: ${allowedTypes.join(', ')}`
    };
  }
  
  return { valid: true, error: "" };
}

/**
 * Validate file (combines size and type validation)
 * @param {File} file - file object to validate
 * @param {Object} options - validation options { maxSizeMB, allowedTypes }
 * @returns {Object} { valid: boolean, error: string }
 */
function validateFile(file, options = {}) {
  const { maxSizeMB = 5, allowedTypes = [] } = options;
  
  // Check size
  const sizeValidation = validateFileSize(file, maxSizeMB);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }
  
  // Check type
  if (allowedTypes.length > 0) {
    const typeValidation = validateFileType(file, allowedTypes);
    if (!typeValidation.valid) {
      return typeValidation;
    }
  }
  
  return { valid: true, error: "" };
}

/**
 * Validate date string format (YYYY-MM-DD)
 * @param {string} dateStr - date string to validate
 * @param {string} fieldName - name of the field for error message
 * @returns {Object} { valid: boolean, error: string }
 */
function validateDate(dateStr, fieldName = "Datum") {
  if (!dateStr) {
    return { valid: false, error: `${fieldName} je obavezan.` };
  }
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return { valid: false, error: `${fieldName} nije validan.` };
  }
  
  return { valid: true, error: "" };
}

/**
 * Validate string length
 * @param {string} value - string to validate
 * @param {Object} options - validation options { min, max }
 * @param {string} fieldName - name of the field for error message
 * @returns {Object} { valid: boolean, error: string }
 */
function validateLength(value, options = {}, fieldName = "Polje") {
  const str = String(value || "");
  const { min, max } = options;
  
  if (min !== undefined && str.length < min) {
    return {
      valid: false,
      error: `${fieldName} mora imati najmanje ${min} karaktera.`
    };
  }
  
  if (max !== undefined && str.length > max) {
    return {
      valid: false,
      error: `${fieldName} ne sme imati više od ${max} karaktera.`
    };
  }
  
  return { valid: true, error: "" };
}

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} str - string to sanitize
 * @returns {string} sanitized string
 */
function escapeHTML(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Show error message in UI
 * @param {HTMLElement} element - element to display error in
 * @param {string} message - error message
 */
function showError(element, message) {
  if (!element) return;
  element.textContent = message;
  element.style.display = "block";
}

/**
 * Hide error message in UI
 * @param {HTMLElement} element - element to hide error from
 */
function hideError(element) {
  if (!element) return;
  element.textContent = "";
  element.style.display = "none";
}

/**
 * Generic alert handler with error logging
 * @param {string} message - message to display
 * @param {Error} error - optional error object for logging
 */
function showAlert(message, error = null) {
  if (error) {
    console.error("Alert error:", error);
  }
  alert(message);
}

/**
 * Validate permissions with alert
 * @param {boolean} hasPermission - whether user has permission
 * @param {string} message - message to display if no permission
 * @returns {boolean} whether user has permission
 */
function validatePermission(hasPermission, message = "Nemate dozvolu.") {
  if (!hasPermission) {
    showAlert(message);
    return false;
  }
  return true;
}
