/**
 * Saves newly created contacts in Firebase
 */
async function saveToFirebase(contact) {
  try {
    let success = await uploadContactToFirebase(contact);
    if (success) {
      await refreshContactsAfterSave();
    }
  } catch (error) {
    console.error(error);
  }
}

/**
 * Uploads contact data to Firebase
 */
async function uploadContactToFirebase(contact) {
  let response = await makeFirebasePostRequest(contact);
  validateFirebaseResponse(response);
  return true;
}

/**
 * Makes POST request to Firebase
 */
async function makeFirebasePostRequest(contact) {
  let url = `https://join-tasks-4a707-default-rtdb.europe-west1.firebasedatabase.app/users.json`;
  return await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contact),
  });
}

/**
 * Validates Firebase response and throws error if needed
 */
function validateFirebaseResponse(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}

/**
 * Refreshes contacts list and UI after successful save
 */
async function refreshContactsAfterSave() {
  try {
    await loadContacts();
    renderContacts();
    closeOverlay();
    toggleSuccessfullOverlay();
  } catch (error) {}
}

/**
 * Permanently deletes the contact from both the directory and Firebase.
 */
async function deleteContact(index) {
  let firebaseId = contacts[index].id;
  if (!validateFirebaseId(firebaseId, index)) {
    return false;
  }

  let success = await deleteContactFromFirebase(firebaseId);
  if (success) {
    await refreshUIAfterDelete();
  }
  return success;
}

/**
 * Validates Firebase ID exists for contact
 */
function validateFirebaseId(firebaseId, index) {
  if (!firebaseId) {
    console.error('Firebase-ID nicht gefunden für Index:', index);
    return false;
  }
  return true;
}

/**
 * Deletes contact from Firebase database
 */
async function deleteContactFromFirebase(firebaseId) {
  let url = BASE_URL_TASKS_AND_USERS + 'users/' + firebaseId + '.json';
  let response = await fetch(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    return false;
  }
  return true;
}

/**
 * Refreshes UI after successful contact deletion
 */
async function refreshUIAfterDelete() {
  await loadContacts();
  renderContacts();
  closeOverlay();
  document.getElementById('contactDetails').innerHTML = '';
}

/**
 * Existing contacts are modified here and uploaded to Firebase
 */
async function updateContact(index) {
  let contactData = getEditContactInputs();
  let firebaseId = contacts[index].id;

  if (!(await checkContactInputs(contactData.userName, contactData.userEmail, contactData.userPhone, firebaseId))) {
    return;
  }

  let success = await processContactUpdate(contactData, index, firebaseId);
  if (success) {
    await finalizeContactUpdate(index);
  }
}

/**
 * Processes the contact update operation
 */
async function processContactUpdate(contactData, index, firebaseId) {
  let updatedContact = createUpdatedContactObject(contactData, index);
  return await uploadUpdatedContact(updatedContact, firebaseId);
}

/**
 * Finalizes contact update by refreshing display
 */
async function finalizeContactUpdate(index) {
  await updateContactDisplay(index);
  closeOverlay();
}

/**
 * Gets input values from edit contact form
 */
function getEditContactInputs() {
  let userName = document.getElementById('editContactName').value.trim();
  let userEmail = document.getElementById('editContactMail').value.trim();
  let userPhone = document.getElementById('editContactPhone').value.trim();
  
  if (!userPhone) {
    userPhone = '-';
  }
  
  return { userName, userEmail, userPhone };
}

/**
 * Creates updated contact object with new data
 */
function createUpdatedContactObject(contactData, index) {
  return {
    name: contactData.userName,
    email: contactData.userEmail,
    phone: contactData.userPhone,
    color: contacts[index].color,
    initials: getInitials(contactData.userName),
  };
}

/**
 * Uploads updated contact to Firebase
 */
async function uploadUpdatedContact(updatedContact, firebaseId) {
  let response = await makeFirebasePutRequest(updatedContact, firebaseId);
  return handleUpdateResponse(response);
}

/**
 * Makes PUT request to Firebase for contact update
 */
async function makeFirebasePutRequest(updatedContact, firebaseId) {
  let url = BASE_URL_TASKS_AND_USERS + 'users/' + firebaseId + '.json';
  return await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedContact),
  });
}

/**
 * Handles response from Firebase update request
 */
function handleUpdateResponse(response) {
  if (!response.ok) {
    console.error('Fehler beim Updaten:', response.status);
    return false;
  }
  return true;
}

/**
 * Updates contact display after successful edit
 */
async function updateContactDisplay(index) {
  await loadContacts();
  updateContactInList(index);
  updateContactDetails(index);
}

/**
 * Updates contact in the contact list
 */
function updateContactInList(index) {
  let contactElement = document.querySelector(`.person[onclick*="openDetails(${index})"]`);
  if (contactElement) {
    contactElement.outerHTML = getNoteTemplateContact(index);
    let newContactElement = document.querySelector(`.person[onclick*="openDetails(${index})"]`);
    if (newContactElement) {
      changeContactColorIfSelected(index, true);
    }
  }
}

/**
 * Updates contact details view
 */
function updateContactDetails(index) {
  let detailsElement = document.getElementById('contactDetails');
  if (detailsElement) {
    detailsElement.innerHTML = getNoteTemplateContactDetails(index);
  }
}

/**
 * Stores created contact data in local storage and forwards it to Firebase.
 */
async function saveToLocalstorage() {
  let contactInputs = getNewContactInputs();
  
  if (!(await checkContactInputs(contactInputs.userName, contactInputs.userEmail, contactInputs.userPhone))) {
    return;
  }
  
  let newContact = createNewContactObject(contactInputs);
  await saveToFirebase(newContact);
}

/**
 * Gets input values from new contact form
 */
function getNewContactInputs() {
  let userName = document.getElementById('newContactName').value;
  let userEmail = document.getElementById('newContactMail').value;
  let userPhone = document.getElementById('newContactPhone').value;
  return { userName, userEmail, userPhone };
}

/**
 * Creates new contact object from input data
 */
function createNewContactObject(contactInputs) {
  return {
    name: contactInputs.userName,
    email: contactInputs.userEmail,
    phone: contactInputs.userPhone,
    color: getRandomColor(),
    initials: getInitials(contactInputs.userName),
  };
}

/**
 * Checks if an email address is already taken by another contact
 */
async function isEmailTaken(email, currentContactId = null) {
  let url = BASE_URL_TASKS_AND_USERS + 'users.json';
  let response = await fetch(url);
  let users = await response.json();

  for (let key in users) {
    if (users[key].email === email && key !== currentContactId) {
      return true;
    }
  }

  return false;
}