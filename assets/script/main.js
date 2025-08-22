let contacts = [];
let selectedContacts = [];
let lastValidDate = '';
let lastDateLength = 0;
let BASE_URL_TASKS_AND_USERS = 'https://join-tasks-4a707-default-rtdb.europe-west1.firebasedatabase.app/';

/**
 * Asynchronously fetches a list of users from a specified URL,
 * processes the data, and populates the global 'contacts' array.
 */
async function loadContacts() {
  let response = await fetch(BASE_URL_TASKS_AND_USERS + 'users.json');
  let data = await response.json();
  contacts = [];
  if (data) {
    let keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      let id = keys[i];
      let user = data[id];
      storeContact(id,user);
    }
  }
}

/**
 * Stores a new contact by creating a contact object and adding it to the contacts array.
 *
 * @param {number|string} id - The unique ID for the new contact.
 * @param {object} user - The user object containing contact information.
 * @param {string} user.name - The full name of the contact.
 * @param {string} user.initials - The initials of the contact's name.
 * @param {string} user.email - The contact's email address.
 * @param {string} user.phone - The contact's phone number.
 * @param {string} user.color - The assigned color for the contact.
 * @returns {void}
 */
function storeContact(id,user){
  contacts.push({
        id: id,
        name: user.name,
        initials: user.initials,
        email: user.email,
        phone: user.phone,
        color: user.color,
      });
}

function initFrameworkFunctions() {
  displayUserInitials();
}

/**
 * Retrieves user initials from localStorage and displays them in the 'userInitials' element.
 * It handles both standard users and guests, and redirects to the login page on unauthorized access.
 */
function displayUserInitials() {
  try {
    let userInitials = document.getElementById('userInitials');
    let userName = JSON.parse(localStorage.getItem('announcedUser'));
    if (userName !== 'Guest Guest') {
      let firstinitial = userName.slice(0, 1);
      let searchposition = userName.search(' ');
      let secondinitial = userName.slice(searchposition + 1, searchposition + 2);
      let initials = firstinitial.concat(secondinitial);
      userInitials.innerText = initials;
    } else {
      userInitials.innerText = 'G';
    }
  } catch (error) {
    secureLogin(error);
}

/**
 * Handles a specific login error by redirecting the user, otherwise re-throws the error.
 *
 * @param {Error} error - The error object to be checked.
 * @returns {void}
 * @throws {Error} Throws the original error if it does not match the specific TypeError.
 */
function secureLogin(error){
  if (error instanceof TypeError && error.message.includes("Cannot read properties of null (reading 'slice')")) {
      redirectLogin();
    } else {
      throw error;
    }
  }
}
/**load Help.html */
let loadHelp = () => {
  window.location.href = '/assets/html/help.html';
};

/**Timeout funktion after 2s  */
function redirectLogin() {
  let timeout;
  timeout = setTimeout((window.location.href = '/index.html'), 2000);
}

/**toggle Overlay */
function toggleLogOutOverlay() {
  let logOutRef = document.getElementById('overlay-logout');
  let menuContent = document.getElementById('logout-overlay-content');
  logOutRef.classList.toggle('d-none');
  if (!menuContent.classList.contains('d-none')) {
    menuContent.innerHTML = getLogOutMenu();
  }
}
/**
 * Delete local Storage before the logged-in user is logged out
 * @param {a Tag} event
 */
function handleLogOut(event) {
  event.preventDefault();
  resetAnnouncedUserStorage();
  localStorage.removeItem('showGreeting');
  window.location.href = '/index.html';
}

/**
 * Resets the announced user by removing their data from local storage.
 */
let resetAnnouncedUserStorage = () => {
  localStorage.removeItem('announcedUser');
};

/**
 * Triggers a visual "shaking" and error state for a given input element.
 * This function adds CSS classes to an input and its closest parent container to indicate an error.
 * It also uses browser's built-in validation reporting to display a custom error message.
 * The "shaking" animation is removed after 300ms.
 * @param {HTMLElement} input
 */
function shakeInput(input) {
  input.classList.add('shake');
  input.classList.add('input-error');
  let parentDiv = input.closest('.addNewContactDiv');
  if (parentDiv) parentDiv.classList.add('input-error');
  setTimeout(() => {
    input.classList.remove('shake');
  }, 300);
}

/**
 * lears any validation error states from a given input element and its parent container.
 * @param {HTMLElement} input
 */
function clearInputError(input) {
  input.classList.remove('input-error');
  let parentDiv = input.closest('.addNewContactDiv');
  if (parentDiv) parentDiv.classList.remove('input-error');
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
 * Validates and formats a name input by cleaning, capitalizing, and limiting the number of words.
 * This function removes invalid characters, replaces multiple spaces with a single space,
 * trims the input, and capitalizes the first letter of each word. It also limits the
 * input to a maximum of three words and cleans up any trailing spaces.
 * @param {HTMLElement} input
 */
function validateNameInput(input) {
  if (input.value.endsWith(' ')) {
    clearInputError(input);
    return;
  }
  let cleaned = input.value
    .replace(/[^a-zA-ZäöüÄÖÜß\- ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  let words = cleaned.split(' ').slice(0, 3);
  let capitalized = [];
  for (let i = 0; i < words.length; i++) {
    let word = words[i];
    if (word.length > 0) {
      capitalized.push(word.charAt(0).toUpperCase() + word.slice(1));
    }
  }
  input.value = capitalized.join(' ');
  clearInputError(input);
}

/**
 * Stops the propagation (bubbling) of a given event to parent elements.
 *
 * @param {Event} event - The event object.
 */
function eventBubbling(event) {
  event.stopPropagation();
}

/**
 * Sets today's date in the date input field when the user clicks the date icon.
 * This function is simple and easy to understand for beginners.
 */
function setTodaysDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todaysDate = `${day}/${month}/${year}`;
  setDateInputValue(todaysDate);
}