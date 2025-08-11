let currentSelectedIndex = null;

async function initContacts() {
  //ok
  await loadContacts();
  renderContacts();
  initFrameworkFunctions();
}

function getInitials(name) {
  // ok
  if (!name) return '??';
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
}

function renderContacts() {
  //zu lang
  let contentRef = document.getElementById('contactContent');
  if (!contentRef) return;

  let groupedContacts = groupContactsByInitial(contacts);
  let html = '';
  let initials = Object.keys(groupedContacts).sort();

  for (let index = 0; index < initials.length; index++) {
    let initial = initials[index];
    html += ` <div class="agenda">
                <div class="agenda-category"><p>${initial}</p></div>
                <div class="agenda-line"></div>
              </div>`;
    for (let i = 0; i < groupedContacts[initial].length; i++) {
      let contactIndex = groupedContacts[initial][i];
      html += getNoteTemplateContact(contactIndex);
    }
  }
  contentRef.innerHTML = html;
}

function groupContactsByInitial(contacts) {
  //zu lang
  let groups = {};
  for (let i = 0; i < contacts.length; i++) {
    let name = contacts[i].name || '';
    let initial = name.charAt(0).toUpperCase();
    if (!groups[initial]) groups[initial] = [];
    groups[initial].push(i);
  }
  let sortedGroups = {};
  Object.keys(groups)
    .sort()
    .forEach((key) => {
      sortedGroups[key] = groups[key];
    });
  return sortedGroups;
}

function changeContactColorIfSelected(index, isSelected) {
  let openDetails = document.querySelector(`[onclick*="openDetails(${index})"]`);
  if (openDetails) {
    if(window.innerWidth >= 1440){
        if (isSelected) {
        openDetails.classList.add('active');
      } else {
        openDetails.classList.remove('active');
      }
    }
  }
}

function openDetails(index) {
  //ok
  let allContacts = document.querySelectorAll('.person');
  let details = document.getElementById('contactDetails');
  if (currentSelectedIndex === index) {
    closeContactDetails(allContacts, details);
    return;
  }
  allContacts.forEach((contact) => contact.classList.remove('active'));
  details.classList.remove('show');
  details.classList.add('hide');
  currentSelectedIndex = index;
  setanimation(details, index);
}

function showMobileEditOverlay(indexDetails) {
  //ok
  let overlayRef = document.getElementById('editContact-Overlay');
  let overlayBtn = document.getElementById('showOverlayBtn');
  overlayBtn.classList.toggle('d-none');
  overlayRef.classList.toggle('d-none');
  overlayRef.innerHTML = getNoteTemplateMobileEditOverlay(indexDetails);
}

function closeContactDetails(allContacts, details) {
  //ok
  allContacts.forEach((contact) => contact.classList.remove('active'));
  details.classList.remove('show');
  details.classList.add('hide');
  setTimeout(() => {
    details.innerHTML = '';
  }, 300);
  currentSelectedIndex = null;
}

function setanimation(details, index) {
  //ok
  setTimeout(() => {
    details.innerHTML = getNoteTemplateContactDetails(index);
    details.classList.remove('hide');
    setTimeout(() => {
      details.classList.add('show');
      setTimeout(() => {
        changeContactColorIfSelected(index, true);
      }, 300);
    }, 10);
  }, 20);
}

function toggleContactOverlay() {
  //ok
  let overlayRef = document.getElementById('add-new-contact');
  if (overlayRef.classList.contains('d-none')) {
    overlayRef.classList.remove('d-none');
    overlayRef.innerHTML = getNoteTemplateAddNewContact();
  } else {
    overlayRef.classList.add('d-none');
    overlayRef.innerHTML = '';
  }
}

async function saveToFirebase(contact) {
  // zu lang
  try {
    let url = `https://join-tasks-4a707-default-rtdb.europe-west1.firebasedatabase.app/users.json`;
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contact),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    try {
      await loadContacts();
      renderContacts();
      closeOverlay();
    } catch (error) {}
  } catch (error) {
    console.error(error);
  }
}

function getRandomColor() {
  //ok
  return (
    '#' +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')
  );
}

function closeOverlay() {
  //ok
  let overlayRef = document.getElementById('add-new-contact');
  let contentOverlayRef = document.getElementById('edit-contact');
  if (overlayRef) {
    overlayRef.classList.add('d-none');
    overlayRef.innerHTML = '';
  }
  if (contentOverlayRef) {
    contentOverlayRef.classList.add('d-none');
    contentOverlayRef.innerHTML = '';
  }
}

function closeDetails() {
  //ok
  let contentCloseDetails = document.getElementById('namesDetails');
  let overlayBtn = document.getElementById('showOverlayBtn');
  if (contentCloseDetails) {
    overlayBtn.classList.toggle('d-none');
    contentCloseDetails.classList.add('d-none');
    contentCloseDetails.innerHTML = '';
  }
  if (window.innerWidth < 1440) {
    document.querySelectorAll('.active').forEach(function(element) {
      element.classList.remove('active');
    });
  }
}

async function deleteContact(index) {
  //zu lang
  let firebaseId = contacts[index].id;
  if (!firebaseId) {
    console.error('Firebase-ID nicht gefunden für Index:', index);
    return false;
  }

  let url = BASE_URL_TASKS_AND_USERS + 'users/' + firebaseId + '.json';
  let response = await fetch(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    return false;
  }

  await loadContacts();
  renderContacts();
  closeOverlay();
  document.getElementById('contactDetails').innerHTML = '';
  return true;
}

async function updateContact(index) {
  // zu lang
  let userName = document.getElementById('editContactName').value.trim();
  let userEmail = document.getElementById('editContactMail').value.trim();
  let userPhone = document.getElementById('editContactPhone').value.trim();

  if (!checkContactInputs(userName, userEmail, userPhone)) {
    return;
  }

  if (!userPhone) {
    userPhone = '-';
  }

  let updatedContact = {
    name: userName,
    email: userEmail,
    phone: userPhone,
    color: contacts[index].color,
    initials: getInitials(userName),
  };

  let firebaseId = contacts[index].id;
  let url = BASE_URL_TASKS_AND_USERS + 'users/' + firebaseId + '.json';
  let response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedContact),
  });

  if (!response.ok) {
    console.error('Fehler beim Updaten:', response.status);
    return;
  }

  await loadContacts();
  renderContacts();
  openDetails(index);
  closeOverlay();
}

async function saveToLocalstorage() {
  // zu lang
  let userName = document.getElementById('newContactName').value;
  let userEmail = document.getElementById('newContactMail').value;
  let userPhone = document.getElementById('newContactPhone').value;

  if (!checkContactInputs(userName, userEmail, userPhone)) {
    return;
  }

  let newContact = {
    name: userName,
    email: userEmail,
    phone: userPhone,
    color: getRandomColor(),
    initials: getInitials(userName),
  };
  await saveToFirebase(newContact);
}

function openEditOverlay(index) {
  // zu lang
  let contentOverlayRef = document.getElementById('edit-contact');
  contentOverlayRef.classList.remove('d-none');
  contentOverlayRef.innerHTML = getNoteTemplateEditContact(index);
}

function checkContactInputs(userName, userEmail, userPhone) {
  let nameInput = document.getElementById('editContactName') || document.getElementById('newContactName');
  let mailInput = document.getElementById('editContactMail') || document.getElementById('newContactMail');

  let valid = true;

  if (!userName || userName.trim().length < 2) {
    shakeInput(nameInput, 'Please check its is filled with a name');
    valid = false;
  }

  if (!userEmail || !/^.+@.+\.[a-zA-Z]{2,4}$/.test(userEmail)) {
    shakeInput(mailInput, 'Please check its is filled with a valid email');
    valid = false;
  }

  if (!userPhone || userPhone.trim() === '') {
    userPhone = '-';
  }

  return valid;
}

function validatePhoneInput(input) {
  //zu lang
  let value = input.value.replace(/[^+\d]/g, '');
  value = value.replace(/(?!^)\+/g, '');

  if (value.length > 0 && value[0] !== '0' && value[0] !== '+') {
    value = value.slice(1);
  }

  if (value.startsWith('0')) {
    value = '+49 ' + value.slice(1);
  }

  let prefix = value.slice(0, 3);
  let rest = value.slice(3).replace(/^\s*/, '');

  let firstBlock = rest.slice(0, 3);
  let secondBlock = rest.slice(3);

  let formatted = prefix;
  if (rest.length > 0) formatted += ' ' + firstBlock;
  if (secondBlock.length > 0) formatted += ' ' + secondBlock;
  formatted = formatted.slice(0, 17);

  input.value = formatted;
  clearInputError(input);
}

