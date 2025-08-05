const BASE_URL = 'https://authenticationprototyp-default-rtdb.europe-west1.firebasedatabase.app/';
let passwordInput;
let passwordValue;
let logo;
let headerLogo;
//let announcedUserStorage = [];

function setLogoForWidth() {
  if (window.innerWidth <= 1180) {
    logo.src = 'assets/img/logo/logo_white.png';
  } else {
    logo.src = 'assets/img/logo/logo_dark.png';
  }
}

function animateLogo() {
  logo.classList.add('logo-zoom');
  setTimeout(() => {
    logo.classList.remove('logo-zoom');
    logo.src = 'assets/img/logo/logo_dark.png';
    headerLogo.classList.add('fade-out');
  }, 900);
}

function init() {
  logo = document.getElementById('start-logo');
  headerLogo = document.querySelector('.main-header-logo');
  passwordInput = document.getElementById('password');
  passwordValue = document.getElementById('password-icon');
  
  logo.classList.remove('preload');
  setLogoForWidth();
  animateLogo();
  
  passwordInput.addEventListener('input', handlePasswordInput);
  document.getElementById('email').addEventListener('input', handleEmailInput);
  passwordValue.addEventListener('click', togglePasswordVisibility);
}

function handlePasswordInput() {
  let inputValue = this.value.trim();
  if (inputValue === '') {
    passwordValue.src = './assets/img/icon/lock.png';
    passwordValue.classList.remove('eye-icon');
  } else {
    passwordValue.src = './assets/img/icon/hidden.png';
    passwordValue.classList.add('eye-icon');
  }
  clearInputError(this);
}

function handleEmailInput() {
  clearInputError(this);
}

function togglePasswordVisibility() {
  if (passwordValue.classList.contains('eye-icon')) {
    if (passwordInput.type == 'password') {
      passwordValue.src = './assets/img/icon/show.png';
      passwordInput.type = 'text';
    } else {
      passwordValue.src = './assets/img/icon/hidden.png';
      passwordInput.type = 'password';
    }
  }
}

function clearInputError(input) {
  input.setCustomValidity('');
  input.classList.remove('input-error');
  let parentDiv = input.closest('.addNewContactDiv');
  if (parentDiv) parentDiv.classList.remove('input-error');
}


function loginUser(event) {
  checkUser(event);
}

async function checkUser(event) {
  event.preventDefault();
  let mail = document.getElementById('email');
  let password = document.getElementById('password');
  if (!validateInputs(mail, password)) return;
  
  try {
    let response = await fetch(BASE_URL + '/login' + '.json');
    if (response.ok) {
      const userDataObject = await response.json();
      if (userDataObject) {
        let findUser = authenticateUser(mail, password, userDataObject);
        handleAuthResult(findUser, mail, password);
      }
    }
  } catch (error) {}
}

function validateInputs(mail, password) {
  let valid = true;
  if (!mail.value || mail.value.trim() === '') {
    shakeInput(mail);
    valid = false;
  }
  if (!password.value || password.value.trim() === '') {
    shakeInput(password);
    valid = false;
  }
  return valid;
}

function authenticateUser(mail, password, userDataObject) {
  const userKey = Object.keys(userDataObject);
  for (i = 0; i < userKey.length; i++) {
    const userID = userKey[i];
    const userObjekt = userDataObject[userID];
    if (mail.value == userObjekt.mail && password.value == userObjekt.password) {
      let announcedUser = userObjekt.name;
      if (userObjekt.surname && userObjekt.surname.trim() !== '') {
        announcedUser += ' ' + userObjekt.surname;
      }
      storeAnnoncedUserName(announcedUser);
      return true;
    }
  }
  return false;
}

function handleAuthResult(findUser, mail, password) {
  if (findUser === true) {
    localStorage.setItem('showGreeting', 'true');
    window.location.href = '/assets/html/summery.html';
    resetForm();
  } else {
    document.getElementById('login-failed').classList.remove('d-none');
    resetForm();
    resetPwIcon();
    shakeInput(mail);
    shakeInput(password);
  }
}

function shakeInput(input, message) {
  input.classList.add('shake', 'input-error');
  input.setCustomValidity(message);
  input.reportValidity();
  setTimeout(() => {
    input.classList.remove('shake');
    input.setCustomValidity('');
  }, 300);
}

let resetForm = () => document.getElementById('login-form').reset();

let resetPwIcon = () => {
  passwordValue.src = './assets/img/icon/lock.png';
  passwordInput.type = 'password';
  passwordValue.classList.remove('eye-icon');
};

let storeAnnoncedUserName = (announcedUser) => {
  localStorage.setItem('announcedUser', JSON.stringify(announcedUser));
};

function logginAsGuest() {
  let guestUser = 'Guest Guest';
  localStorage.setItem('announcedUser', JSON.stringify(guestUser));
  localStorage.setItem('showGreeting', 'true');
  window.location.href = 'assets/html/summery.html';
}

let PrivacyPolicy = '/assets/html/privacy-policy_external.html';
let LegalNotice = '/assets/html/legal-notice_external.html';

function privacyPolicyMPA() {
  let guestUser = 'Guest Guest';
  console.log(guestUser);
  localStorage.setItem('announcedUser', JSON.stringify(guestUser));
  console.log(JSON.parse(localStorage.getItem('announcedUser')));
  window.location.href = PrivacyPolicy;
}

function legalNoticeMPA() {
  let guestUser = 'Guest Guest';
  console.log(guestUser);
  localStorage.setItem('announcedUser', JSON.stringify(guestUser));
  console.log(JSON.parse(localStorage.getItem('announcedUser')));
  window.location.href = LegalNotice;
}
