function isInputEmpty(inputElement) {
  if (inputElement.value.trim() === '') {
    return true;
  }
  return false;
}

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

function toggleWarning(warningElement, fieldIsEmpty) {
  if (fieldIsEmpty) {
    warningElement.classList.remove('d-none');
  } else {
    warningElement.classList.add('d-none');
  }
}

function areAllFieldsFilled(title, date, categoryText) {
  let categoryChosen = categoryText !== '' && categoryText !== 'Select a task category';
  return title.value.trim() !== '' && date.value.trim() !== '' && categoryChosen;
}

function checkInputsFilled(inputs) {
  for (let i = 0; i < inputs.length; i++) {
    if (!inputs[i].value.trim()) {
      return false;
    }
  }
  return true;
}

function preventEnterSubmit(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    return false;
  }
}

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

function clearRedBorder() {
  let inputs = document.querySelectorAll('.input-error');
  inputs.forEach(input => {
    input.classList.remove('input-error');
  });
}

function clearCheckedContacts() {
  let selected = [...selectedContacts];
  for (let i = 0; i < selected.length; i++) {
    toggleContactSelection(selected[i]);
  }
}

function clearSubtaskInput() {
  let input = document.getElementById('add-task-input4');
  if (input) input.value = '';
}

function clearAssignedTo() {
  let input = document.getElementById('add-task-input3');
  if (input) input.value = '';
}

function clearSubtaskElements() {
  let container = document.getElementById('subtasks-container');
  if (container) container.innerHTML = '';
}

function clearInputTexts() {
  let inputText = document.getElementById('add-task-form');
  if (inputText) inputText.reset();
}

function clearWarningMessages() {
  let warnings = document.getElementsByClassName('input-warning');
  for (let i = 0; i < warnings.length; i++) {
    warnings[i].classList.add('d-none');
  }
}

function clearCategory() {
  let category = document.getElementById('category-dropdown-selected');
  if (category) {
    let p = category.querySelector('p');
    if (p) p.textContent = 'Select a task category';
  }
}

function buildSubtaskDiv(newText) {
  let subtaskDiv = document.createElement('div');
  subtaskDiv.setAttribute('onclick', 'editSubtask(this)');
  subtaskDiv.className = 'subtask-item';
  subtaskDiv.innerHTML = saveSubtaskEditHTML(newText);
  return subtaskDiv;
}

function handleFirstSlash(value, date) {
  if (value.length > lastDateLength && /^\d{2}$/.test(value)) {
    value += '/';
    date.value = value;
  }
  return value;
}

function handleSecondSlash(value, date) {
  if (value.length > lastDateLength && /^\d{2}\/\d{2}$/.test(value)) {
    value += '/';
    date.value = value;
  }
  return value;
}

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

function handleMonthCorrection(parts, date) {
  if (parts.length >= 2 && parts[1].length === 2) {
    let month = Number(parts[1]);
    if (month > 12) {
      parts[1] = '12';
      date.value = parts.join('/');
    }
  }
}

function getLimitedDateParts(value) {
  let parts = value.split('/');
  let day = Number(String(parts[0]).slice(0, 2));
  let month = Number(String(parts[1]).slice(0, 2));
  let year = Number(String(parts[2]).slice(0, 4));
  return [day, month, year];
}

function correctDay(day, month, year) {
  let maxDay = new Date(year, month, 0).getDate();
  let correctedDay = Math.max(1, Math.min(maxDay, day));
  return correctedDay;
}

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

function buildDateString(day, month, year) {
  let d = String(day).padStart(2, '0');
  let m = String(month).padStart(2, '0');
  let y = year;
  let result = `${d}/${m}/${y}`;
  return result;
}

function autoInsertSlashes(date) {
  let value = date.value.replace(/[^\d\/]/g, '');
  value = handleFirstSlash(value, date);
  value = handleSecondSlash(value, date);
  lastDateLength = value.length;
  let parts = value.split('/');
  handleDayCorrection(parts, date);
  handleMonthCorrection(parts, date);
}

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

function sanitizeAndValidateDate(date) {
  date.value = date.value.replace(/[A-Za-z]/g, '');
  autoInsertSlashes(date);
  validateAndCorrectDate(date);
}