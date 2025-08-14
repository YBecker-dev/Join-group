let urgentButton = document.getElementById('urgent');
let mediumButton = document.getElementById('medium');
let lowButton = document.getElementById('low');

/**
 * Initializes the "Add Task" page.
 * Loads contacts, sets up priority, and adds event listeners.
 */
async function initAddTask() {
  selectedContacts = [];
  await loadContacts();
  initFrameworkFunctions();
  setPriority('medium');
  initializeTaskStatusFromUrl();
  addFormValidation('add-task-form');
  addInputErrorListeners();
  setupGlobalDropdownListener();
  setupOverlaySpecificListener();
  dateInputMinDate();
}

/**
 * Sets up a global click listener to close dropdowns when clicking outside.
 */
function setupGlobalDropdownListener() {
  if (window.globalDropdownListener) {
    document.removeEventListener('click', window.globalDropdownListener);
  }
  window.globalDropdownListener = function (event) {
    closeDropdownsOnOutsideClick(event);
  };
  document.addEventListener('click', window.globalDropdownListener);
}

/**
 * Sets up a specific listener for dropdowns within an overlay.
 */
function setupOverlaySpecificListener() {
  let overlayAddTask = document.getElementById('overlay-add-task');
  let isInOverlay = overlayAddTask && !overlayAddTask.classList.contains('d-none');
  if (isInOverlay) {
    let overlayContent = document.getElementById('add-task-overlay-content');
    if (overlayContent && !window.overlayContentListener) {
      window.overlayContentListener = function (event) {
        setTimeout(() => {
          checkAndCloseOverlayDropdowns(event);
        }, 0);
      };
      overlayContent.addEventListener('click', window.overlayContentListener, true);
    }
  }
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
 * Adds input listeners to clear errors on input for the main form.
 */
function addInputErrorListeners() {
  addTitleInputListener();
  addDateInputListener();
  addDescriptionInputListener();
}

/**
 * Sets the minimum date for the date input to today's date.
 * Does NOT set today's date as default value anymore.
 */
function dateInputMinDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const minDate = `${dd}/${mm}/${yyyy}`;
  const dateInput = document.getElementById('date');
  dateInput.setAttribute('min', minDate);
  // Removed: dateInput.value = minDate; - Date field now starts empty
}

/**
 * Sets today's date in the date input field when the user clicks the date icon.
 * This function is simple and easy to understand for beginners.
 */
function setTodaysDate() {
  // Get today's date
  const today = new Date();
  
  // Get the year (like 2024)
  const year = today.getFullYear();
  
  // Get the month (0-11, so we add 1) and make it 2 digits
  const month = String(today.getMonth() + 1).padStart(2, '0');
  
  // Get the day and make it 2 digits
  const day = String(today.getDate()).padStart(2, '0');
  
  // Create the date string in DD/MM/YYYY format
  const todaysDate = `${day}/${month}/${year}`;
  
  // Find the date input field and put today's date in it
  const dateInput = document.getElementById('date');
  if (dateInput) {
    dateInput.value = todaysDate;
    
    // Remove any error styling if present
    const warningElement = document.getElementById('add-task-input2-warning');
    if (warningElement) {
      warningElement.classList.add('d-none');
    }
    dateInput.classList.remove('input-error');
    
    // Enable the create button since we now have a date
    enableCreateTaskButton();
  }
}
