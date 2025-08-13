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
