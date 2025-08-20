/**
 * Creates a date validator function.
 * @param {HTMLInputElement} dateInput - The date input element.
 * @returns {Function} - The validation function.
 */
function createDateValidator(dateInput) {
  return function setTodayIfPast() {
    const value = dateInput.value.trim();
    if (value && isDateInPast(value)) {
      dateInput.value = getTodayFormatted();
    }
    dateInput.removeEventListener('focus', setTodayIfPast);
    dateInput.removeEventListener('click', setTodayIfPast);
  };
}

/**
 * Checks if a date is in the past.
 * @param {string} dateValue - The date string in "dd/mm/yyyy" format.
 * @returns {boolean} - True if the date is in the past, otherwise false.
 */
function isDateInPast(dateValue) {
  const [dd, mm, yyyy] = dateValue.split('/');
  const inputDate = new Date(`${yyyy}-${mm}-${dd}`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate < today;
}

/**
 * Gets today's date formatted as "dd/mm/yyyy".
 * @returns {string} - The formatted date string.
 */
function getTodayFormatted() {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Sets up a listener to automatically set today's date if a past date is selected.
 */
function setDateInputToTodayOnFirstClick() {
  const dateInput = document.getElementById('edit-date');
  if (!dateInput) return;
  const setTodayIfPast = createDateValidator(dateInput);
  dateInput.addEventListener('focus', setTodayIfPast);
  dateInput.addEventListener('click', setTodayIfPast);
}

/**
 * Sets up the edit task form and overlay with existing task data.
 * @param {string} taskId - The database ID of the task.
 * @returns {Promise<void>}
 */
async function editTask(taskId) {
  let task = await loadTaskForEdit(taskId);
  if (!task) return;
  setupEditTaskOverlay(task, taskId);
  setupEditTaskSubtasks(task);
  setupEditTaskContacts(task);
  initializeEditTaskForm();
}

/**
 * Loads a task for editing from the database.
 * @param {string} taskId - The ID of the task.
 * @returns {Promise<object>} - A promise that resolves to the task object.
 */
async function loadTaskForEdit(taskId) {
  let response = await fetch(BASE_URL_TASKS_AND_USERS + 'tasks/' + taskId + '.json');
  return await response.json();
}

/**
 * Sets up the edit task overlay with task data.
 * @param {object} task - The task object to edit.
 * @param {string} taskId - The ID of the task.
 */
function setupEditTaskOverlay(task, taskId) {
  let overlay_content = document.getElementById('overlay-content-loader');
  overlay_content.innerHTML = editTaskHtml(task, taskId);
}

/**
 * Sets up the subtasks in the edit task form.
 * @param {object} task - The task object.
 */
function setupEditTaskSubtasks(task) {
  let subtasksContainer = document.getElementById('subtasks-container');
  subtasksContainer.innerHTML = '';
  if (task.subtasks && Array.isArray(task.subtasks)) {
    task.subtasks.forEach((subtask) => {
      const text = subtask.text !== undefined ? subtask.text : subtask;
      const status = subtask.status || 'unchecked';
      subtasksContainer.innerHTML += pushSubtaskInputHTML(text, status);
    });
  }
}

/**
 * Sets up the selected contacts for the edit task form.
 * @param {object} task - The task object.
 */
function setupEditTaskContacts(task) {
  selectedContacts = [];
  if (task.assignedTo && Array.isArray(task.assignedTo)) {
    for (let i = 0; i < contacts.length; i++) {
      if (task.assignedTo.includes(contacts[i].id)) {
        selectedContacts.push(i);
      }
    }
  }
}

/**
 * Initializes the edit task form.
 */
function initializeEditTaskForm() {
  loadContacts();
  let input = document.getElementById('add-task-input3');
  if (input) input.value = '';
  showContactsAddTask();
  addEditInputErrorListeners();
  setDateInputToTodayOnFirstClick();
}

/**
 * Saves the edited task to the database.
 * @param {Event} event - The form submission event.
 * @param {string} taskId - The database ID of the task.
 * @returns {Promise<boolean>} - Returns false to prevent form default behavior.
 */
async function saveEditedTask(event, taskId) {
  event.preventDefault();
  if (!validateEditTaskForm()) {
    return false;
  }
  let formData = getEditTaskFormData();
  let oldTask = await getExistingTask(taskId);
  let updatedTask = createUpdatedTaskObject(formData, oldTask);
  await updateTaskInDatabase(taskId, updatedTask);
  await pushTasksInBoard();
  await updateTaskOverlay(taskId, oldTask.addTaskId);
  emptyDragArea();
  return false;
}

/**
 * Collects form data from the edit task overlay.
 * @returns {object} - An object with the collected form data.
 */
function getEditTaskFormData() {
  let title = document.getElementById('edit-title').value.trim();
  let description = document.getElementById('edit-description').value.trim();
  let date = document.getElementById('edit-date').value;
  let priority = getSelectedPriority();
  let assignedTo = getSelectedContacts();
  let subtasks = getEditedSubtasks();
  return { title, description, date, priority, assignedTo, subtasks };
}

/**
 * Gets the selected priority from the edit task form.
 * @returns {string} - The priority level ('Urgent', 'Medium', 'Low', or empty string).
 */
function getSelectedPriority() {
  if (document.getElementById('edit-urgent').classList.contains('active')) return 'Urgent';
  if (document.getElementById('edit-medium').classList.contains('active')) return 'Medium';
  if (document.getElementById('edit-low').classList.contains('active')) return 'Low';
  return '';
}

/**
 * Gets the selected contacts from the edit task form.
 * @returns {string[]} - An array of contact IDs.
 */
function getSelectedContacts() {
  let assignedTo = [];
  for (let i = 0; i < selectedContacts.length; i++) {
    assignedTo.push(contacts[selectedContacts[i]].id);
  }
  return assignedTo;
}

/**
 * Returns all edited subtasks from the form, including the currently edited subtask if present.
 */
function getEditedSubtasks() {
  let subtasks = [];
  let subtaskItemRefs = document.querySelectorAll('#subtasks-container .subtask-item');
  subtaskItemRefs.forEach((subtaskItemRef) => {
    let subtaskLiRef = subtaskItemRef.querySelector('li');
    let originalStatus = subtaskItemRef.getAttribute('data-original-status') || 'unchecked';
    subtasks.push({
      text: subtaskLiRef ? subtaskLiRef.textContent.trim() : '',
      status: originalStatus,
    });
  });

  checkedSubtaskIfItEditing(subtasks);
  return subtasks;
}

/**
 * Adds the currently edited subtask to the subtasks array if present.
 */
function checkedSubtaskIfItEditing(subtasks) {
  let editingRef = document.querySelector('#subtasks-container .subtask-item-edit');
  if (editingRef) {
    let input = editingRef.querySelector('input[type="text"]');
    let originalStatus = editingRef.getAttribute('data-original-status') || 'unchecked';
    if (input && input.value.trim()) {
      subtasks.push({
        text: input.value.trim(),
        status: originalStatus,
      });
    }
  }
}

/**
 * Fetches an existing task from the database.
 * @param {string} taskId - The ID of the task.
 * @returns {Promise<object>} - A promise that resolves to the task object.
 */
async function getExistingTask(taskId) {
  let response = await fetch(BASE_URL_TASKS_AND_USERS + 'tasks/' + taskId + '.json');
  return await response.json();
}

/**
 * Creates an updated task object from form data and an old task object.
 * @param {object} formData - The form data.
 * @param {object} oldTask - The existing task object.
 * @returns {object} - The new updated task object.
 */
function createUpdatedTaskObject(formData, oldTask) {
  return {
    title: formData.title,
    description: formData.description,
    date: formData.date,
    priority: formData.priority,
    assignedTo: formData.assignedTo,
    subtasks: formData.subtasks,
    status: oldTask.status || 'todo',
    category: oldTask.category || '',
    addTaskId: oldTask.addTaskId,
    sequence: oldTask.sequence,
  };
}

/**
 * Updates a task in the database.
 * @param {string} taskId - The ID of the task.
 * @param {object} updatedTask - The updated task object.
 * @returns {Promise<void>}
 */
async function updateTaskInDatabase(taskId, updatedTask) {
  await fetch(BASE_URL_TASKS_AND_USERS + 'tasks/' + taskId + '.json', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedTask),
  });
}

/**
 * Updates the task overlay with fresh data.
 * @param {string} taskId - The ID of the task.
 * @param {string} addTaskId - The ID for adding a task.
 * @returns {Promise<void>}
 */
async function updateTaskOverlay(taskId, addTaskId) {
  let overlay_content = document.getElementById('overlay-content-loader');
  let response = await fetch(BASE_URL_TASKS_AND_USERS + 'tasks/' + taskId + '.json');
  let updatedTaskData = await response.json();
  if (updatedTaskData) {
    overlay_content.innerHTML = getTaskOverlay(updatedTaskData, taskId, addTaskId);
  }
}
