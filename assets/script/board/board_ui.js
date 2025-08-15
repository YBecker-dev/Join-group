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
 * Toggles the visibility of the "Move To" overlay.
 */
function toggleMoveToOverlay() {
  let moveToRef = document.getElementById('selection');
  moveToRef.classList.toggle('d-none');
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
    const scrollableClass = subtasks.length > 3 ? ' scrollable' : '';
    html = `<div class="subtasks-overlay-container${scrollableClass}">`;
    for (let i = 0; i < subtasks.length; i++) {
      html += overlaySubtaskHtml(subtasks[i], i, taskId);
    }
    html += '</div>';
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
 * Closes the "Create Task" overlay with an animation.
 */
function closeCreateTask() {
  let overlayBg = document.getElementById('overlay-add-task');
  let overlayContent = document.getElementById('add-task-overlay-content');
  overlayContent.classList.remove('show');
  overlayContent.classList.add('hide');
  overlayBg.classList.remove('visible');
  removeOverlayListener(overlayContent);
  setTimeout(() => {
    overlayBg.classList.add('d-none');
    overlayContent.innerHTML = '';
    overlayContent.classList.remove('hide');
  }, 300);
}

/**
 * Removes the event listener from the overlay content.
 * @param {HTMLElement} content - The overlay content element.
 */

function removeOverlayListener(content) {
  if (window.overlayContentListener) {
    content.removeEventListener('click', window.overlayContentListener, true);
    window.overlayContentListener = null;
  }
}

/**
 * Animates the opening of the add task overlay.
 * @param {HTMLElement} overlayBg - The overlay background element.
 * @param {HTMLElement} overlayContent - The overlay content element.
 */
function animatedOpeningAddTask(overlayBg, overlayContent) {
  overlayBg.classList.remove('d-none');
  overlayBg.classList.remove('visible');
  overlayContent.classList.remove('show', 'hide');
  setTimeout(() => {
    overlayBg.classList.add('visible');
    overlayContent.classList.add('show');
  }, 10);
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
  const maxVisibleContacts = 3;
  const totalContacts = task.assignedTo.length;
  const displayCount = Math.min(totalContacts, maxVisibleContacts);
  
  for (let i = 0; i < displayCount; i++) {
    let userId = task.assignedTo[i];
    let contact = findContactById(userId);
    if (contact) {
      html += getContactHtmlByType(contact, type);
    }
  }
  
  if (totalContacts > maxVisibleContacts && type === 'overlay') {
    const remainingCount = totalContacts - maxVisibleContacts;
    html += getAdditionalContactsHtml(remainingCount);
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
 * Gets the HTML for additional contacts counter circle.
 * @param {number} remainingCount - Number of additional contacts.
 * @returns {string} - The HTML string for the counter circle.
 */
function getAdditionalContactsHtml(remainingCount) {
  return `
    <div class="peoples-info">
      <div class="initials remaining-contacts">
        <span class="overlay-span">+${remainingCount}</span>
      </div>
      <div class="people-name">
        <p class="p-Tag">${remainingCount} weitere Kontakte</p>
      </div>
    </div>
  `;
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
