/**
 * Checks if all input fields in an array are filled.
 * @param {Array<HTMLInputElement>} inputs - The array of input elements.
 * @returns {boolean} True if all are filled, otherwise false.
 */
function checkInputsFilled(inputs) {
  for (let i = 0; i < inputs.length; i++) {
    if (!inputs[i].value.trim()) {
      return false;
    }
  }
  return true;
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
  inputs.forEach(input => {
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
}


/**
 * Clears all subtask elements from the container.
 */
function clearSubtaskElements() {
  let container = document.getElementById('subtasks-container');
  if (container) container.innerHTML = '';
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
      container.innerHTML += pushSubtaskInputHTML(input.value.trim());
      input.value = '';
      showPlusIcon();
    }
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
  let newDiv = document.createElement('div');
  if (newDiv) {
    newDiv.className = 'subtask-item-edit';
    newDiv.innerHTML = editSubtaskInputHTML(oldText);
  }
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
  let newText = inputElement.value;
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
  subtaskDiv.setAttribute('onclick', 'editSubtask(this)');
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


/**
 * Shows or hides a warning message for an input field.
 * @param {string} errorId - The ID of the warning element.
 * @param {string} inputId - The ID of the input element.
 * @param {boolean} isCategory - True if the input is a category dropdown.
 */
function showError(errorId, inputId, isCategory) {
  let warningElement = document.getElementById(errorId);
  let inputElement = document.getElementById(inputId);
  if (!warningElement || !inputElement) return;
  let fieldIsEmpty = isCategory ? isCategoryFieldEmpty(inputElement) : isInputEmpty(inputElement);
  toggleWarning(warningElement, fieldIsEmpty);
}


/**
 * Checks if the category dropdown field is empty.
 * @param {HTMLElement} inputElement - The category dropdown element.
 * @returns {boolean} True if empty, otherwise false.
 */
function isCategoryFieldEmpty(inputElement) {
  let categoryTextElement = inputElement.querySelector('p');
  let categoryText = '';
  if (categoryTextElement) {
    categoryText = categoryTextElement.textContent.trim();
  }
  if (categoryText === '' || categoryText === 'Select a task category') {
    return true;
  }
  return false;
}


/**
 * Checks if a regular input field is empty.
 * @param {HTMLInputElement} inputElement - The input element.
 * @returns {boolean} True if empty, otherwise false.
 */
function isInputEmpty(inputElement) {
  if (inputElement.value.trim() === '') {
    return true;
  }
  return false;
}


/**
 * Toggles the visibility of a warning element.
 * @param {HTMLElement} warningElement - The warning element.
 * @param {boolean} fieldIsEmpty - True to show the warning, false to hide.
 */
function toggleWarning(warningElement, fieldIsEmpty) {
  if (fieldIsEmpty) {
    warningElement.classList.remove('d-none');
  } else {
    warningElement.classList.add('d-none');
  }
}


/**
 * Enables the "Create Task" button based on form inputs.
 * @param {HTMLInputElement} dateInput - The date input element.
 */
function enableCreateTaskButton(dateInput) {
  let title = document.getElementById('title');
  let date = dateInput || document.getElementById('date');
  let categorySelected = document.getElementById('category-dropdown-selected');
  let button = document.getElementById('create-task-button');
  if (!title || !date || !categorySelected || !button) return;
  sanitizeAndValidateDate(date);
  let categoryText = getCategoryTextFromSelected(categorySelected);
  areAllFieldsFilled(title, date, categoryText);
}


/**
 * Gets the text from a selected category element.
 * @param {HTMLElement} categorySelected - The category element.
 * @returns {string} The text content.
 */
function getCategoryTextFromSelected(categorySelected) {
  let categoryTextRef = categorySelected.querySelector('p');
  if (categoryTextRef) {
    return categoryTextRef.textContent.trim();
  }
  return '';
}


/**
 * Checks if all required fields are filled.
 * @param {HTMLInputElement} title - The title input.
 * @param {HTMLInputElement} date - The date input.
 * @param {string} categoryText - The category text.
 * @returns {boolean} True if all are filled, otherwise false.
 */
function areAllFieldsFilled(title, date, categoryText) {
  let categoryChosen = categoryText !== '' && categoryText !== 'Select a task category';
  return title.value.trim() !== '' && date.value.trim() !== '' && categoryChosen;
}


/**
 * Sanitizes and validates the date input field.
 * @param {HTMLInputElement} date - The date input element.
 */
function sanitizeAndValidateDate(date) {
  date.value = date.value.replace(/[A-Za-z]/g, '');
  autoInsertSlashes(date);
  validateAndCorrectDate(date);
}


/**
 * Automatically inserts slashes into the date input.
 * @param {HTMLInputElement} date - The date input element.
 */
function autoInsertSlashes(date) {
  let value = date.value.replace(/[^\d\/]/g, '');
  value = handleFirstSlash(value, date);
  value = handleSecondSlash(value, date);
  lastDateLength = value.length;
  let parts = value.split('/');
  handleDayCorrection(parts, date);
  handleMonthCorrection(parts, date);
}


/**
 * Handles the insertion of the first slash.
 * @param {string} value - The current date value.
 * @param {HTMLInputElement} date - The date input element.
 * @returns {string} The updated value.
 */
function handleFirstSlash(value, date) {
  if (value.length > lastDateLength && /^\d{2}$/.test(value)) {
    value += '/';
    date.value = value;
  }
  return value;
}


/**
 * Handles the insertion of the second slash.
 * @param {string} value - The current date value.
 * @param {HTMLInputElement} date - The date input element.
 * @returns {string} The updated value.
 */
function handleSecondSlash(value, date) {
  if (value.length > lastDateLength && /^\d{2}\/\d{2}$/.test(value)) {
    value += '/';
    date.value = value;
  }
  return value;
}


/**
 * Corrects the day part of the date if it's invalid.
 * @param {string[]} parts - The date parts.
 * @param {HTMLInputElement} date - The date input element.
 */
function handleDayCorrection(parts, date) {
  if (parts.length >= 1 && parts[0].length === 2) {
    let year = parts.length > 2 ? Number(String(parts[2]).slice(0, 4)) : new Date().getFullYear();
    let month = parts.length > 1 ? Number(String(parts[1]).slice(0, 2)) : new Date().getMonth() + 1;
    let maxDay = new Date(year, month, 0).getDate();
    let day = Number(parts[0]);
    if (day > maxDay) {
      parts[0] = String(maxDay).padStart(2, '0');
      date.value = parts.join('/');
    }
  }
}


/**
 * Corrects the month part of the date if it's invalid.
 * @param {string[]} parts - The date parts.
 * @param {HTMLInputElement} date - The date input element.
 */
function handleMonthCorrection(parts, date) {
  if (parts.length >= 2 && parts[1].length === 2) {
    let month = Number(parts[1]);
    if (month > 12) {
      parts[1] = '12';
      date.value = parts.join('/');
    }
  }
}


/**
 * Validates and corrects the full date, enforcing limits.
 * @param {HTMLInputElement} date - The date input element.
 */
function validateAndCorrectDate(date) {
  let value = date.value.replace(/[^\d\/]/g, '');
  if (/^\d{2,}\/\d{2,}\/\d{4,}$/.test(value)) {
    let [day, month, year] = getLimitedDateParts(value);
    day = correctDay(day, month, year);
    month = Math.max(1, Math.min(12, month));
    year = Math.max(1900, Math.min(2035, year));
    let corrected = correctDateLimits(day, month, year);
    date.value = buildDateString(corrected[0], corrected[1], corrected[2]);
  }
}


/**
 * Extracts and limits the date parts from a string.
 * @param {string} value - The date string.
 * @returns {number[]} An array with day, month, and year.
 */
function getLimitedDateParts(value) {
  let parts = value.split('/');
  let day = Number(String(parts[0]).slice(0, 2));
  let month = Number(String(parts[1]).slice(0, 2));
  let year = Number(String(parts[2]).slice(0, 4));
  return [day, month, year];
}


/**
 * Corrects the day based on the month and year.
 * @param {number} day - The day.
 * @param {number} month - The month.
 * @param {number} year - The year.
 * @returns {number} The corrected day.
 */
function correctDay(day, month, year) {
  let maxDay = new Date(year, month, 0).getDate();
  let correctedDay = Math.max(1, Math.min(maxDay, day));
  return correctedDay;
}


/**
 * Corrects the date to be within today and a maximum limit.
 * @param {number} day - The day.
 * @param {number} month - The month.
 * @param {number} year - The year.
 * @returns {number[]} The corrected date parts.
 */
function correctDateLimits(day, month, year) {
  let inputDate = new Date(year, month - 1, day);
  let today = new Date();
  today.setHours(0, 0, 0, 0);
  let maxDate = new Date(2035, 11, 31);
  if (inputDate < today) {
    day = today.getDate();
    month = today.getMonth() + 1;
    year = today.getFullYear();
  } else if (inputDate > maxDate) {
    day = 31;
    month = 12;
    year = 2035;
  }
  return [day, month, year];
}


/**
 * Builds a formatted date string from day, month, and year.
 * @param {number} day - The day.
 * @param {number} month - The month.
 * @param {number} year - The year.
 * @returns {string} The formatted date string.
 */
function buildDateString(day, month, year) {
  let d = String(day).padStart(2, '0');
  let m = String(month).padStart(2, '0');
  let y = year;
  let result = `${d}/${m}/${y}`;
  return result;
}


/**
 * Prevents form submission on 'Enter' key press.
 * @param {KeyboardEvent} event - The keydown event.
 * @returns {boolean} Always returns false.
 */
function preventEnterSubmit(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    return false;
  }
}


/**
 * Clears the assigned-to input field.
 */
function clearAssignedTo() {
  let input = document.getElementById('add-task-input3');
  if (input) input.value = '';
}


/**
 * Checks if a dropdown menu is open.
 * @param {HTMLElement} dropdown - The dropdown element.
 * @returns {boolean} True if open, otherwise false.
 */
function isDropdownOpen(dropdown) {
  return dropdown.classList.contains('show') || dropdown.classList.contains('expanded');
}


/**
 * Gets references to all relevant dropdown elements.
 * @returns {object} An object containing the dropdown elements.
 */
function getDropdownElements() {
  return {
    assignedToDropdown: document.getElementById('assigned-to-dropdown'),
    categoryDropdown: document.getElementById('category-dropdown'),
    assignedToDropdownOptions: document.getElementById('assigned-to-dropdown-options'),
    categoryDropdownOptions: document.getElementById('category-dropdown-options')
  };
}

