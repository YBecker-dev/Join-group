let currentDraggedTaskId = null;

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
 * Adds an event listener to the document that removes highlights from all drag-and-drop areas when dragging ends.
 */
function dragAndDropEventListner() {
  document.addEventListener('dragend', removeAllHighlights);
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
 * all function enables the Live Search.
 */
let initEventListnerProcessTasksInformation = () => {
  let searchInput = document.getElementById('find-Task');
  if (searchInput) {
    searchInput.addEventListener('input', processTasksInformation);
  }
};
