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

function isDateInPast(dateValue) {
  const [dd, mm, yyyy] = dateValue.split('/');
  const inputDate = new Date(`${yyyy}-${mm}-${dd}`);
  const today = new Date();
  today.setHours(0,0,0,0);
  return inputDate < today;
}

function getTodayFormatted() {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

async function loadTaskForEdit(taskId) {
  let response = await fetch(BASE_URL_TASKS_AND_USERS + 'tasks/' + taskId + '.json');
  return await response.json();
}

function setupEditTaskOverlay(task, taskId) {
  let overlay_content = document.getElementById('overlay-content-loader');
  overlay_content.innerHTML = editTaskHtml(task, taskId);
}

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

function initializeEditTaskForm() {
  loadContacts();
  let input = document.getElementById('add-task-input3');
  if (input) input.value = '';
  showContactsAddTask();
  addEditInputErrorListeners();
  setDateInputToTodayOnFirstClick();
}

function getEditTaskFormData() {
  let title = document.getElementById('edit-title').value.trim();
  let description = document.getElementById('edit-description').value.trim();
  let date = document.getElementById('edit-date').value;
  let priority = getSelectedPriority();
  let assignedTo = getSelectedContacts();
  let subtasks = getEditedSubtasks();
  return { title, description, date, priority, assignedTo, subtasks };
}

function getSelectedPriority() {
  if (document.getElementById('edit-urgent').classList.contains('active')) return 'Urgent';
  if (document.getElementById('edit-medium').classList.contains('active')) return 'Medium';
  if (document.getElementById('edit-low').classList.contains('active')) return 'Low';
  return '';
}

function getSelectedContacts() {
  let assignedTo = [];
  for (let i = 0; i < selectedContacts.length; i++) {
    assignedTo.push(contacts[selectedContacts[i]].id);
  }
  return assignedTo;
}

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

async function getExistingTask(taskId) {
  let response = await fetch(BASE_URL_TASKS_AND_USERS + 'tasks/' + taskId + '.json');
  return await response.json();
}

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

async function updateTaskInDatabase(taskId, updatedTask) {
  await fetch(BASE_URL_TASKS_AND_USERS + 'tasks/' + taskId + '.json', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedTask),
  });
}

async function updateTaskOverlay(taskId, addTaskId) {
  let overlay_content = document.getElementById('overlay-content-loader');
  let response = await fetch(BASE_URL_TASKS_AND_USERS + 'tasks/' + taskId + '.json');
  let updatedTaskData = await response.json();
  if (updatedTaskData) {
    overlay_content.innerHTML = getTaskOverlay(updatedTaskData, taskId, addTaskId);
  }
}

function hideOverlayWithAnimation(overlayRef, contentRender) {
  contentRender.classList.remove('show');
  contentRender.classList.add('hide');
  overlayRef.classList.remove('visible');
  setTimeout(() => {
    overlayRef.classList.add('d-none');
    contentRender.classList.remove('hide');
  }, 200);
}

function hideOverlayDirectly(overlayRef) {
  overlayRef.classList.remove('visible');
  overlayRef.classList.add('d-none');
}

function checkAndFillEmptyArea(area) {
  let areaElement = document.getElementById(area.id);
  if (areaElement.childElementCount === 0) {
    areaElement.innerHTML = getEmptyDragArea(area.text);
  }
}

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

function shouldRedirectToAddTaskPage() {
  return window.innerWidth <= 1233;
}

async function setupAddTaskOverlay() {
  let response = await fetch('../html/add_task_board.html');
  let html = await response.text();
  let overlayBg = document.getElementById('overlay-add-task');
  let overlayContent = document.getElementById('add-task-overlay-content');
  overlayContent.innerHTML = html;
  animatedOpeningAddTask(overlayBg, overlayContent);
}

async function initializeAddTaskForm() {
  setPriority('medium');
  await initAddTask();
}

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

function renderTasksInColumn(tasksInColumn, elementId) {
  for (let taskIndex = 0; taskIndex < tasksInColumn.length; taskIndex++) {
    renderSingleTaskInColumn(tasksInColumn[taskIndex], elementId);
  }
}

function renderSingleTaskInColumn(taskObj, elementId) {
  let div = createTaskSection(taskObj);
  document.getElementById(elementId).appendChild(div);
  enableDragAndDropBoard(taskObj.task, div);
}

function createTaskSection(taskObj) {
  let taskId = taskObj.id;
  let task = taskObj.task;
  let categoryInfo = backgroundColorTitle(task);
  let div = document.createElement('section');
  div.innerHTML = buildTaskHtml(taskId, task, categoryInfo);
  return div;
}

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

function getContactHtmlByType(contact, type) {
  if (type === 'board') {
    return `<span class="board-contact-name" style="background-color:${contact.color}">${contact.initials}</span>`;
  } else if (type === 'overlay') {
    return contactsOverlayTemplate(contact.initials, contact.name, contact.color);
  }
  return '';
}

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

function countDoneSubtasks(subtasks) {
  let done = 0;
  for (let i = 0; i < subtasks.length; i++) {
    if (subtasks[i].status === 'checked') {
      done++;
    }
  }
  return done;
}