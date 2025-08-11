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

function setupEventListeners() {
  passwordInput.addEventListener('input', handlePasswordInput);
  passwordConfirmInput.addEventListener('input', handlePasswordConfirmInput);
  pw1Icon.addEventListener('click', togglePassword1Visibility);
  pw2Icon.addEventListener('click', togglePassword2Visibility);
  nameInput.addEventListener('input', handleNameInput);
  emailInput.addEventListener('input', handleEmailInput);
  checkbox.addEventListener('change', handleCheckboxChange);
}

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

function handleNameInput() {
  if (validateNameInput) {
    validateNameInput(this);
  }
  this.classList.remove('input-error');
  document.getElementById('name-warning').classList.add('d-none');
  this.setCustomValidity('');
}

function handleEmailInput() {
  if (validateEmailInput) {
    validateEmailInput(this);
  }
  this.classList.remove('input-error');
  document.getElementById('email-warning').classList.add('d-none');
  this.setCustomValidity('');
}

function handleCheckboxChange() {
  if (checkbox.checked) {
    checkbox.classList.remove('input-error');
  }
}

function successRegister(event) {
  if (allFieldsFilledCorrect(event)) {
    checkUserOnRegistration(event);
  } else {
    checkAllFields();
  }
}

async function checkUserOnRegistration(event) {
  event.preventDefault();
  try {
    const emailExists = await checkEmailInBothDatabases();

    if (!emailExists) {
      await addUser();
    } else {
      showEmailAlreadyExistsError();
    }
  } catch (error) {
    console.error('Fehler bei der Benutzerregistrierung:', error);
  }
}

async function handleUserDataResponse(userDataObject) {
  const emailExists = await checkEmailInBothDatabases();

  if (!emailExists) {
    await addUser();
  } else {
    showEmailAlreadyExistsError();
  }
}

async function checkEmailInBothDatabases() {
  try {
    const [loginResponse, userResponse] = await Promise.all([
      fetch(BASE_URL + '/login.json'),
      fetch(FIREBASE_URL_USERSDATA),
    ]);

    const emailExists = await checkEmails(loginResponse, userResponse);
    return emailExists;
  } catch (error) {
    console.error('Fehler bei der E-Mail-Überprüfung:', error);
    return false;
  }
}

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

function showEmailAlreadyExistsError() {
  emailInput.classList.add('input-error');
  let emailWarning = document.getElementById('email-warning');
  emailWarning.textContent = 'This email address is already registered.';
  emailWarning.classList.remove('d-none');
  shakeInput(emailInput, 'This email address is already registered.');
}

async function addUser() {
  let loginData = createLoginData();
  let userData = createUserData();

  try {
    let loginResponse = await saveLoginData(loginData);
    await saveToFirebase(userData);
    handleUserCreationResult(loginResponse);
  } catch (error) {}
}

function createLoginData() {
  return {
    email: emailInput.value,
    password: passwordInput.value,
    name: nameInput.value,
  };
}

function createUserData() {
  return {
    name: nameInput.value,
    email: emailInput.value,
    phone: '-',
    color: getRandomColor(),
    initials: getInitials(nameInput.value),
  };
}

async function saveLoginData(loginData) {
  return await fetch(BASE_URL + 'login.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginData),
  });
}

function handleUserCreationResult(loginResponse) {
  if (loginResponse.ok) {
    showSuccessMessage();
    resetForm();
  }
}

let resetForm = () => {
  document.getElementById('register-form').reset();
  nameInput.setCustomValidity('');
  emailInput.setCustomValidity('');
  passwordInput.setCustomValidity('');
  passwordConfirmInput.setCustomValidity('');
  setupEventListeners();
};

function showSuccessMessage() {
  let successSection = document.getElementById('success-register-section');
  successSection.classList.remove('d-none');
  setTimeout(() => {
    window.location.href = '../../index.html';
  }, 1500);
}

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

function formSubmit(event) {
  event.preventDefault();
  if (allFieldsFilledCorrect()) {
    showSuccessMessage();
  } else {
    checkAllFields();
  }
}

function checkAllFields() {
  checkName();
  checkEmail();
  checkPassword();
  checkPasswordConfirm();
  checkCheckbox();
}

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

function checkCheckbox() {
  if (!checkbox.checked) {
    checkbox.classList.add('input-error');
  } else {
    checkbox.classList.remove('input-error');
  }
}
