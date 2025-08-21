/**
 * Ensures that input fields can only be filled in with correct validation, e.g.
 * only strings can be entered in name fields, or email addresses must contain the @ sign.
 */
async function checkContactInputs(userName, userEmail, userPhone, currentContactId = null) {
  let inputElements = getInputElements();
  let valid = true;

  valid = validateNameField(userName, inputElements.nameInput) && valid;
  valid = await validateEmailField(userEmail, inputElements.mailInput, currentContactId) && valid;
  valid = validatePhoneField(userPhone, inputElements.phoneInput) && valid;

  return valid;
}

/**
 * Gets all input elements for validation
 */
function getInputElements() {
  let nameInput = document.getElementById('editContactName') || document.getElementById('newContactName');
  let mailInput = document.getElementById('editContactMail') || document.getElementById('newContactMail');
  let phoneInput = document.getElementById('editContactPhone') || document.getElementById('newContactPhone');
  return { nameInput, mailInput, phoneInput };
}

/**
 * Validates name field input
 */
function validateNameField(userName, nameInput) {
  if (!userName || userName.trim().length < 2) {
    showInputError(nameInput, 'Check it is filled with a name');
    return false;
  } else {
    hideInputError(nameInput);
    return true;
  }
}

/**
 * Validates email field input
 */
async function validateEmailField(userEmail, mailInput, currentContactId) {
  if (!userEmail || !/^.+@.+\.[a-zA-Z]{2,4}$/.test(userEmail)) {
    showInputError(mailInput, 'Check it is filled with a valid email');
    return false;
  } else {
    if (await isEmailTaken(userEmail, currentContactId)) {
      showInputError(mailInput, 'This email address is already in use');
      return false;
    } else {
      hideInputError(mailInput);
      return true;
    }
  }
}

/**
 * Validates phone field input
 */
function validatePhoneField(userPhone, phoneInput) {
  if (!userPhone || userPhone.trim() === '') {
    showInputError(phoneInput, 'Enter a number (min. 5 digits)');
    return false;
  } else if (userPhone.trim() !== '-') {
    return validatePhoneLength(userPhone, phoneInput);
  } else {
    hideInputError(phoneInput);
    return true;
  }
}

/**
 * Validates phone number length
 */
function validatePhoneLength(userPhone, phoneInput) {
  let phoneLength = userPhone.replace(/\s/g, '').length;
  if (userPhone.startsWith('+')) {
    phoneLength -= 2;
  }

  if (phoneLength < 5) {
    showInputError(phoneInput, 'Enter a number (min. 5 digits)');
    return false;
  } else {
    hideInputError(phoneInput);
    return true;
  }
}

/**
 * Shows error message below input field and triggers shake animation
 */
function showInputError(input, message) {
  let errorDiv = document.getElementById(input.id + '-error');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }
  shakeInput(input, message);
}

/**
 * Hides error message and clears input error state
 */
function hideInputError(input) {
  let errorDiv = document.getElementById(input.id + '-error');
  if (errorDiv) {
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';
  }
  clearInputError(input);
}

/**
 * Validates name input and hides error if valid
 */
function validateNameInput(input) {
  hideInputError(input);
  let value = input.value.trim();
  if (value.length >= 2) {
    hideInputError(input);
  }
}

/**
 * Validates email input by removing invalid characters and clearing errors
 */
function validateEmailInput(input) {
  hideInputError(input);
  input.value = input.value.replace(/[^a-zA-Z0-9@._%+-]/g, '');
  clearInputError(input);
}

/**
 * ensures that telephone numbers receive the international country code for the German area code
 */
function validatePhoneInput(input) {
  let value = input.value;
  hideInputError(input);

  if (!validatePhoneStartChar(value, input)) {
    return;
  }

  value = cleanPhoneValue(value);
  value = addGermanPrefix(value);
  input.value = formatPhoneNumber(value);
}

/**
 * Validates the first character of phone input
 */
function validatePhoneStartChar(value, input) {
  if (value.length > 0) {
    const firstChar = value.charAt(0);
    if (firstChar !== '+' && firstChar !== '0' && firstChar !== '-') {
      showInputError(input, 'Please start with "0" or "+" or "-"');
      input.value = '';
      return false;
    }
  }
  return true;
}

/**
 * Cleans phone value by removing invalid characters
 */
function cleanPhoneValue(value) {
  value = value.replace(/[^+\d-]/g, '');
  value = value.replace(/(?!^)[-]/g, '');
  value = value.replace(/(?!^)[+]/g, '');
  return value;
}

/**
 * Adds German prefix if number starts with 0
 */
function addGermanPrefix(value) {
  if (value.startsWith('0')) {
    value = '+49 ' + value.substring(1);
  }
  return value;
}

/**
 * Formats phone number with spaces
 */
function formatPhoneNumber(value) {
  let prefix = value.slice(0, 3);
  let rest = value.slice(3).replace(/^\s*/, '');
  let firstBlock = rest.slice(0, 3);
  let secondBlock = rest.slice(3);
  let formatted = prefix;
  if (rest.length > 0) formatted += ' ' + firstBlock;
  if (secondBlock.length > 0) formatted += ' ' + secondBlock;
  formatted = formatted.slice(0, 17);
  return formatted;
}