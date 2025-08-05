let currentDraggedTaskId = null;

async function initBoard() {
  await loadContacts();
  await pushTasksInBoard();
  dragAndDropEventListner();
  emptyDragArea();
  initEventListnerProcessTasksInformation();
  initFrameworkFunctions();
}

function emptyDragArea() {
  let noTaskText;
  let doneArea = document.getElementById('done');
  let awaitFeedbackArea = document.getElementById('awaitFeedback');
  let inProgressArea = document.getElementById('inProgress');
  let todoArea = document.getElementById('todo');
  if (doneArea.childElementCount === 0) {
    noTaskText = 'Done';
    doneArea.innerHTML = getEmptyDragArea(noTaskText);
  }
  if (awaitFeedbackArea.childElementCount === 0) {
    noTaskText = 'Await feedback';
    awaitFeedbackArea.innerHTML = getEmptyDragArea(noTaskText);
  }
  if (inProgressArea.childElementCount === 0) {
    noTaskText = 'In progress';
    inProgressArea.innerHTML = getEmptyDragArea(noTaskText);
  }
  if (todoArea.childElementCount === 0) {
    noTaskText = 'To do';
    todoArea.innerHTML = getEmptyDragArea(noTaskText);
  }
}

async function fetchAllTasks() {
  let response = await fetch(BASE_URL_TASKS_AND_USERS + 'tasks.json');
  return await response.json();
}

function getMaxSequenceForStatus(allTasks, newStatus) {
  let maxSequence = 0;
  if (allTasks) {
    let allTasksArray = Object.values(allTasks);
    for (let index = 0; index < allTasksArray.length; index++) {
      let otherTask = allTasksArray[index];
      if (otherTask.status === newStatus && otherTask.sequence != null) {
        if (otherTask.sequence >= maxSequence) {
          maxSequence = otherTask.sequence + 1;
        }
      }
    }
  }
  return maxSequence;
}

function updateTaskStatusAndSequence(task, newStatus, maxSequence) {
  task.status = newStatus;
  task.sequence = maxSequence;
}

async function fetchTaskById(taskId) {
  let response = await fetch(BASE_URL_TASKS_AND_USERS + 'tasks/' + taskId + '.json');
  return await response.json();
}

async function saveTask(taskId, task) {
  await fetch(BASE_URL_TASKS_AND_USERS + 'tasks/' + taskId + '.json', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
}

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

function clearAllColumns() {
  document.getElementById('todo').innerHTML = '';
  document.getElementById('inProgress').innerHTML = '';
  document.getElementById('awaitFeedback').innerHTML = '';
  document.getElementById('done').innerHTML = '';
}

function getColumns() {
  return [
    { status: 'todo', elementId: 'todo' },
    { status: 'inProgress', elementId: 'inProgress' },
    { status: 'awaitFeedback', elementId: 'awaitFeedback' },
    { status: 'done', elementId: 'done' },
  ];
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

async function fetchAllTasksFromFirebase() {
  let response = await fetch(BASE_URL_TASKS_AND_USERS + 'tasks.json');
  return await response.json();
}

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

function findTaskKeyByAddTaskId(tasks, keys, addTaskIdToDelete) {
  for (let i = 0; i < keys.length; i++) {
    let task = tasks[keys[i]];
    if (task.addTaskId == addTaskIdToDelete) {
      return keys[i];
    }
  }
  return null;
}

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

function findContactById(userId) {
  for (let i = 0; i < contacts.length; i++) {
    if (contacts[i].id === userId) {
      return contacts[i];
    }
  }
  return null;
}

function toggleOverlay(overlayRef) {
  if (!overlayRef.classList.contains('d-none')) {
    let contentRender = overlayRef.querySelector('.overlay-content-render');
    if (contentRender) {
      contentRender.classList.remove('show');
      contentRender.classList.add('hide');
      overlayRef.classList.remove('visible');
      setTimeout(() => {
        overlayRef.classList.add('d-none');
        contentRender.classList.remove('hide');
      }, 200);
    } else {
      overlayRef.classList.remove('visible');
      overlayRef.classList.add('d-none');
    }
    return;
  }
}

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

async function editTask(taskId) {
  let overlay_content = document.getElementById('overlay-content-loader');
  let response = await fetch(BASE_URL_TASKS_AND_USERS + 'tasks/' + taskId + '.json');
  let task = await response.json();
  if (!task) return;
  overlay_content.innerHTML = editTaskHtml(task, taskId);
  let subtasksContainer = document.getElementById('subtasks-container');
  subtasksContainer.innerHTML = '';
  if (task.subtasks && Array.isArray(task.subtasks)) {
    task.subtasks.forEach((subtask) => {
      const text = subtask.text !== undefined ? subtask.text : subtask;
      const checked = subtask.status === 'checked';
      subtasksContainer.innerHTML += pushSubtaskInputHTML(text, checked);
    });
  }
  selectedContacts = [];
  if (task.assignedTo && Array.isArray(task.assignedTo)) {
    for (let i = 0; i < contacts.length; i++) {
      if (task.assignedTo.includes(contacts[i].id)) {
        selectedContacts.push(i);
      }
    }
  }
  loadContacts();
  let input = document.getElementById('add-task-input3');
  if (input) input.value = '';
  showContactsAddTask();
}

async function saveEditedTask(event, taskId) {
  event.preventDefault();
  let title = document.getElementById('edit-title').value.trim();
  let description = document.getElementById('edit-description').value.trim();
  let date = document.getElementById('edit-date').value;
  let priority = '';
  if (document.getElementById('edit-urgent').classList.contains('active')) priority = 'Urgent';
  if (document.getElementById('edit-medium').classList.contains('active')) priority = 'Medium';
  if (document.getElementById('edit-low').classList.contains('active')) priority = 'Low';

  let assignedTo = [];
  for (let i = 0; i < selectedContacts.length; i++) {
    assignedTo.push(contacts[selectedContacts[i]].id);
  }

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

  let response = await fetch(BASE_URL_TASKS_AND_USERS + 'tasks/' + taskId + '.json');
  let oldTask = await response.json();
  let status = oldTask.status || 'todo';
  let category = oldTask.category || '';

  let updatedTask = {
    title,
    description,
    date,
    priority,
    assignedTo,
    subtasks,
    status,
    category,
    addTaskId: oldTask.addTaskId,
    sequence: oldTask.sequence,
  };

  await fetch(BASE_URL_TASKS_AND_USERS + 'tasks/' + taskId + '.json', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedTask),
  });

  toggleBoardOverlay(taskId);
  await pushTasksInBoard();
  return false;
}

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

async function openCreateTask() {
  selectedContacts = [];
  if (window.innerWidth <= 1233) {
    window.location.href = '/assets/html/add_task.html';
    return;
  }
  let response = await fetch('../html/add_task_board.html');
  let html = await response.text();
  let tempDiv = document.createElement('div'); // <- wird benötigt damit ich die HTML-Elemente manipulieren kann
  tempDiv.innerHTML += html;
  let clearBtn = tempDiv.querySelector('.clear-button');
  if (clearBtn) {
    let cancelBtnHtml = `<button type="button" class="cancel-button" onclick="closeCreateTask()">Cancel <img src="../img/icon/close.png" alt="" class=""></button>`;
    clearBtn.outerHTML = cancelBtnHtml;
  }
  let contentSpace = tempDiv.querySelector('.contentspace-html');
  if (contentSpace) {
    contentSpace.classList.add('content-add-task');
  }
  let overlayBg = document.getElementById('overlay-add-task');
  let overlayContent = document.getElementById('add-task-overlay-content');
  overlayContent.innerHTML =
    `<img onclick="closeCreateTask()" src="../img/icon/close.png" alt="" class="close-overlay-x">` + tempDiv.innerHTML;
  animatedOpeningAddTask(overlayBg, overlayContent);
  setPriority('medium');
  await initAddTask();
}

function closeCreateTask() {
  let overlayBg = document.getElementById('overlay-add-task');
  let overlayContent = document.getElementById('add-task-overlay-content');
  overlayContent.classList.remove('show');
  overlayContent.classList.add('hide');
  overlayBg.classList.remove('visible');
  setTimeout(() => {
    overlayBg.classList.add('d-none');
    overlayContent.innerHTML = '';
    overlayContent.classList.remove('hide');
  }, 300);
}

function animatedOpeningAddTask(overlayBg, overlayContent) {
  overlayBg.classList.remove('d-none');
  overlayBg.classList.remove('visible');
  overlayContent.classList.remove('show', 'hide');
  setTimeout(() => {
    overlayBg.classList.add('visible');
    overlayContent.classList.add('show');
  }, 10);
}
