let contacts = [];
let selectedContacts = [];
let lastValidDate = '';
let lastDateLength = 0;
let BASE_URL_TASKS_AND_USERS = 'https://join-tasks-4a707-default-rtdb.europe-west1.firebasedatabase.app/';

async function loadContacts() {
  let response = await fetch(BASE_URL_TASKS_AND_USERS + 'users.json');
  let data = await response.json();
  contacts = [];
  if (data) {
    let keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      let id = keys[i];
      let user = data[id];
      contacts.push({
        id: id,
        name: user.name,
        initials: user.initials,
        email: user.email,
        phone: user.phone,
        color: user.color,
      });
    }
  }
}

function initFrameworkFunctions() {
  displayUserInitials();
}

function displayUserInitials() {
  // Sehr Fehleranfällig !!!
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
    if (error instanceof TypeError && error.message.includes("Cannot read properties of null (reading 'slice')")) {
      console.warn('Unautorisierter Zugriff oder fehlende Nutzerdaten erfasst. Leite zum Login um');
      redirectLogin();
    } else {
      throw error;
    }
  }
}

let loadHelp = () => {
  window.location.href = '/assets/html/help.html';
};

function redirectLogin() {
  let timeout;
  timeout = setTimeout((window.location.href = '/index.html'), 2000);
}

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

let resetAnnouncedUserStorage = () => {
  localStorage.removeItem('announcedUser');
};

function shakeInput(input, message) {
  input.classList.add('shake');
  input.classList.add('input-error');
  input.setCustomValidity(message);
  input.reportValidity();
  let parentDiv = input.closest('.addNewContactDiv');
  if (parentDiv) parentDiv.classList.add('input-error');
  setTimeout(() => {
    input.classList.remove('shake');
  }, 300);
}

function clearInputError(input) {
  input.setCustomValidity('');
  input.classList.remove('input-error');
  let parentDiv = input.closest('.addNewContactDiv');
  if (parentDiv) parentDiv.classList.remove('input-error');
}

function eventBubbling(event) {
  event.stopPropagation();
}
