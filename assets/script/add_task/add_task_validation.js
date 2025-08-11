function addInputErrorListeners() {
  addTitleInputListener();
  addDateInputListener();
  addDescriptionInputListener();
}

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

function addDescriptionInputListener() {
  let descriptionInput = document.querySelector('textarea[name="add-task-textarea"]');
  if (descriptionInput) {
    descriptionInput.addEventListener('input', function() {
      clearInputError(this);
    });
  }
}

function addFormValidation(formId) {
  let form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', function (event) {
    if (!areAllInputsFilled(this)) {
      event.preventDefault();
    }
  });
}

function areAllInputsFilled(form) {
  let inputs = form.querySelectorAll('input:not([name="add-task-input3"]):not([type="checkbox"]), textarea');
  return checkInputsFilled(inputs);
}

function validateAddTaskForm() {
  if (!isFormValid()) return false;
  handleValidForm();
  return false;
}

function isFormValid() {
  let titleValid = checkTitle();
  let dateValid = checkDate();
  let categoryValid = checkCategory();
  return titleValid && dateValid && categoryValid;
}

function handleValidForm() {
  saveTaskToFirebase();
  showWrapperCreateTask();
  setTimeout(() => {
    closeCreateTask();
    window.location.href = 'board.html';
  }, 1000);
}

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

function checkDateNotEmpty(input2, input2Warning) {
  if (!input2?.value.trim()) {
    input2?.classList.add('input-error');
    input2Warning?.classList.remove('d-none');
    if (input2) shakeInput(input2, '');
    return false;
  }
  return true;
}

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

function showDateValidationSuccess(input2, input2Warning) {
  input2.classList.remove('input-error');
  input2Warning?.classList.add('d-none');
}

function isValidDate(value) {
  const [day, month, year] = value.split('/').map(Number);
  const dateObj = new Date(year, month - 1, day);
  return dateObj.getFullYear() === year && 
         dateObj.getMonth() + 1 === month && 
         dateObj.getDate() === day;
}

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

function validateCategorySelection(categoryDropdownSelectedRef) {
  let categoryText = getCategoryTextFromDropdown(categoryDropdownSelectedRef);
  return categoryText !== 'Select a task category';
}

function animateCategoryError(categoryDropdownSelectedRef) {
  categoryDropdownSelectedRef.classList.add('shake');
  setTimeout(() => {
    categoryDropdownSelectedRef.classList.remove('shake');
  }, 300);
}

function showCategoryError(dropdownRef, warningRef) {
  dropdownRef.classList.add('input-error');
  if (warningRef) warningRef.classList.remove('d-none');
}


function validateEditTaskForm() {
  if (!isEditFormValid()) return false;
  return true;
}

function isEditFormValid() {
  let titleValid = checkEditTitle();
  let dateValid = checkEditDate();
  return titleValid && dateValid;
}

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

function checkEditDateNotEmpty(input2, input2Warning) {
  if (!input2?.value.trim()) {
    input2?.classList.add('input-error');
    input2Warning?.classList.remove('d-none');
    if (input2) shakeInput(input2, '');
    return false;
  }
  return true;
}

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

function showEditDateValidationSuccess(input2, input2Warning) {
  input2.classList.remove('input-error');
  input2Warning?.classList.add('d-none');
}

function addEditInputErrorListeners() {
  addEditTitleInputListener();
  addEditDateInputListener();
}

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