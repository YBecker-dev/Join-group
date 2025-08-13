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
  today.setHours(0,0,0,0);
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
      const checked = subtask.status === 'checked';
      subtasksContainer.innerHTML += pushSubtaskInputHTML(text, checked);
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
 * Gets the edited subtasks from the form.
 * @returns {Array<object>} - An array of subtask objects.
 */
function getEditedSubtasks() {
  let subtasks = [];
  let subtaskItemRefs = document.querySelectorAll('#subtasks-container .subtask-item');
  subtaskItemRefs.forEach((subtaskItemRef) => {
    let subtaskLiRef = subtaskItemRef.querySelector('li');
    let checkbox = subtaskItemRef.querySelector('input[type="checkbox"]');
    subtasks.push({
      text: subtaskLiRef ? subtaskLiRef.textContent.trim() : '',
      status: checkbox && checkbox.checked ? 'checked' : 'unchecked',
    });
  });
  return subtasks;
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


/**
 * Hides an overlay with a fading animation.
 * @param {HTMLElement} overlayRef - The overlay element.
 * @param {HTMLElement} contentRender - The content element inside the overlay.
 */
function hideOverlayWithAnimation(overlayRef, contentRender) {
  contentRender.classList.remove('show');
  contentRender.classList.add('hide');
  overlayRef.classList.remove('visible');
  setTimeout(() => {
    overlayRef.classList.add('d-none');
    contentRender.classList.remove('hide');
  }, 200);
}


/**
 * Hides an overlay immediately without animation.
 * @param {HTMLElement} overlayRef - The overlay element.
 */
function hideOverlayDirectly(overlayRef) {
  overlayRef.classList.remove('visible');
  overlayRef.classList.add('d-none');
}


/**
 * Fills an empty task area with a placeholder.
 * @param {object} area - The area object with id and text properties.
 */
function checkAndFillEmptyArea(area) {
  let areaElement = document.getElementById(area.id);
  if (areaElement.childElementCount === 0) {
    areaElement.innerHTML = getEmptyDragArea(area.text);
  }
}


/**
 * Finds the maximum sequence number for a given status in a tasks array.
 * @param {Array<object>} tasksArray - The array of task objects.
 * @param {string} status - The status to check for.
 * @returns {number} - The maximum sequence number plus one.
 */
function findMaxSequenceInTasks(tasksArray, status) {
  let maxSequence = 0;
  for (let index = 0; index < tasksArray.length; index++) {
    let otherTask = tasksArray[index];
    if (otherTask.status === status && otherTask.sequence != null) {
      if (otherTask.sequence >= maxSequence) {
        maxSequence = otherTask.sequence + 1;
      }
    }
  }
  return maxSequence;
}


/**
 * Checks if the user should be redirected to the add task page.
 * @returns {boolean} - True if the window width is less than or equal to 1233px.
 */
function shouldRedirectToAddTaskPage() {
  return window.innerWidth <= 1233;
}


/**
 * Sets up the add task overlay asynchronously.
 * @returns {Promise<void>}
 */
async function setupAddTaskOverlay() {
  let response = await fetch('../html/add_task_board.html');
  let html = await response.text();
  let overlayBg = document.getElementById('overlay-add-task');
  let overlayContent = document.getElementById('add-task-overlay-content');
  overlayContent.innerHTML = html;
  animatedOpeningAddTask(overlayBg, overlayContent);
}


/**
 * Initializes the add task form.
 * @param {string} targetStatus - The initial status for the new task.
 * @returns {Promise<void>}
 */
async function initializeAddTaskForm(targetStatus) {
  setPriority('medium');
  setTaskStatus(targetStatus);
  await initAddTask();
}


/**
 * Gets the target status for a new task from a click event.
 * @param {Event} event - The click event.
 * @returns {string} - The status ('todo', 'inProgress', 'awaitFeedback', or 'done').
 */
function getTargetStatusFromEvent(event) {
  if (!event || !event.target) {
    return 'todo';
  }
  let elementId = event.target.id;
  if (elementId.includes('todo')) return 'todo';
  if (elementId.includes('inProgress')) return 'inProgress';  
  if (elementId.includes('awaitFeedback')) return 'awaitFeedback';
  if (elementId.includes('done')) return 'done';
  return 'todo';
}

/**
 * Sets the global status for a new task.
 * @param {string} status - The status to set.
 */
function setTaskStatus(status) {
  window.currentTaskStatus = status || 'todo';
}


/**
 * Collects tasks for a specific column status.
 * @param {Array<Array>} entries - The array of task entries.
 * @param {string} status - The status to filter by.
 * @returns {Array<object>} - An array of tasks for that column.
 */
function collectTasksForColumn(entries, status) {
  let tasksInColumn = [];
  for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
    let taskId = entries[entryIndex][0];
    let task = entries[entryIndex][1];
    if (task.status === status) {
      tasksInColumn.push({ id: taskId, task: task });
    }
  }
  return tasksInColumn;
}


/**
 * Renders tasks in a specified column.
 * @param {Array<object>} tasksInColumn - The array of tasks to render.
 * @param {string} elementId - The ID of the HTML element to render into.
 */
function renderTasksInColumn(tasksInColumn, elementId) {
  for (let taskIndex = 0; taskIndex < tasksInColumn.length; taskIndex++) {
    renderSingleTaskInColumn(tasksInColumn[taskIndex], elementId);
  }
}


/**
 * Renders a single task in a column.
 * @param {object} taskObj - The task object with id and task data.
 * @param {string} elementId - The ID of the HTML element.
 */
function renderSingleTaskInColumn(taskObj, elementId) {
  let div = createTaskSection(taskObj);
  document.getElementById(elementId).appendChild(div);
  enableDragAndDropBoard(taskObj.task, div);
}


/**
 * Creates a task section element.
 * @param {object} taskObj - The task object with id and task data.
 * @returns {HTMLElement} - The created section element.
 */
function createTaskSection(taskObj) {
  let taskId = taskObj.id;
  let task = taskObj.task;
  let categoryInfo = backgroundColorTitle(task);
  let div = document.createElement('section');
  div.innerHTML = buildTaskHtml(taskId, task, categoryInfo);
  return div;
}


/**
 * Builds the HTML for a task card on the board.
 * @param {string} taskId - The ID of the task.
 * @param {object} task - The task object.
 * @param {object} categoryInfo - Information about the task's category.
 * @returns {string} - The HTML string for the task card.
 */
function buildTaskHtml(taskId, task, categoryInfo) {
  return boardHtmlTemplate(
    taskId,
    categoryInfo.categoryClass,
    categoryInfo.categoryText,
    task.title || '',
    task.description || '',
    getAssignedContactsHtml(task, 'board'),
    showPriorityImg(task),
    progressBarSubtasks(task),
    task.addTaskId
  );
}


/**
 * Gets the HTML for assigned contacts.
 * @param {object} task - The task object.
 * @param {string} type - The type of display ('board' or 'overlay').
 * @returns {string} - The HTML string for contacts.
 */
function getAssignedContactsHtml(task, type) {
  let html = '';
  let hasContact = false;
  if (Array.isArray(task.assignedTo) && contacts && contacts.length > 0) {
    html = buildContactsHtml(task, type);
    hasContact = html.length > 0;
  }
  if (type === 'overlay' && !hasContact) {
    html = `<div class="no-contacts">Keine Kontakte ausgewählt</div>`;
  }
  return html;
}


/**
 * Builds the HTML for a list of contacts.
 * @param {object} task - The task object.
 * @param {string} type - The type of display.
 * @returns {string} - The HTML string.
 */
function buildContactsHtml(task, type) {
  let html = '';
  for (let i = 0; i < task.assignedTo.length; i++) {
    let userId = task.assignedTo[i];
    let contact = findContactById(userId);
    if (contact) {
      html += getContactHtmlByType(contact, type);
    }
  }
  return html;
}


/**
 * Gets the HTML for a single contact based on the display type.
 * @param {object} contact - The contact object.
 * @param {string} type - The type of display.
 * @returns {string} - The HTML string for the contact.
 */
function getContactHtmlByType(contact, type) {
  if (type === 'board') {
    return `<span class="board-contact-name" style="background-color:${contact.color}">${contact.initials}</span>`;
  } else if (type === 'overlay') {
    return contactsOverlayTemplate(contact.initials, contact.name, contact.color);
  }
  return '';
}


/**
 * Sorts an array of tasks by their sequence number.
 * @param {Array<object>} tasksArray - The array of tasks to sort.
 */
function sortTasksBySequence(tasksArray) {
  for (let outerIndex = 0; outerIndex < tasksArray.length - 1; outerIndex++) {
    for (let innerIndex = 0; innerIndex < tasksArray.length - outerIndex - 1; innerIndex++) {
      let sequenceA = tasksArray[innerIndex].task.sequence != null ? tasksArray[innerIndex].task.sequence : 0;
      let sequenceB = tasksArray[innerIndex + 1].task.sequence != null ? tasksArray[innerIndex + 1].task.sequence : 0;
      if (sequenceA > sequenceB) {
        let temp = tasksArray[innerIndex];
        tasksArray[innerIndex] = tasksArray[innerIndex + 1];
        tasksArray[innerIndex + 1] = temp;
      }
    }
  }
}


/**
 * Gets the priority image HTML for a task.
 * @param {object} task - The task object.
 * @returns {string} - The HTML string for the priority image.
 */
function showPriorityImg(task) {
  let priorityImg = '';
  if (task.priority === 'Urgent') {
    priorityImg = '<img src="/assets/img/icon/priority/urgent.png" alt="Urgent" class="priority-img">';
  } else if (task.priority === 'Medium') {
    priorityImg = '<img src="/assets/img/icon/priority/medium.png" alt="Medium" class="priority-img">';
  } else if (task.priority === 'Low') {
    priorityImg = '<img src="/assets/img/icon/priority/low.png" alt="Low" class="priority-img">';
  }
  return priorityImg;
}


/**
 * Gets the progress bar HTML for a task's subtasks.
 * @param {object} task - The task object.
 * @returns {string} - The HTML string for the progress bar.
 */
function progressBarSubtasks(task) {
  let doneCount = 0;
  let totalCount = 0;
  let progressBar = '';
  if (Array.isArray(task.subtasks)) {
    totalCount = task.subtasks.length;
    doneCount = countDoneSubtasks(task.subtasks);
    let percent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;
    progressBar = progressbarHtml(percent, doneCount, totalCount);
  }
  return progressBar;
}


/**
 * Counts the number of completed subtasks.
 * @param {Array<object>} subtasks - The array of subtask objects.
 * @returns {number} - The count of completed subtasks.
 */
function countDoneSubtasks(subtasks) {
  let done = 0;
  for (let i = 0; i < subtasks.length; i++) {
    if (subtasks[i].status === 'checked') {
      done++;
    }
  }
  return done;
}