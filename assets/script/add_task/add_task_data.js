/**
 * Builds a task data object from form inputs.
 * @returns {Promise<object>} The complete task data object.
 */
async function buildTaskData() {
  let status = getTaskStatus();
  return {
    addTaskId: await getNextTaskId(),
    title: getInputValue('title'),
    description: getInputValue('description'),
    date: getInputValue('date'),
    category: getCategoryText(),
    subtasks: getSubtasks(),
    assignedTo: getAssignedTo(),
    priority: getPriority(),
    status: status,
    sequence: await getNextSequence(status),
  };
}


/**
 * Posts task data to the server.
 * @param {object} taskData - The task data to be saved.
 * @returns {Promise<void>}
 */
async function postTaskToServer(taskData) {
  await fetch(BASE_URL_TASKS_AND_USERS + 'tasks.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
}


/**
 * Saves a new task to Firebase.
 * @returns {Promise<void>}
 */
async function saveTaskToFirebase() {
  let taskData = await buildTaskData();
  await postTaskToServer(taskData);
}


/**
 * Gets the next available task ID.
 * @returns {Promise<number>} The next available ID.
 */
async function getNextTaskId() {
  let response = await fetch(BASE_URL_TASKS_AND_USERS + 'tasks.json');
  let tasks = await response.json();
  let usedIds = [];
  if (tasks) {
    Object.values(tasks).forEach((task) => {
      if (task.addTaskId != null) usedIds.push(task.addTaskId);
    });
  }
  for (let i = 0; i <= usedIds.length; i++) {
    if (!usedIds.includes(i)) return i;
  }
  return usedIds.length;
}


/**
 * Gets the next sequence number for a given status.
 * @param {string} status - The task status.
 * @returns {Promise<number>} The next available sequence number.
 */
async function getNextSequence(status = 'todo') {
  let sequence = 0;
  let response = await fetch(BASE_URL_TASKS_AND_USERS + 'tasks.json');
  let tasks = await response.json();
  if (tasks) {
    Object.values(tasks).forEach((task) => {
      if (task.sequence != null && task.status === status && task.sequence >= sequence) {
        sequence = task.sequence + 1;
      }
    });
  }
  return sequence;
}


/**
 * Gets the next sequence number for a given status.
 * @param {string} status - The task status.
 * @returns {Promise<number>} The next available sequence number.
 */
function getTaskStatus() {
  if (window.currentTaskStatus) {
    return window.currentTaskStatus;
  }
  let urlParams = new URLSearchParams(window.location.search);
  let statusFromUrl = urlParams.get('status');
  if (statusFromUrl) {
    return statusFromUrl;
  }
  return 'todo';
}


/**
 * Gets the trimmed value of an input element by ID.
 * @param {string} id - The element ID.
 * @returns {string} The input value.
 */
function getInputValue(id) {
  let inputRef = document.getElementById(id);
  return inputRef ? inputRef.value.trim() : '';
}


/**
 * Gets the selected category text.
 * @returns {string} The category text.
 */
function getCategoryText() {
  let categoryDropdownSelectedRef = document.getElementById('category-dropdown-selected');
  let categoryTextRef = categoryDropdownSelectedRef ? categoryDropdownSelectedRef.querySelector('p') : null;
  return categoryTextRef ? categoryTextRef.textContent.trim() : '';
}


/**
 * Gets an array of subtask objects from the form.
 * @returns {Array<object>} An array of subtasks.
 */
function getSubtasks() {
  let subtaskItemRefs = document.querySelectorAll('.subtask-item');
  return Array.from(subtaskItemRefs).map((subtaskItemRef) => {
    let subtaskLiRef = subtaskItemRef.querySelector('li');
    return { text: subtaskLiRef ? subtaskLiRef.textContent.trim() : '', status: 'unchecked' };
  });
}


/**
 * Gets an array of IDs of assigned contacts.
 * @returns {Array<string>} An array of contact IDs.
 */
function getAssignedTo() {
  let assignedIds = [];
  for (let i = 0; i < selectedContacts.length; i++) {
    if (contacts[selectedContacts[i]] && contacts[selectedContacts[i]].id) {
      assignedIds.push(contacts[selectedContacts[i]].id);
    }
  }
  return assignedIds;
}


/**
 * Gets the selected priority.
 * @returns {string} The priority level ('Urgent', 'Medium', 'Low', or empty).
 */
function getPriority() {
  let urgentButtonRef = document.getElementById('urgent');
  let mediumButtonRef = document.getElementById('medium');
  let lowButtonRef = document.getElementById('low');
  if (urgentButtonRef?.classList.contains('active')) return 'Urgent';
  if (mediumButtonRef?.classList.contains('active')) return 'Medium';
  if (lowButtonRef?.classList.contains('active')) return 'Low';
  return '';
}


/**
 * Gets the category text from a selected category element.
 * @param {HTMLElement} categorySelected - The selected category element.
 * @returns {string} The category text.
 */
function getCategoryTextFromSelected(categorySelected) {
  let categoryTextRef = categorySelected.querySelector('p');
  if (categoryTextRef) {
    return categoryTextRef.textContent.trim();
  }
  return '';
}


/**
 * Gets the category text from a dropdown element.
 * @param {HTMLElement} dropdownRef - The dropdown element.
 * @returns {string} The category text.
 */
function getCategoryTextFromDropdown(dropdownRef) {
  let categoryTextRef = dropdownRef.querySelector('p');
  if (categoryTextRef) {
    return categoryTextRef.textContent.trim();
  }
  return '';
}


/**
 * Displays the selected contacts for a new task.
 */
function showContactsAddTask() {
  let container = document.getElementById('show-contacts-add-task');
  if (!container) return;
  container.classList.remove('d-none');
  let html = '';
  for (let i = 0; i < selectedContacts.length; i++) {
    const contact = contacts[selectedContacts[i]];
    html += showContactsAddTaskHtml(contact);
  }
  container.innerHTML = html;
}


/**
 * Toggles the selection of a contact.
 * @param {number} index - The index of the contact in the contacts array.
 */
function toggleContactSelection(index) {
  let pos = selectedContacts.indexOf(index);
  if (pos === -1) {
    selectedContacts.push(index);
  } else {
    selectedContacts.splice(pos, 1);
  }
  showContactsAddTask();
  clearAssignedTo();
}

/**
 * Toggles the priority button state.
 * @param {string} priority - The priority level ('urgent', 'medium', 'low').
 * @param {string} prefix - An optional prefix for the button IDs.
 */
function togglePriority(priority, prefix = '') {
  let ids = [prefix + 'urgent', prefix + 'medium', prefix + 'low'];
  for (let i = 0; i < ids.length; i++) {
    let btn = document.getElementById(ids[i]);
    if (btn) btn.classList.remove('active', 'urgent', 'medium', 'low');
  }
  let selectedBtn = document.getElementById(prefix + priority.toLowerCase());
  if (selectedBtn) selectedBtn.classList.add('active', priority.toLowerCase());
  if (!prefix) setPriority(priority);
}

/**
 * Sets the priority styling for the buttons.
 * @param {string} priority - The priority level ('urgent', 'medium', 'low').
 */
function setPriority(priority) {
  let urgentButton = document.getElementById('urgent');
  let mediumButton = document.getElementById('medium');
  let lowButton = document.getElementById('low');
  if (urgentButton) urgentButton.classList.remove('urgent');
  if (mediumButton) mediumButton.classList.remove('medium');
  if (lowButton) lowButton.classList.remove('low');
  if (priority === 'urgent' && urgentButton) urgentButton.classList.add('urgent');
  if (priority === 'medium' && mediumButton) mediumButton.classList.add('medium');
  if (priority === 'low' && lowButton) lowButton.classList.add('low');
}

/**
 * Sets the minimum date for the date input to today's date.
 */
function dateInputMinDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const minDate = `${dd}/${mm}/${yyyy}`;
  const dateInput = document.getElementById('date');
  dateInput.setAttribute('min', minDate);
  dateInput.value = minDate;
}

/**
 * Shows the "Create Task" wrapper section.
 */
function showWrapperCreateTask() {
  let wrapper = document.getElementById('wrapper-create-task-section');
  if (wrapper) {
    wrapper.classList.remove('d-none');
  }
}

/**
 * Initializes the task status from the URL query parameters.
 */
function initializeTaskStatusFromUrl() {
  let urlParams = new URLSearchParams(window.location.search);
  let statusFromUrl = urlParams.get('status');
  if (statusFromUrl) {
    window.currentTaskStatus = statusFromUrl;
  }
}

/**
 * Closes all open dropdowns when a click occurs outside of them.
 * @param {Event} event - The click event.
 */
function closeDropdownsOnOutsideClick(event) {
  if (event.defaultPrevented) return;
  let dropdownElements = getDropdownElements();
  checkAssignedToDropdown(event, dropdownElements);
  checkCategoryDropdown(event, dropdownElements);
}

/**
 * Gets references to all relevant dropdown elements.
 * @returns {object} An object containing the dropdown elements.
 */
function getDropdownElements() {
  return {
    assignedToDropdown: document.getElementById('assigned-to-dropdown'),
    categoryDropdown: document.getElementById('category-dropdown'),
    assignedToDropdownOptions: document.getElementById('assigned-to-dropdown-options'),
    categoryDropdownOptions: document.getElementById('category-dropdown-options')
  };
}

/**
 * Checks and closes the "Assigned To" dropdown if a click is outside of it.
 * @param {Event} event - The click event.
 * @param {object} elements - The dropdown elements object.
 */
function checkAssignedToDropdown(event, elements) {
  if (elements.assignedToDropdown && !elements.assignedToDropdown.contains(event.target)) {
    if (elements.assignedToDropdownOptions && isDropdownOpen(elements.assignedToDropdownOptions)) {
      handleDropdown('assigned-to-dropdown-options', 'assigned-to-arrow', 'close');
      clearAssignedTo();
    }
  }
}

/**
 * Checks and closes the "Category" dropdown if a click is outside of it.
 * @param {Event} event - The click event.
 * @param {object} elements - The dropdown elements object.
 */
function checkCategoryDropdown(event, elements) {
  if (elements.categoryDropdown && !elements.categoryDropdown.contains(event.target)) {
    if (elements.categoryDropdownOptions && isDropdownOpen(elements.categoryDropdownOptions)) {
      handleDropdown('category-dropdown-options', 'category-selected-arrow', 'close');
    }
  }
}