const BASE_URL = 'https://authenticationprototyp-default-rtdb.europe-west1.firebasedatabase.app/';
const FIREBASE_URL_USERSDATA = 'https://join-tasks-4a707-default-rtdb.europe-west1.firebasedatabase.app/users.json';
let button;
let checkbox;
let nameInput;
let emailInput;
let passwordInput;
let passwordConfirmInput;
let pw1Icon;
let pw2Icon;

function init() {
  initializeElements();
  setupEventListeners();
}

/**
 * Retrieves and stores key HTML elements for the registration form.
 */
function initializeElements() {
  button = document.getElementById('signup-btn');
  checkbox = document.getElementById('accept');
  nameInput = document.getElementById('name');
  emailInput = document.getElementById('email');
  passwordInput = document.getElementById('password');
  passwordConfirmInput = document.getElementById('password-confirm');
  pw1Icon = document.getElementById('password-icon');
  pw2Icon = document.getElementById('password-confirm-icon');
}

/**
 * Attaches event listeners to all relevant form elements to handle user input and interaction.
 */
function setupEventListeners() {
  passwordInput.addEventListener('input', handlePasswordInput);
  passwordConfirmInput.addEventListener('input', handlePasswordConfirmInput);
  pw1Icon.addEventListener('click', togglePassword1Visibility);
  pw2Icon.addEventListener('click', togglePassword2Visibility);
  nameInput.addEventListener('input', handleNameInput);
  checkbox.addEventListener('change', handleCheckboxChange);
}

/**
 * Handles input in the password field, updating the icon and clearing validation errors.
 * @param {Event} this - The input event object.
 */
function handlePasswordInput() {
  let inputValue = this.value.trim();
  if (inputValue === '') {
    pw1Icon.src = '../img/icon/lock.png';
    pw1Icon.classList.remove('eye-icon');
  } else {
    pw1Icon.classList.add('eye-icon');
    pw1Icon.src = '../img/icon/hidden.png';
  }
  this.classList.remove('input-error');
  document.getElementById('password-warning').classList.add('d-none');
  this.setCustomValidity('');
}

/**
 * Handles input in the password confirmation field, updating the icon and clearing validation errors.
 * @param {Event} this - The input event object.
 */
function handlePasswordConfirmInput() {
  let inputValue = this.value.trim();
  if (inputValue === '') {
    pw2Icon.src = '../img/icon/lock.png';
    pw2Icon.classList.remove('eye-icon');
  } else {
    pw2Icon.classList.add('eye-icon');
    pw2Icon.src = '../img/icon/hidden.png';
  }
  this.classList.remove('input-error');
  document.getElementById('password-confirm-warning').classList.add('d-none');
  this.setCustomValidity('');
}

/**
 * Toggles the visibility of the first password input field and updates its icon.
 */
function togglePassword1Visibility() {
  if (pw1Icon.classList.contains('eye-icon')) {
    if (passwordInput.type == 'password') {
      pw1Icon.src = '../img/icon/show.png';
      passwordInput.type = 'text';
    } else {
      pw1Icon.src = '../img/icon/hidden.png';
      passwordInput.type = 'password';
    }
  }
}

/**
 * Toggles the visibility of the first password input field and updates its icon.
 */
function togglePassword2Visibility() {
  if (pw2Icon.classList.contains('eye-icon')) {
    if (passwordConfirmInput.type == 'password') {
      pw2Icon.src = '../img/icon/show.png';
      passwordConfirmInput.type = 'text';
    } else {
      pw2Icon.src = '../img/icon/hidden.png';
      passwordConfirmInput.type = 'password';
    }
  }
}

/**
 * Handles input in the name field, running a validation function and clearing errors.
 * @param {Event} this - The input event object.
 */
function handleNameInput() {
  if (validateNameInput) {
    validateNameInput(this);
  }
  this.classList.remove('input-error');
  document.getElementById('name-warning').classList.add('d-none');
  this.setCustomValidity('');
}

/**
 * Cleans the email input field by removing invalid characters and resets its validation state.
 * @param {HTMLInputElement} input - The email input element.
 */
function validateEmailInput(input) {
  hideInputError(input);
  input.value = input.value.replace(/[^a-zA-Z0-9@._%+-]/g, '');
  clearInputError(input);
}

/**
 * Handles changes to the checkbox, removing the error class if it is checked.
 */
function handleCheckboxChange() {
  if (checkbox.checked) {
    checkbox.classList.remove('input-error');
  }
}

/**
 * Initiates the user registration process by first validating all fields.
 * @param {Event} event - The form submission event.
 */
function successRegister(event) {
  if (allFieldsFilledCorrect(event)) {
    checkUserOnRegistration(event);
  } else {
    checkAllFields();
  }
}

/**
 * Asynchronously checks if the email is already in use before adding a new user.
 * @param {Event} event - The form submission event.
 */
async function checkUserOnRegistration(event) {
  event.preventDefault();
  try {
    const emailExists = await checkEmailInBothDatabases();

    if (!emailExists) {
      await addUser();
    } else {
      showEmailAlreadyExistsError();
    }
  } catch (error) {}
}

/**
 * Asynchronously checks for an existing email and adds a new user if the email is unique.
 */
async function handleUserDataResponse(userDataObject) {
  const emailExists = await checkEmailInBothDatabases();

  if (!emailExists) {
    await addUser();
  } else {
    showEmailAlreadyExistsError();
  }
}

/**
 * Asynchronously checks for the existence of the entered email in two different databases.
 * @returns {Promise<boolean>} A promise that resolves to true if the email exists, otherwise false.
 */
async function checkEmailInBothDatabases() {
  try {
    const [loginResponse, userResponse] = await Promise.all([
      fetch(BASE_URL + '/login.json'),
      fetch(FIREBASE_URL_USERSDATA),
    ]);

    const emailExists = await checkEmails(loginResponse, userResponse);
    return emailExists;
  } catch (error) {
    return false;
  }
}

/**
 * Checks if a given email exists within the provided login and user data.
 * @param {Response} loginResponse - The response object for login data.
 * @param {Response} userResponse - The response object for user data.
 * @returns {Promise<boolean>} True if the email exists, otherwise false.
 */
async function checkEmails(loginResponse, userResponse) {
  if (loginResponse.ok) {
    const loginData = await loginResponse.json();
    if (loginData && CheckEmailExistsInData(loginData, 'email')) {
      return true;
    }
  }

  if (userResponse.ok) {
    const userData = await userResponse.json();
    if (userData && CheckEmailExistsInData(userData, 'email')) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if a specific email exists within a given data object.
 * @param {object} dataObject - The data object to search in.
 * @param {string} emailField - The key for the email field in the object.
 * @returns {boolean} True if the email exists, otherwise false.
 */
function CheckEmailExistsInData(dataObject, emailField) {
  const keys = Object.keys(dataObject);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const userObject = dataObject[key];
    const userEmail = userObject[emailField];
    const inputEmail = emailInput.value;
    if (userEmail === inputEmail) {
      return true;
    }
  }
  return false;
}

/**
 * Displays a specific error message and triggers a shake animation for the email input field.
 */
function showEmailAlreadyExistsError() {
  emailInput.classList.add('input-error');
  let emailWarning = document.getElementById('email-warning');
  emailWarning.textContent = 'This email address is already registered.';
  emailWarning.classList.remove('d-none');
  shakeInput(emailInput, 'This email address is already registered.');
}

/**
 * Asynchronously creates and saves new user data to the database.
 */
async function addUser() {
  let loginData = createLoginData();
  let userData = createUserData();

  try {
    let loginResponse = await saveLoginData(loginData);
    await saveToFirebase(userData);
    handleUserCreationResult(loginResponse);
  } catch (error) {}
}

/**
 * Creates a login data object from the current form input values.
 * @returns {object} The login data object.
 */
function createLoginData() {
  return {
    email: emailInput.value,
    password: passwordInput.value,
    name: nameInput.value,
  };
}

/**
 * Creates a full user data object with a random color and initials from the input values.
 * @returns {object} The user data object.
 */
function createUserData() {
  return {
    name: nameInput.value,
    email: emailInput.value,
    phone: '-',
    color: getRandomColor(),
    initials: getInitials(nameInput.value),
  };
}

/**
 * Asynchronously sends a POST request to save the login data.
 * @param {object} loginData - The data to be saved.
 * @returns {Promise<Response>} The fetch response object.
 */
async function saveLoginData(loginData) {
  return await fetch(BASE_URL + 'login.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginData),
  });
}

/**
 * Handles the result of user creation, redirecting on success.
 * @param {Response} loginResponse - The response from the server.
 */
function handleUserCreationResult(loginResponse) {
  if (loginResponse.ok) {
    showSuccessMessage();
    resetForm();
  }
}

/**
 * Resets the registration form and clears all validation errors.
 */
let resetForm = () => {
  document.getElementById('register-form').reset();
  nameInput.setCustomValidity('');
  emailInput.setCustomValidity('');
  passwordInput.setCustomValidity('');
  passwordConfirmInput.setCustomValidity('');
  setupEventListeners();
};

/**
 * Displays a success message and redirects the user to the login page after a short delay.
 */
function showSuccessMessage() {
  let successSection = document.getElementById('success-register-section');
  successSection.classList.remove('d-none');
  setTimeout(() => {
    window.location.href = '../../index.html';
  }, 1500);
}

/**
 * Checks if all form fields are filled correctly according to predefined validation rules.
 * @param {Event} event - The form submission event.
 * @returns {boolean} True if all fields are valid, otherwise false.
 */
function allFieldsFilledCorrect(event) {
  event.preventDefault();
  return (
    nameInput.value.length >= 3 &&
    /^[A-Za-zÄÖÜäöüß\s\-]+$/.test(nameInput.value) &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailInput.value) &&
    passwordInput.value.length >= 8 &&
    passwordConfirmInput.value === passwordInput.value &&
    checkbox.checked
  );
}

/**
 * Handles the form submission event, validating fields and showing a success message if valid.
 * @param {Event} event - The form submission event.
 */
function formSubmit(event) {
  event.preventDefault();
  if (allFieldsFilledCorrect()) {
    showSuccessMessage();
  } else {
    checkAllFields();
  }
}
