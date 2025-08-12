/**
 * Adds an event listener to the document that removes highlights from all drag-and-drop areas when dragging ends.
 */
function dragAndDropEventListner(){
  document.addEventListener('dragend', removeAllHighlights);
}


/**
 * Prevents the default browser behavior to allow elements to be dropped.
 * @param {Event} ev - The drag event.
 */
function allowDrop(ev) {
  ev.preventDefault();
}


/**
 * Toggles a visual highlight class on an element based on its ID.
 * @param {string} id - The ID of the element to highlight.
 * @param {boolean} add - If true, adds the highlight class; if false, removes it.
 */
function toggleHighlight(id, add) {
  let element = document.getElementById(id);
  if (!element) return;
  if (add) {
    element.classList.add('drag-area-highlight');
  } else {
    element.classList.remove('drag-area-highlight');
  }
}


/**
 * Removes the highlight from all drag-and-drop status areas.
 */
function removeAllHighlights() {
  toggleHighlight('todo', false);
  toggleHighlight('inProgress', false);
  toggleHighlight('awaitFeedback', false);
  toggleHighlight('done', false);
}


/**
 * Stores the ID of the task that is currently being dragged.
 * @param {string} taskId - The ID of the task.
 */
function startDragging(taskId) {
  currentDraggedTaskId = taskId;
}


/**
 * Moves the currently dragged task to a new status, updates its data, and re-renders the board.
 * @param {string} newStatus - The new status of the task.
 */
async function moveTo(newStatus) {
  if (!currentDraggedTaskId) return;
  let allTasks = await fetchAllTasks();
  let maxSequence = getMaxSequenceForStatus(allTasks, newStatus);
  let task = await fetchTaskById(currentDraggedTaskId);
  if (!task) return;
  updateTaskStatusAndSequence(task, newStatus, maxSequence);
  await saveTask(currentDraggedTaskId, task);
  await pushTasksInBoard();
  emptyDragArea();
  currentDraggedTaskId = null;
}


/**
 * Appends a task's HTML element to the corresponding status column on the board.
 * @param {object} task - The task object.
 * @param {HTMLElement} div - The HTML element representing the task.
 */
function enableDragAndDropBoard(task, div) {
  if (task.status === 'todo') {
    document.getElementById('todo').appendChild(div);
  } else if (task.status === 'inProgress') {
    document.getElementById('inProgress').appendChild(div);
  } else if (task.status === 'awaitFeedback') {
    document.getElementById('awaitFeedback').appendChild(div);
  } else if (task.status === 'done') {
    document.getElementById('done').appendChild(div);
  }
}