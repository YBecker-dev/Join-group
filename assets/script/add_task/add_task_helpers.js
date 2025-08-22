/**
 * Toggles the priority button state.
 * @param {string} priority - The priority level ('urgent', 'medium', 'low').
 * @param {string} prefix - An optional prefix for the button IDs.
 */
function togglePriority(priority, prefix = '') {
  let ids = [prefix + 'urgent', prefix + 'medium', prefix + 'low'];
  for (let i = 0; i < ids.length; i++) {
    let btn = document.getElementById(ids[i]);
    if (btn) btn.classList.remove('active', 'urgent', 'medium', 'low');
  }
  let selectedBtn = document.getElementById(prefix + priority.toLowerCase());
  if (selectedBtn) selectedBtn.classList.add('active', priority.toLowerCase());
  if (!prefix) setPriority(priority);
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
    return getDatePartsFromToday(today);
  } else if (inputDate > maxDate) {
    return getMaxDateParts();
  }
  return [day, month, year];
}

/**
 * Extracts day, month, and year parts from today's date.
 * @param {Date} today - Today's date object.
 * @returns {number[]} Array with [day, month, year].
 */
function getDatePartsFromToday(today) {
  let day = today.getDate();
  let month = today.getMonth() + 1;
  let year = today.getFullYear();
  return [day, month, year];
}

/**
 * Returns the maximum allowed date parts (31/12/2035).
 * @returns {number[]} Array with [31, 12, 2035].
 */
function getMaxDateParts() {
  let day = 31;
  let month = 12;
  let year = 2035;
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
 * Adds an input listener for the title field to clear errors.
 */
function addTitleInputListener() {
  let titleInput = document.querySelector('input[name="add-task-input1"]');
  if (titleInput) {
    titleInput.addEventListener('input', function () {
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
    dateInput.addEventListener('input', function () {
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
    descriptionInput.addEventListener('input', function () {
      clearInputError(this);
    });
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
 * Gets the category text from a dropdown element.
 * @param {HTMLElement} dropdownRef - The dropdown element.
 * @returns {string} The category text.
 */
function getCategoryTextFromDropdown(dropdownRef) {
  let categoryTextRef = dropdownRef.querySelector('p');
  if (categoryTextRef) {
    return categoryTextRef.textContent.trim();
  }
  return '';
}
