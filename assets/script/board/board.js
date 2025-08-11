let currentDraggedTaskId = null;

function toggleMoveToOverlay() {
  let moveToRef = document.getElementById('selection');
  moveToRef.classList.toggle('d-none');
}

async function initBoard() {
  await loadContacts();
  await pushTasksInBoard();
  dragAndDropEventListner();
  emptyDragArea();
  initEventListnerProcessTasksInformation();
  initFrameworkFunctions();
}

function emptyDragArea() {
  const areas = [
    { id: 'done', text: 'Done' },
    { id: 'awaitFeedback', text: 'Await feedback' },
    { id: 'inProgress', text: 'In progress' },
    { id: 'todo', text: 'To do' },
  ];
  areas.forEach((area) => checkAndFillEmptyArea(area));
}

async function fetchAllTasks() {
  let response = await fetch(BASE_URL_TASKS_AND_USERS + 'tasks.json');
  return await response.json();
}

function getMaxSequenceForStatus(allTasks, newStatus) {
  let maxSequence = 0;
  if (allTasks) {
    let allTasksArray = Object.values(allTasks);
    maxSequence = findMaxSequenceInTasks(allTasksArray, newStatus);
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
      hideOverlayWithAnimation(overlayRef, contentRender);
    } else {
      hideOverlayDirectly(overlayRef);
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

function setDateInputToTodayOnFirstClick() {
  const dateInput = document.getElementById('edit-date');
  if (!dateInput) return;
  const setTodayIfPast = createDateValidator(dateInput);
  dateInput.addEventListener('focus', setTodayIfPast);
  dateInput.addEventListener('click', setTodayIfPast);
}

async function editTask(taskId) {
  let task = await loadTaskForEdit(taskId);
  if (!task) return;
  setupEditTaskOverlay(task, taskId);
  setupEditTaskSubtasks(task);
  setupEditTaskContacts(task);
  initializeEditTaskForm();
}

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
