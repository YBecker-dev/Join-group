let currentDraggedTaskId = null;


/**
 * Toggles the visibility of the "Move To" overlay.
 */
function toggleMoveToOverlay() {
  let moveToRef = document.getElementById('selection');
  moveToRef.classList.toggle('d-none');
}


/**
 * Initializes the board view.
 * Loads contacts and tasks, sets up drag-and-drop, and initializes listeners.
 * @returns {Promise<void>}
 */
async function initBoard() {
  await loadContacts();
  await pushTasksInBoard();
  dragAndDropEventListner();
  emptyDragArea();
  initEventListnerProcessTasksInformation();
  initFrameworkFunctions();
}


/**
 * Fills empty drag-and-drop areas with a placeholder message.
 */
function emptyDragArea() {
  const areas = [
    { id: 'done', text: 'Done' },
    { id: 'awaitFeedback', text: 'Await feedback' },
    { id: 'inProgress', text: 'In progress' },
    { id: 'todo', text: 'To do' },
  ];
  areas.forEach((area) => checkAndFillEmptyArea(area));
}


/**
 * Fetches all tasks from the database.
 * @returns {Promise<object>} - A promise that resolves to the tasks object.
 */
async function fetchAllTasks() {
  let response = await fetch(BASE_URL_TASKS_AND_USERS + 'tasks.json');
  return await response.json();
}


/**
 * Gets the next available sequence number for a given status.
 * @param {object} allTasks - All tasks from the database.
 * @param {string} newStatus - The new status.
 * @returns {number} - The max sequence number plus one.
 */
function getMaxSequenceForStatus(allTasks, newStatus) {
  let maxSequence = 0;
  if (allTasks) {
    let allTasksArray = Object.values(allTasks);
    maxSequence = findMaxSequenceInTasks(allTasksArray, newStatus);
  }
  return maxSequence;
}


/**
 * Updates a task's status and sequence number.
 * @param {object} task - The task object to update.
 * @param {string} newStatus - The new status.
 * @param {number} maxSequence - The new sequence number.
 */
function updateTaskStatusAndSequence(task, newStatus, maxSequence) {
  task.status = newStatus;
  task.sequence = maxSequence;
}


/**
 * Fetches a single task by its ID.
 * @param {string} taskId - The ID of the task.
 * @returns {Promise<object>} - A promise that resolves to the task object.
 */
async function fetchTaskById(taskId) {
  let response = await fetch(BASE_URL_TASKS_AND_USERS + 'tasks/' + taskId + '.json');
  return await response.json();
}


/**
 * Saves a task to the database.
 * @param {string} taskId - The ID of the task.
 * @param {object} task - The task object to save.
 * @returns {Promise<void>}
 */
async function saveTask(taskId, task) {
  await fetch(BASE_URL_TASKS_AND_USERS + 'tasks/' + taskId + '.json', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
}


/**
 * Fetches and renders all tasks on the board.
 * @returns {Promise<void>}
 */
async function pushTasksInBoard() {
  let response = await fetch(BASE_URL_TASKS_AND_USERS + 'tasks.json');
  let data = await response.json();
  if (!data) return;
  clearAllColumns();
  let entries = Object.entries(data);
  let columns = getColumns();
  for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
    let column = columns[columnIndex];
    let tasksInColumn = collectTasksForColumn(entries, column.status);
    sortTasksBySequence(tasksInColumn);
    renderTasksInColumn(tasksInColumn, column.elementId);
  }
}


/**
 * Clears the content of all task columns.
 */
function clearAllColumns() {
  document.getElementById('todo').innerHTML = '';
  document.getElementById('inProgress').innerHTML = '';
  document.getElementById('awaitFeedback').innerHTML = '';
  document.getElementById('done').innerHTML = '';
}


/**
 * Gets an array of column status and element IDs.
 * @returns {Array<object>}
 */
function getColumns() {
  return [
    { status: 'todo', elementId: 'todo' },
    { status: 'inProgress', elementId: 'inProgress' },
    { status: 'awaitFeedback', elementId: 'awaitFeedback' },
    { status: 'done', elementId: 'done' },
  ];
}


/**
 * Deletes a task from the database by its `addTaskId`.
 * @param {string} addTaskIdToDelete - The ID of the task to delete.
 * @returns {Promise<void>}
 */
async function deleteTaskFromFirebase(addTaskIdToDelete) {
  let tasks = await fetchAllTasksFromFirebase();
  if (!tasks) return;
  let keys = Object.keys(tasks);
  let deleteKey = findTaskKeyByAddTaskId(tasks, keys, addTaskIdToDelete);
  if (deleteKey) {
    await fetch(BASE_URL_TASKS_AND_USERS + 'tasks/' + deleteKey + '.json', {
      method: 'DELETE',
    });
  }
  await customizeAddTaskId(tasks, keys, addTaskIdToDelete);
  await pushTasksInBoard();
}


/**
 * Fetches all tasks from Firebase.
 * @returns {Promise<object>} - A promise that resolves to the tasks object.
 */
async function fetchAllTasksFromFirebase() {
  let response = await fetch(BASE_URL_TASKS_AND_USERS + 'tasks.json');
  return await response.json();
}


/**
 * Adjusts the `addTaskId` for all tasks after a deletion.
 * @param {object} tasks - All tasks from the database.
 * @param {Array<string>} keys - The keys of the tasks.
 * @param {number} deletedAddTaskId - The `addTaskId` of the deleted task.
 * @returns {Promise<void>}
 */
async function customizeAddTaskId(tasks, keys, deletedAddTaskId) {
  for (let i = 0; i < keys.length; i++) {
    let task = tasks[keys[i]];
    if (task.addTaskId > deletedAddTaskId) {
      task.addTaskId = task.addTaskId - 1;
      await fetch(BASE_URL_TASKS_AND_USERS + 'tasks/' + keys[i] + '.json', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
    }
  }
}


/**
 * Finds a task's database key by its `addTaskId`.
 * @param {object} tasks - All tasks from the database.
 * @param {Array<string>} keys - The keys of the tasks.
 * @param {number} addTaskIdToDelete - The `addTaskId` to find.
 * @returns {string|null} - The key if found, otherwise null.
 */
function findTaskKeyByAddTaskId(tasks, keys, addTaskIdToDelete) {
  for (let i = 0; i < keys.length; i++) {
    let task = tasks[keys[i]];
    if (task.addTaskId == addTaskIdToDelete) {
      return keys[i];
    }
  }
  return null;
}


/**
 * Toggles the board overlay to show task details.
 * @param {string} taskId - The database ID of the task.
 * @param {string} trueTaskId - The internal ID of the task.
 * @returns {Promise<void>}
 */
async function toggleBoardOverlay(taskId, trueTaskId) {
  let overlayRef = document.getElementById('overlayBoard');
  let overlay_content = document.getElementById('overlay-content-loader');
  toggleOverlay(overlayRef);
  overlayRef.classList.remove('d-none');
  let response = await fetch(BASE_URL_TASKS_AND_USERS + 'tasks/' + taskId + '.json');
  let task = await response.json();
  if (!task) return;
  overlay_content.innerHTML = getTaskOverlay(task, taskId, trueTaskId);
  overlayRef.classList.add('visible');
  let contentRender = overlayRef.querySelector('.overlay-content-render');
  if (contentRender) {
    contentRender.classList.add('show');
  }
}


/**
 * Finds a contact by their user ID.
 * @param {string} userId - The user ID to find.
 * @returns {object|null} - The contact object if found, otherwise null.
 */
function findContactById(userId) {
  for (let i = 0; i < contacts.length; i++) {
    if (contacts[i].id === userId) {
      return contacts[i];
    }
  }
  return null;
}


/**
 * Toggles an overlay's visibility with or without animation.
 * @param {HTMLElement} overlayRef - The overlay element.
 */
function toggleOverlay(overlayRef) {
  if (!overlayRef.classList.contains('d-none')) {
    let contentRender = overlayRef.querySelector('.overlay-content-render');
    if (contentRender) {
      hideOverlayWithAnimation(overlayRef, contentRender);
    } else {
      hideOverlayDirectly(overlayRef);
    }
    return;
  }
}


/**
 * Generates HTML for subtasks to be displayed in the overlay.
 * @param {object} task - The task object.
 * @param {string} taskId - The database ID of the task.
 * @returns {string} - The HTML string for subtasks.
 */
function showSubtasksInOverlay(task, taskId) {
  let html = '';
  let subtasks = task.subtasks;
  if (subtasks && !Array.isArray(subtasks)) {
    subtasks = Object.values(subtasks);
  }
  if (subtasks && subtasks.length > 0) {
    for (let i = 0; i < subtasks.length; i++) {
      html += overlaySubtaskHtml(subtasks[i], i, taskId);
    }
  } else {
    html = '<p class="p-Tag">-</p>';
  }
  return html;
}


/**
 * Determines the category class and text for a task.
 * @param {object} task - The task object.
 * @returns {object} - An object with category text and class.
 */
function backgroundColorTitle(task) {
  let categoryText = '';
  let categoryClass = '';
  if (task.category) {
    categoryText = task.category;
    if (task.category === 'User Story') {
      categoryClass = 'category-user-story';
    } else if (task.category === 'Technical Task') {
      categoryClass = 'category-technical-task';
    }
  }
  return { categoryText: categoryText, categoryClass: categoryClass };
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
  return false;
}


/**
 * Toggles the 'done' status of a subtask and updates the database.
 * @param {string} taskId - The database ID of the task.
 * @param {number} subtaskIndex - The index of the subtask.
 * @returns {Promise<void>}
 */
async function toggleSubtaskDone(taskId, subtaskIndex) {
  let response = await fetch(BASE_URL_TASKS_AND_USERS + 'tasks/' + taskId + '.json');
  let task = await response.json();
  let subtask = task.subtasks[subtaskIndex];
  if (subtask.status === undefined) {
    subtask.status = 'unchecked';
  }
  subtask.status = subtask.status === 'checked' ? 'unchecked' : 'checked';

  await fetch(BASE_URL_TASKS_AND_USERS + 'tasks/' + taskId + '.json', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });

  await pushTasksInBoard();
}

