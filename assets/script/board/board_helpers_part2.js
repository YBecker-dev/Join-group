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