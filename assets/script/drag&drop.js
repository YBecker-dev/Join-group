function dragAndDropEventListner(){
  document.addEventListener('dragend', removeAllHighlights);
}


function allowDrop(ev) {
  ev.preventDefault();
}

function toggleHighlight(id, add) {
  let element = document.getElementById(id);
  if (!element) return;
  if (add) {
    element.classList.add('drag-area-highlight');
  } else {
    element.classList.remove('drag-area-highlight');
  }
}

function removeAllHighlights() {
  toggleHighlight('todo', false);
  toggleHighlight('inProgress', false);
  toggleHighlight('awaitFeedback', false);
  toggleHighlight('done', false);
}

function eventBubbling(event) {
  event.stopPropagation();
}

function startDragging(taskId) {
  currentDraggedTaskId = taskId;
}

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