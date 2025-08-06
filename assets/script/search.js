let taskCollection = [];

let initEventListnerProcessTasksInformation = () => {
  let searchInput = document.getElementById('find-Task');
  if (searchInput) {
    searchInput.addEventListener('input', processTasksInformation);
  }
};
/**
 * iterate through all tasks in the DOM and save the task title,
 * the description, the ID and the HTML element in the taskCollection array
 */
function processTasksInformation() {
  taskCollection = [];
  let boardRef = document.getElementById('board');
  let dragAreas = boardRef.querySelectorAll('.drag-area');
  for (let dragArea of dragAreas) {
    let taskContainers = dragArea.querySelectorAll('.board-task-container');
    for (let taskContainer of taskContainers) {
      let taskId = taskContainer.id;
      let currentTaskTitle = '' ,currentTaskDescription = '';
      let titleElement = taskContainer.querySelector('.board-task-title');
      if (titleElement) {
        currentTaskTitle = titleElement.innerText.trim();
      }
      let descriptionElement = taskContainer.querySelector('.board-task-description');
      if (descriptionElement) {
        currentTaskDescription = descriptionElement.innerText.trim();
      }
      storeTaskCollection(taskId, currentTaskTitle,currentTaskDescription ,taskContainer)
    }
  }
}

function storeTaskCollection(taskId, currentTaskTitle, currentTaskDescription, taskContainer){
    taskCollection.push({
        id: taskId,
        title: currentTaskTitle,
        description: currentTaskDescription,
        element: taskContainer,
    });
    showSearchResult();
}

/**
 * receive the input value and call the functions processTaskSearch() and taskVisibility()
 *  The main idea of this function is to implement a middleware functionality
 * @returns flase, undefined
 */
function showSearchResult() {
  let inputRef = document.getElementById('find-Task');
  if (!inputRef) {
    return;
  }
  const inputValue = inputRef.value;
  const searchResult = processTaskSearch(taskCollection, inputValue);
  if (searchResult.length === 0) {
    toggleNoResultOverlay();
  }
  taskVisibilty(searchResult);
}

function toggleNoResultOverlay(){
  let overlay = document.getElementById('overlay-no-result');
  let content = document.getElementById('no-result-content');
  overlay.classList.remove('d-none');
  content.innerHTML = noteNoTaskFounded();
}

let closeOverlay = () =>{
  let overlay = document.getElementById('overlay-no-result');
  overlay.classList.add('d-none');
  window.location.reload();
}
/**
 * take the inputValue and filter the TaskCollection array by Object -title and description.
 * if there are hits, create a new array filterTask width the target object and return a searchTerm = array with Objects
 * @param {Array[Object]} filterTask
 * @param {Array[Object]} searchString
 * @returns Array if Searchstring contains object.title or description
 */
function processTaskSearch(filterTask, searchString) {
  const searchTerm = String(searchString).toLowerCase();
  if (searchTerm === '') { return filterTask; }
  return filterTask.filter((singleTaskObject) => {
    let title;
    let description;
    if (singleTaskObject.title) {
      title = singleTaskObject.title.trim();
    } else {  title = ''; }
    if (singleTaskObject.description) {
      description = singleTaskObject.description.trim();
    } else { description = '';}
    const textOutput = (title + '' + description).toLowerCase();
    return textOutput.includes(searchTerm);
  });
}
/**
 * Controls the visibility of tasks through search input.
 * @param {Arraa[Object]} filterTask
 */
function taskVisibilty(filterTask) {
  const matchedTaskIds = new Set(filterTask.map((task) => task.id));
  taskCollection.forEach((taskObject) => {
    const isMatched = matchedTaskIds.has(taskObject.id);
    if (isMatched) {
      taskObject.element.classList.remove('d-none');
    } else {
      taskObject.element.classList.add('d-none');
    }
  }); 
}
