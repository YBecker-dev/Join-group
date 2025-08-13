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
 * Sets the priority styling for the buttons.
 * @param {string} priority - The priority level ('urgent', 'medium', 'low').
 */
function setPriority(priority) {
  let urgentButton = document.getElementById('urgent');
  let mediumButton = document.getElementById('medium');
  let lowButton = document.getElementById('low');
  if (urgentButton) urgentButton.classList.remove('urgent');
  if (mediumButton) mediumButton.classList.remove('medium');
  if (lowButton) lowButton.classList.remove('low');
  if (priority === 'urgent' && urgentButton) urgentButton.classList.add('urgent');
  if (priority === 'medium' && mediumButton) mediumButton.classList.add('medium');
  if (priority === 'low' && lowButton) lowButton.classList.add('low');
}

/**
 * Sets the minimum date for the date input to today's date.
 */
function dateInputMinDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const minDate = `${dd}/${mm}/${yyyy}`;
  const dateInput = document.getElementById('date');
  dateInput.setAttribute('min', minDate);
  dateInput.value = minDate;
}

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
 * Initializes the task status from the URL query parameters.
 */
function initializeTaskStatusFromUrl() {
  let urlParams = new URLSearchParams(window.location.search);
  let statusFromUrl = urlParams.get('status');
  if (statusFromUrl) {
    window.currentTaskStatus = statusFromUrl;
  }
}

/**
 * Closes all open dropdowns when a click occurs outside of them.
 * @param {Event} event - The click event.
 */
function closeDropdownsOnOutsideClick(event) {
  if (event.defaultPrevented) return;
  let dropdownElements = getDropdownElements();
  checkAssignedToDropdown(event, dropdownElements);
  checkCategoryDropdown(event, dropdownElements);
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

/**
 * Checks and closes the "Assigned To" dropdown if a click is outside of it.
 * @param {Event} event - The click event.
 * @param {object} elements - The dropdown elements object.
 */
function checkAssignedToDropdown(event, elements) {
  if (elements.assignedToDropdown && !elements.assignedToDropdown.contains(event.target)) {
    if (elements.assignedToDropdownOptions && isDropdownOpen(elements.assignedToDropdownOptions)) {
      handleDropdown('assigned-to-dropdown-options', 'assigned-to-arrow', 'close');
      clearAssignedTo();
    }
  }
}

/**
 * Checks and closes the "Category" dropdown if a click is outside of it.
 * @param {Event} event - The click event.
 * @param {object} elements - The dropdown elements object.
 */
function checkCategoryDropdown(event, elements) {
  if (elements.categoryDropdown && !elements.categoryDropdown.contains(event.target)) {
    if (elements.categoryDropdownOptions && isDropdownOpen(elements.categoryDropdownOptions)) {
      handleDropdown('category-dropdown-options', 'category-selected-arrow', 'close');
    }
  }
}