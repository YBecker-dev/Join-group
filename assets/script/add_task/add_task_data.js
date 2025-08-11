async function buildTaskData() {
  return {
    addTaskId: await getNextTaskId(),
    title: getInputValue('title'),
    description: getInputValue('description'),
    date: getInputValue('date'),
    category: getCategoryText(),
    subtasks: getSubtasks(),
    assignedTo: getAssignedTo(),
    priority: getPriority(),
    status: 'todo',
    sequence: await getNextSequence(),
  };
}

async function postTaskToServer(taskData) {
  await fetch(BASE_URL_TASKS_AND_USERS + 'tasks.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
}

async function saveTaskToFirebase() {
  let taskData = await buildTaskData();
  await postTaskToServer(taskData);
}

async function getNextTaskId() {
  let response = await fetch(BASE_URL_TASKS_AND_USERS + 'tasks.json');
  let tasks = await response.json();
  let usedIds = [];
  if (tasks) {
    Object.values(tasks).forEach((task) => {
      if (task.addTaskId != null) usedIds.push(task.addTaskId);
    });
  }
  for (let i = 0; i <= usedIds.length; i++) {
    if (!usedIds.includes(i)) return i;
  }
  return usedIds.length;
}

async function getNextSequence() {
  let sequence = 0;
  let response = await fetch(BASE_URL_TASKS_AND_USERS + 'tasks.json');
  let tasks = await response.json();
  if (tasks) {
    Object.values(tasks).forEach((task) => {
      if (task.sequence != null && task.status === 'todo' && task.sequence >= sequence) {
        sequence = task.sequence + 1;
      }
    });
  }
  return sequence;
}

function getInputValue(id) {
  let inputRef = document.getElementById(id);
  return inputRef ? inputRef.value.trim() : '';
}

function getCategoryText() {
  let categoryDropdownSelectedRef = document.getElementById('category-dropdown-selected');
  let categoryTextRef = categoryDropdownSelectedRef ? categoryDropdownSelectedRef.querySelector('p') : null;
  return categoryTextRef ? categoryTextRef.textContent.trim() : '';
}

function getSubtasks() {
  let subtaskItemRefs = document.querySelectorAll('.subtask-item');
  return Array.from(subtaskItemRefs).map((subtaskItemRef) => {
    let subtaskLiRef = subtaskItemRef.querySelector('li');
    return { text: subtaskLiRef ? subtaskLiRef.textContent.trim() : '', status: 'unchecked' };
  });
}

function getAssignedTo() {
  let assignedIds = [];
  for (let i = 0; i < selectedContacts.length; i++) {
    if (contacts[selectedContacts[i]] && contacts[selectedContacts[i]].id) {
      assignedIds.push(contacts[selectedContacts[i]].id);
    }
  }
  return assignedIds;
}

function getPriority() {
  let urgentButtonRef = document.getElementById('urgent');
  let mediumButtonRef = document.getElementById('medium');
  let lowButtonRef = document.getElementById('low');
  if (urgentButtonRef?.classList.contains('active')) return 'Urgent';
  if (mediumButtonRef?.classList.contains('active')) return 'Medium';
  if (lowButtonRef?.classList.contains('active')) return 'Low';
  return '';
}

function getCategoryTextFromSelected(categorySelected) {
  let categoryTextRef = categorySelected.querySelector('p');
  if (categoryTextRef) {
    return categoryTextRef.textContent.trim();
  }
  return '';
}

function getCategoryTextFromDropdown(dropdownRef) {
  let categoryTextRef = dropdownRef.querySelector('p');
  if (categoryTextRef) {
    return categoryTextRef.textContent.trim();
  }
  return '';
}

function showContactsAddTask() {
  let container = document.getElementById('show-contacts-add-task');
  if (!container) return;
  container.classList.remove('d-none');
  let html = '';
  for (let i = 0; i < selectedContacts.length; i++) {
    const contact = contacts[selectedContacts[i]];
    html += showContactsAddTaskHtml(contact);
  }
  container.innerHTML = html;
}

function toggleContactSelection(index) {
  let pos = selectedContacts.indexOf(index);
  if (pos === -1) {
    selectedContacts.push(index);
  } else {
    selectedContacts.splice(pos, 1);
  }
  showContactsAddTask();
  clearAssignedTo();
}