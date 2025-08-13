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
