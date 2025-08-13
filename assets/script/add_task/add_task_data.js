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
