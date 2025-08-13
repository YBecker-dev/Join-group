/**
 * Runs validation checks on all individual fields of the registration form.
 */
function checkAllFields() {
  checkName();
  checkEmail();
  checkPassword();
  checkPasswordConfirm();
  checkCheckbox();
}

/**
 * Validates the name input field, showing an error if it's empty.
 */
function checkName() {
  nameWarning = document.getElementById('name-warning');
  if (!nameInput.value.length) {
    nameInput.classList.add('input-error');
    nameWarning.classList.remove('d-none');
    shakeInput(nameInput, 'Please enter a valid name.');
  } else {
    nameInput.classList.remove('input-error');
    nameWarning.classList.add('d-none');
  }
}

/**
 * Validates the email input field with a regex, showing an error if invalid.
 */
function checkEmail() {
  emailWarning = document.getElementById('email-warning');
  if (!/^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$/.test(emailInput.value)) {
    emailInput.classList.add('input-error');
    emailWarning.classList.remove('d-none');
    shakeInput(emailInput, 'Enter a valid password.');
  } else {
    emailInput.classList.remove('input-error');
    emailWarning.classList.add('d-none');
  }
}

/**
 * Validates the password input field, checking for length and required characters.
 */
function checkPassword() {
  passwordWarning = document.getElementById('password-warning');
  if (passwordInput.value.length < 8 || !/[A-ZÄÖÜ]/.test(passwordInput.value)) {
    passwordInput.classList.add('input-error');
    passwordWarning.classList.remove('d-none');
    shakeInput(passwordInput, 'Enter a valid password.');
  } else {
    passwordInput.classList.remove('input-error');
    passwordWarning.classList.add('d-none');
  }
}

/**
 * Validates the password confirmation input, ensuring it matches the password field.
 */
function checkPasswordConfirm() {
  passwordConfirmWarning = document.getElementById('password-confirm-warning');
  if (passwordConfirmInput.value !== passwordInput.value || !passwordConfirmInput.value) {
    passwordConfirmInput.classList.add('input-error');
    passwordConfirmWarning.classList.remove('d-none');
    shakeInput(passwordConfirmInput, 'Passwords do not match!');
  } else {
    passwordConfirmInput.classList.remove('input-error');
    passwordConfirmWarning.classList.add('d-none');
  }
}

/**
 * Validates the checkbox, adding an error class if it is not checked.
 */
function checkCheckbox() {
  if (!checkbox.checked) {
    checkbox.classList.add('input-error');
  } else {
    checkbox.classList.remove('input-error');
  }
}
