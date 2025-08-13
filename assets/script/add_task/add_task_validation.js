/**
 * Adds input listeners to clear errors on input for the main form.
 */
function addInputErrorListeners() {
  addTitleInputListener();
  addDateInputListener();
  addDescriptionInputListener();
}


/**
 * Adds an input listener for the title field to clear errors.
 */
function addTitleInputListener() {
  let titleInput = document.querySelector('input[name="add-task-input1"]');
  if (titleInput) {
    titleInput.addEventListener('input', function() {
      clearInputError(this);
      let warning = document.getElementById('add-task-input1-warning');
      if (warning) warning.classList.add('d-none');
    });
  }
}


/**
 * Adds an input listener for the date field to clear errors.
 */
function addDateInputListener() {
  let dateInput = document.querySelector('input[name="add-task-input2"]');
  if (dateInput) {
    dateInput.addEventListener('input', function() {
      clearInputError(this);
      let warning = document.getElementById('add-task-input2-warning');
      if (warning) warning.classList.add('d-none');
    });
  }
}


/**
 * Adds an input listener for the description field to clear errors.
 */
function addDescriptionInputListener() {
  let descriptionInput = document.querySelector('textarea[name="add-task-textarea"]');
  if (descriptionInput) {
    descriptionInput.addEventListener('input', function() {
      clearInputError(this);
    });
  }
}


/**
 * Adds form submission validation to prevent default behavior on invalid forms.
 * @param {string} formId - The ID of the form.
 */
function addFormValidation(formId) {
  let form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', function (event) {
    if (!areAllInputsFilled(this)) {
      event.preventDefault();
    }
  });
}


/**
 * Checks if all required input fields in a form are filled.
 * @param {HTMLFormElement} form - The form element.
 * @returns {boolean} True if all inputs are filled, otherwise false.
 */
function areAllInputsFilled(form) {
  let inputs = form.querySelectorAll('input:not([name="add-task-input3"]):not([type="checkbox"]), textarea');
  return checkInputsFilled(inputs);
}


/**
 * Validates the "Add Task" form.
 * @returns {boolean} False to prevent default form submission.
 */
function validateAddTaskForm() {
  if (!isFormValid()) return false;
  handleValidForm();
  return false;
}


/**
 * Checks if the "Add Task" form is valid.
 * @returns {boolean} True if the form is valid, otherwise false.
 */
function isFormValid() {
  let titleValid = checkTitle();
  let dateValid = checkDate();
  let categoryValid = checkCategory();
  return titleValid && dateValid && categoryValid;
}


/**
 * Handles the actions after a form has been successfully validated.
 */
function handleValidForm() {
  saveTaskToFirebase();
  showWrapperCreateTask();
  setTimeout(() => {
    closeCreateTask();
    window.location.href = 'board.html';
  }, 1000);
}


/**
 * Validates the title input field.
 * @returns {boolean} True if valid, otherwise false.
 */
function checkTitle() {
  let input1 = document.querySelector('input[name="add-task-input1"]');
  let input1Warning = document.getElementById('add-task-input1-warning');
  if (!input1 || !input1.value.trim()) {
    if (input1) input1.classList.add('input-error');
    if (input1Warning) input1Warning.classList.remove('d-none');
    shakeInput(input1, '');
    return false;
  }
  return true;
}


/**
 * Validates the date input field for the main form.
 * @returns {boolean} True if valid, otherwise false.
 */
function checkDate() {
  let input2 = document.querySelector('input[name="add-task-input2"]');
  let input2Warning = document.getElementById('add-task-input2-warning');
  
  if (!checkDateNotEmpty(input2, input2Warning)) {
    return false;
  }
  
  if (!checkDateFormat(input2, input2Warning)) {
    return false;
  }
  
  showDateValidationSuccess(input2, input2Warning);
  return true;
}


/**
 * Checks if the date input field is not empty.
 * @param {HTMLInputElement} input2 - The date input element.
 * @param {HTMLElement} input2Warning - The warning element.
 * @returns {boolean} True if not empty, otherwise false.
 */
function checkDateNotEmpty(input2, input2Warning) {
  if (!input2?.value.trim()) {
    input2?.classList.add('input-error');
    input2Warning?.classList.remove('d-none');
    if (input2) shakeInput(input2, '');
    return false;
  }
  return true;
}


/**
 * Checks if the date input format is valid.
 * @param {HTMLInputElement} input2 - The date input element.
 * @param {HTMLElement} input2Warning - The warning element.
 * @returns {boolean} True if the format is valid, otherwise false.
 */
function checkDateFormat(input2, input2Warning) {
  const value = input2.value.trim();
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value) || !isValidDate(value)) {
    input2.classList.add('input-error');
    input2Warning?.classList.remove('d-none');
    shakeInput(input2, '');
    return false;
  }
  return true;
}


/**
 * Shows that the date validation was successful.
 * @param {HTMLInputElement} input2 - The date input element.
 * @param {HTMLElement} input2Warning - The warning element.
 */
function showDateValidationSuccess(input2, input2Warning) {
  input2.classList.remove('input-error');
  input2Warning?.classList.add('d-none');
}


/**
 * Checks if a given date string is a valid date.
 * @param {string} value - The date string in "dd/mm/yyyy" format.
 * @returns {boolean} True if the date is valid, otherwise false.
 */
function isValidDate(value) {
  const [day, month, year] = value.split('/').map(Number);
  const dateObj = new Date(year, month - 1, day);
  return dateObj.getFullYear() === year && 
         dateObj.getMonth() + 1 === month && 
         dateObj.getDate() === day;
}


/**
 * Validates the category dropdown selection.
 * @returns {boolean} True if a category is selected, otherwise false.
 */
function checkCategory() {
  let categoryDropdownSelectedRef = document.getElementById('category-dropdown-selected');
  let categoryWarningRef = document.getElementById('category-dropdown-warning');
  if (!categoryDropdownSelectedRef) return false;
  
  if (!validateCategorySelection(categoryDropdownSelectedRef)) {
    showCategoryError(categoryDropdownSelectedRef, categoryWarningRef);
    animateCategoryError(categoryDropdownSelectedRef);
    return false;
  }
  return true;
}


/**
 * Checks if a valid category has been selected.
 * @param {HTMLElement} categoryDropdownSelectedRef - The category dropdown element.
 * @returns {boolean} True if a valid category is selected, otherwise false.
 */
function validateCategorySelection(categoryDropdownSelectedRef) {
  let categoryText = getCategoryTextFromDropdown(categoryDropdownSelectedRef);
  return categoryText !== 'Select a task category';
}


/**
 * Animates the category dropdown to indicate an error.
 * @param {HTMLElement} categoryDropdownSelectedRef - The category dropdown element.
 */
function animateCategoryError(categoryDropdownSelectedRef) {
  categoryDropdownSelectedRef.classList.add('shake');
  setTimeout(() => {
    categoryDropdownSelectedRef.classList.remove('shake');
  }, 300);
}


/**
 * Shows an error state for the category dropdown.
 * @param {HTMLElement} dropdownRef - The dropdown element.
 * @param {HTMLElement} warningRef - The warning element.
 */
function showCategoryError(dropdownRef, warningRef) {
  dropdownRef.classList.add('input-error');
  if (warningRef) warningRef.classList.remove('d-none');
}


/**
 * Validates the "Edit Task" form.
 * @returns {boolean} True if the form is valid, otherwise false.
 */
function validateEditTaskForm() {
  if (!isEditFormValid()) return false;
  return true;
}


/**
 * Checks if the "Edit Task" form is valid.
 * @returns {boolean} True if valid, otherwise false.
 */
function isEditFormValid() {
  let titleValid = checkEditTitle();
  let dateValid = checkEditDate();
  return titleValid && dateValid;
}


/**
 * Validates the title input field for the edit form.
 * @returns {boolean} True if valid, otherwise false.
 */
function checkEditTitle() {
  let input1 = document.getElementById('edit-title');
  let input1Warning = document.getElementById('add-task-input1-warning');
  if (!input1 || !input1.value.trim()) {
    if (input1) input1.classList.add('input-error');
    if (input1Warning) input1Warning.classList.remove('d-none');
    shakeInput(input1, '');
    return false;
  }
  return true;
}


/**
 * Validates the date input field for the edit form.
 * @returns {boolean} True if valid, otherwise false.
 */
function checkEditDate() {
  let input2 = document.getElementById('edit-date');
  let input2Warning = document.getElementById('add-task-input2-warning');
  
  if (!checkEditDateNotEmpty(input2, input2Warning)) {
    return false;
  }
  
  if (!checkEditDateFormat(input2, input2Warning)) {
    return false;
  }
  
  showEditDateValidationSuccess(input2, input2Warning);
  return true;
}


/**
 * Checks if the edit date input is not empty.
 * @param {HTMLInputElement} input2 - The date input element.
 * @param {HTMLElement} input2Warning - The warning element.
 * @returns {boolean} True if not empty, otherwise false.
 */
function checkEditDateNotEmpty(input2, input2Warning) {
  if (!input2?.value.trim()) {
    input2?.classList.add('input-error');
    input2Warning?.classList.remove('d-none');
    if (input2) shakeInput(input2, '');
    return false;
  }
  return true;
}


/**
 * Checks if the edit date format is valid.
 * @param {HTMLInputElement} input2 - The date input element.
 * @param {HTMLElement} input2Warning - The warning element.
 * @returns {boolean} True if the format is valid, otherwise false.
 */
function checkEditDateFormat(input2, input2Warning) {
  const value = input2.value.trim();
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value) || !isValidDate(value)) {
    input2.classList.add('input-error');
    input2Warning?.classList.remove('d-none');
    shakeInput(input2, '');
    return false;
  }
  return true;
}


/**
 * Shows that the edit date validation was successful.
 * @param {HTMLInputElement} input2 - The date input element.
 * @param {HTMLElement} input2Warning - The warning element.
 */
function showEditDateValidationSuccess(input2, input2Warning) {
  input2.classList.remove('input-error');
  input2Warning?.classList.add('d-none');
}


/**
 * Adds input listeners to clear errors on input for the edit form.
 */
function addEditInputErrorListeners() {
  addEditTitleInputListener();
  addEditDateInputListener();
}


/**
 * Adds an input listener for the edit title field to clear errors.
 */
function addEditTitleInputListener() {
  let titleInput = document.getElementById('edit-title');
  if (titleInput) {
    titleInput.addEventListener('input', function() {
      clearInputError(this);
      let warning = document.getElementById('add-task-input1-warning');
      if (warning) warning.classList.add('d-none');
    });
  }
}


/**
 * Adds an input listener for the edit date field to clear errors.
 */
function addEditDateInputListener() {
  let dateInput = document.getElementById('edit-date');
  if (dateInput) {
    dateInput.addEventListener('input', function() {
      clearInputError(this);
      let warning = document.getElementById('add-task-input2-warning');
      if (warning) warning.classList.add('d-none');
    });
  }
}