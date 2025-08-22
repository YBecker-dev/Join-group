/**
 * Shows the "Create Task" wrapper section.
 */
function showWrapperCreateTask() {
  let wrapper = document.getElementById('wrapper-create-task-section');
  if (wrapper) {
    wrapper.classList.remove('d-none');
  }
}


/**
 * Handles the click event on a contact checkbox.
 * @param {number} i - The index of the contact.
 * @param {HTMLInputElement} checkbox - The checkbox element.
 */
function onContactCheckboxClick(i, checkbox) {
  changeColorIfItsChecked(i, checkbox.checked);
  toggleContactSelection(i);
  checkCheckbox(checkbox);
}

/**
 * Toggles the checked state of a checkbox.
 * @param {HTMLElement} divElement - The div containing the checkbox.
 */
function checkCheckbox(divElement) {
  let checkbox = divElement.querySelector('input[type="checkbox"]');
  if (checkbox) {
    checkbox.checked = !checkbox.checked;
  }
}

/**
 * Changes the styling of a contact element based on its checked state.
 * @param {number} i - The index of the contact.
 * @param {boolean} checked - True if the contact is checked.
 */
function changeColorIfItsChecked(i, checked) {
  let userDropdownRef = document.getElementById('user-dropdown-' + i);
  let assignedContactRef = document.getElementById('assigned-contact-' + i);
  let userNameDropdownRef = document.getElementById('user-name-dropdown-' + i);
  if (!userDropdownRef || !assignedContactRef || !userNameDropdownRef) return;

  userDropdownRef.classList.toggle('checked-assigned-to', checked);
  assignedContactRef.classList.toggle('checked-assigned-to', checked);
  userNameDropdownRef.classList.toggle('checked-assigned-to', checked);
}

/**
 * Toggles the selection of a contact by its index.
 * @param {number} index - The index of the contact.
 */
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

/**
 * Displays the selected contacts in the form.
 */
function showContactsAddTask() {
  let container = document.getElementById('show-contacts-add-task');
  if (!container) return;
  container.classList.remove('d-none');
  let html = buildContactsHTML();
  container.innerHTML = html;
}

/**
 * Builds the HTML for displaying selected contacts.
 * @returns {string} The HTML string for contacts display.
 */
function buildContactsHTML() {
  let html = '';
  const maxVisibleContacts = 5;
  const displayCount = Math.min(selectedContacts.length, maxVisibleContacts);
  html += generateVisibleContactsHTML(displayCount);

  if (selectedContacts.length > maxVisibleContacts) {
    html += generateRemainingContactsHTML(maxVisibleContacts);
  }

  return html;
}

/**
 * Generates HTML for the visible contacts.
 * @param {number} displayCount - Number of contacts to display.
 * @returns {string} HTML string for visible contacts.
 */
function generateVisibleContactsHTML(displayCount) {
  let html = '';
  for (let i = 0; i < displayCount; i++) {
    const contact = contacts[selectedContacts[i]];
    html += showContactsAddTaskHtml(contact);
  }
  return html;
}

/**
 * Generates HTML for remaining contacts counter.
 * @param {number} maxVisibleContacts - Maximum number of visible contacts.
 * @returns {string} HTML string for remaining contacts display.
 */
function generateRemainingContactsHTML(maxVisibleContacts) {
  const remainingCount = selectedContacts.length - maxVisibleContacts;
  return showRemainingContactsHtml(remainingCount);
}

/**
 * Clears all fields and warnings in the task form.
 */
function clearAllTaskFields() {
  clearAssignedTo();
  clearSubtaskInput();
  clearInputTexts();
  clearWarningMessages();
  clearCategory();
  showPlusIcon();
  clearSubtaskElements();
  clearCheckedContacts();
  clearRedBorder();
  subtasks = [];
}

/**
 * Clears red borders from all input fields.
 */
function clearRedBorder() {
  let inputs = document.querySelectorAll('.input-error');
  inputs.forEach((input) => {
    input.classList.remove('input-error');
  });
}

/**
 * Clears all checked contacts.
 */
function clearCheckedContacts() {
  let selected = [...selectedContacts];
  for (let i = 0; i < selected.length; i++) {
    toggleContactSelection(selected[i]);
  }
}

/**
 * Clears the subtask input field.
 */
function clearSubtaskInput() {
  let input = document.getElementById('add-task-input4');
  if (input) input.value = '';
  showPlusIcon();
}

/**
 * Clears all subtask elements from the container.
 */
function clearSubtaskElements() {
  let container = document.getElementById('subtasks-container');
  if (container) {
    container.innerHTML = '';
    container.classList.remove('scrollable');
  }
}

/**
 * Resets the main task form.
 */
function clearInputTexts() {
  let inputText = document.getElementById('add-task-form');
  if (inputText) inputText.reset();
}

/**
 * Hides all warning messages.
 */
function clearWarningMessages() {
  let warnings = document.getElementsByClassName('input-warning');
  for (let i = 0; i < warnings.length; i++) {
    warnings[i].classList.add('d-none');
  }
}

/**
 * Resets the category dropdown to its default state.
 */
function clearCategory() {
  let category = document.getElementById('category-dropdown-selected');
  if (category) {
    let p = category.querySelector('p');
    if (p) p.textContent = 'Select a task category';
  }
}

/**
 * Adds a new subtask from the input field.
 * @param {Event} event - The event object.
 */
function pushSubtaskInput(event) {
  let input = document.getElementById('add-task-input4');
  let container = document.getElementById('subtasks-container');
  if (!input || !container) return;
  
  if (!event.key || event.key === 'Enter') {
    if (event.key === 'Enter') event.preventDefault();
    if (input.value.trim()) {
      addSubtaskToContainer(input, container);
      updateSubtaskScrollability(container);
    }
  }
}

/**
 * Adds a subtask to the container based on edit mode.
 * @param {HTMLInputElement} input - The input element.
 * @param {HTMLElement} container - The subtasks container.
 */
function addSubtaskToContainer(input, container) {
  let isEditMode = container.classList.contains('subtasks-container-edit');
  if (isEditMode) {
    container.innerHTML += pushSubtaskInputHTML(input.value.trim(), false);
  } else {
    container.innerHTML += pushSubtaskInputHTML(input.value.trim());
  }
  input.value = '';
  showPlusIcon();
}

/**
 * Updates the scrollability of the subtasks container based on item count.
 * @param {HTMLElement} container - The subtasks container.
 */
function updateSubtaskScrollability(container) {
  const subtaskItems = container.querySelectorAll('.subtask-item');
  if (subtaskItems.length >= 3) {
    container.classList.add('scrollable');
  }
}

/**
 * Switches a subtask element to an editable input field.
 * @param {HTMLElement} element - The subtask item element.
 */
function editSubtask(element) {
  let listItem = element.closest('.subtask-item');
  let span = listItem ? listItem.querySelector('span') : null;
  if (!span) return;
  
  let oldText = span.textContent.trim();
  let originalStatus = listItem.getAttribute('data-original-status') || 'unchecked';
  let newDiv = createEditableSubtaskDiv(oldText, originalStatus);
  
  replaceSubtaskWithEditable(listItem, newDiv);
}

/**
 * Creates an editable subtask div element.
 * @param {string} oldText - The original text of the subtask.
 * @param {string} originalStatus - The original status of the subtask.
 * @returns {HTMLElement} The new editable div element.
 */
function createEditableSubtaskDiv(oldText, originalStatus) {
  let newDiv = document.createElement('div');
  newDiv.className = 'subtask-item-edit';
  newDiv.setAttribute('data-original-status', originalStatus);
  newDiv.innerHTML = editSubtaskInputHTML(oldText);
  return newDiv;
}

/**
 * Replaces a subtask item with its editable version.
 * @param {HTMLElement} listItem - The original subtask item.
 * @param {HTMLElement} newDiv - The new editable div.
 */
function replaceSubtaskWithEditable(listItem, newDiv) {
  if (listItem.parentNode) {
    listItem.parentNode.replaceChild(newDiv, listItem);
  }
}

/**
 * Saves the edited subtask text.
 * @param {Event} event - The event object.
 * @param {HTMLElement} inputElement - The input element for the subtask.
 */
function saveSubtaskEdit(event, inputElement) {
  if (event && event.key && event.key !== 'Enter') return;
  inputElement = inputElement.closest('.input-with-icons').querySelector('input');
  if (!inputElement) return;
  let newText = inputElement.value.trim();

  if (!newText) return;

  let subtaskItem = inputElement.closest('.subtask-item-edit');
  if (!subtaskItem) return;
  let subtaskDiv = buildSubtaskDiv(newText);
  subtaskItem.parentNode.replaceChild(subtaskDiv, subtaskItem);
}

/**
 * Builds a subtask div with a new text.
 * @param {string} newText - The new subtask text.
 * @returns {HTMLElement} The new subtask div.
 */
function buildSubtaskDiv(newText) {
  let subtaskDiv = document.createElement('div');
  subtaskDiv.className = 'subtask-item';
  subtaskDiv.innerHTML = saveSubtaskEditHTML(newText);
  return subtaskDiv;
}

/**
 * Deletes a subtask element.
 * @param {HTMLElement} element - The element inside the subtask to be deleted.
 */
function deleteSubtask(element) {
  let subtaskItem = element.closest('.subtask-item');
  let editSubtaskItem = element.closest('.subtask-item-edit');
  if (subtaskItem) subtaskItem.remove();
  if (editSubtaskItem) editSubtaskItem.remove();

  let container = document.getElementById('subtasks-container');
  if (container) {
    const subtaskItems = container.querySelectorAll('.subtask-item');
    if (subtaskItems.length < 3) {
      container.classList.remove('scrollable');
    }
  }
}

/**
 * Shows the plus icon for the subtask input.
 */
function showPlusIcon() {
  let iconSpan = document.getElementById('subtasks-icon');
  if (iconSpan) {
    iconSpan.innerHTML = `
      <img src="/assets/img/icon/add_task_icon/plus.png" alt="Add" onclick="pushSubtaskInput(event)">
    `;
  }
}

/**
 * Handles changes in the subtask input, showing save/cancel icons if text is present.
 */
function onSubtaskInputChange() {
  let input = document.getElementById('add-task-input4');
  if (input && input.value.trim()) {
    showSaveCancelIcons();
  } else {
    showPlusIcon();
  }
}

/**
 * Shows the save and cancel icons for the subtask input.
 */
function showSaveCancelIcons() {
  let iconSpan = document.getElementById('subtasks-icon');
  if (iconSpan) {
    iconSpan.innerHTML = showSaveCancelIconsHtml();
  }
}

/**
 * Handles the 'Enter' key press on the subtask input.
 * @param {KeyboardEvent} event - The keydown event.
 */
function onSubtaskInputKeydown(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    pushSubtaskInput(event);
  }
}

