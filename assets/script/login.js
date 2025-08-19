const BASE_URL = 'https://authenticationprototyp-default-rtdb.europe-west1.firebasedatabase.app/';
let passwordInput;
let passwordValue;
let logo;
let headerLogo;

/**
 * change logo.png in case of window width
 */
function setLogoForWidth() {
  if (window.innerWidth <= 1180) {
    logo.src = 'assets/img/logo/logo_white.png';
  } else {
    logo.src = 'assets/img/logo/logo_dark.png';
  }
}

/**
 * animate start logo
 */
function animateLogo() {
  logo.classList.add('logo-zoom');
  setTimeout(() => {
    logo.classList.remove('logo-zoom');
    logo.src = 'assets/img/logo/logo_dark.png';
    headerLogo.classList.add('fade-out');
  }, 900);
}

/**
 * Initializes the page by getting and storing key HTML elements,
 * setting up event listeners, and running initial animations.
 */
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

/**
 * Updates the password icon based on input value and clears any validation errors.
 * It shows a 'lock' icon for an empty field and a 'hidden' icon when text is entered.
 */
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

/**
 * Toggles the visibility of the password input field and updates the icon.
 * It changes the input type between 'password' and 'text' and swaps the icon source accordingly.
 */
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

/**
 * Clears validation errors from an input element and its parent container.
 * @param {HTMLInputElement} input - The input element to be reset.
 */
function clearInputError(input) {
  input.setCustomValidity('');
  input.classList.remove('input-error');
  let parentDiv = input.closest('.addNewContactDiv');
  if (parentDiv) parentDiv.classList.remove('input-error');
}

function loginUser(event) {
  checkUser(event);
}

/**
 * Asynchronously validates user credentials against a remote JSON file.
 * This function prevents the default form submission, checks input validity,
 * and handles the authentication process.
 * @param {Event} event - The form submission event.
 */
async function checkUser(event) {
  event.preventDefault();
  let email = document.getElementById('email');
  let password = document.getElementById('password');
  if (!validateInputs(email, password)) return;

  try {
    let response = await fetch(BASE_URL + '/login' + '.json');
    if (response.ok) {
      const userDataObject = await response.json();
      if (userDataObject) {
        let findUser = authenticateUser(email, password, userDataObject);
        handleAuthResult(findUser, email, password);
      }
    }
  } catch (error) {}
}

/**
 * Validates the email and password input fields to ensure they are not empty.
 * @param {HTMLInputElement} email - The email input element.
 * @param {HTMLInputElement} password - The password input element.
 * @returns {boolean} True if both inputs are valid and not empty, otherwise false.
 */
function validateInputs(email, password) {
  let valid = true;
  if (!email.value || email.value.trim() === '') {
    shakeInput(email, 'Please check its is filled with a valid email');
    valid = false;
  }
  if (!password.value || password.value.trim() === '') {
    shakeInput(password, 'Please check its is filled with a valid password');
    valid = false;
  }
  return valid;
}

/**
 * Authenticates a user by comparing their email and password with provided user data.
 * If a match is found, it stores the user's full name and returns true.
 * @param {HTMLInputElement} email - The email input element.
 * @param {HTMLInputElement} password - The password input element.
 * @param {object} userDataObject - The object containing user data.
 * @returns {boolean} True if the user is authenticated, otherwise false.
 */
function authenticateUser(email, password, userDataObject) {
  const userKey = Object.keys(userDataObject);
  for (i = 0; i < userKey.length; i++) {
    const userID = userKey[i];
    const userObjekt = userDataObject[userID];
    if (email.value == userObjekt.email && password.value == userObjekt.password) {
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

/**
 * Handles the result of user authentication. On success, it redirects the user
 * to the summary page. On failure, it displays a login error message and resets the form.
 * @param {boolean} findUser - The result of the authentication attempt.
 * @param {HTMLInputElement} email - The email input element.
 * @param {HTMLInputElement} password - The password input element.
 */
function handleAuthResult(findUser, email, password) {
  if (findUser === true) {
    localStorage.setItem('showGreeting', 'true');
    window.location.href = '/assets/html/summery.html';
    resetForm();
  } else {
    document.getElementById('login-failed').classList.remove('d-none');
    resetForm();
    resetPwIcon();
    shakeInput(email, '');
    shakeInput(password, '');
  }
}

/**
 * Resets a form to its default values.
 */
let resetForm = () => document.getElementById('login-form').reset();

/**
 * Resets the password input field by changing its type to 'password', 
 * setting the icon back to a lock, and removing the 'eye-icon' class.
 */
let resetPwIcon = () => {
  passwordValue.src = './assets/img/icon/lock.png';
  passwordInput.type = 'password';
  passwordValue.classList.remove('eye-icon');
};

/**
 * Stores the announced user's data in local storage as a JSON string.
 *
 * @param {object} announcedUser - The user object to be stored.
 */
let storeAnnoncedUserName = (announcedUser) => {
  localStorage.setItem('announcedUser', JSON.stringify(announcedUser));
};

/**
 * Logs in a user as a guest by setting 'Guest Guest' as the current user in localStorage
 * and redirects to the summary page.
 */
function logginAsGuest() {
  let guestUser = 'Guest Guest';
  localStorage.setItem('announcedUser', JSON.stringify(guestUser));
  localStorage.setItem('showGreeting', 'true');
  window.location.href = 'assets/html/summery.html';
}

let PrivacyPolicy = '/assets/html/privacy-policy_external.html';
let LegalNotice = '/assets/html/legal-notice_external.html';

/**
 * Sets 'Guest Guest' as the current user in localStorage and redirects to the privacy policy page.
 */
function privacyPolicyMPA() {
  let guestUser = 'Guest Guest';
  console.log(guestUser);
  localStorage.setItem('announcedUser', JSON.stringify(guestUser));
  console.log(JSON.parse(localStorage.getItem('announcedUser')));
  window.location.href = PrivacyPolicy;
}

/**
 * Sets 'Guest Guest' as the current user in localStorage and redirects to the legal notice page.
 */
function legalNoticeMPA() {
  let guestUser = 'Guest Guest';
  console.log(guestUser);
  localStorage.setItem('announcedUser', JSON.stringify(guestUser));
  console.log(JSON.parse(localStorage.getItem('announcedUser')));
  window.location.href = LegalNotice;
}
