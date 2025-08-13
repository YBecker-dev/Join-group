/**
 * Opens the "Create Task" overlay or redirects to the add task page.
 * @param {Event} event - The event that triggered the function.
 * @returns {Promise<void>}
 */
async function openCreateTask(event) {
  selectedContacts = [];
  let targetStatus = getTargetStatusFromEvent(event);
  if (shouldRedirectToAddTaskPage()) {
    window.location.href = `/assets/html/add_task.html?status=${targetStatus}`;
    return;
  }
  await setupAddTaskOverlay();
  await initializeAddTaskForm(targetStatus);
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
