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
  window.globalDropdownListener = function(event) {
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
      window.overlayContentListener = function(event) {
        setTimeout(() => {
          checkAndCloseOverlayDropdowns(event);
        }, 0);
      };
      overlayContent.addEventListener('click', window.overlayContentListener, true);
    }
  }
}

/**
 * Checks and closes dropdowns within an overlay.
 * @param {Event} event - The click event.
 */
function checkAndCloseOverlayDropdowns(event) {
  let overlayAddTask = document.getElementById('overlay-add-task');
  if (!overlayAddTask || overlayAddTask.classList.contains('d-none')) return;
  let overlayContent = document.getElementById('add-task-overlay-content');
  if (!overlayContent) return;
  checkOverlayAssignedToDropdown(event, overlayContent);
  checkOverlayCategoryDropdown(event, overlayContent);
}

/**
 * Checks and closes the "Assigned To" dropdown in an overlay.
 * @param {Event} event - The click event.
 * @param {HTMLElement} overlayContent - The overlay content element.
 */
function checkOverlayAssignedToDropdown(event, overlayContent) {
  let assignedToDropdown = overlayContent.querySelector('#assigned-to-dropdown');
  let assignedToDropdownOptions = overlayContent.querySelector('#assigned-to-dropdown-options');
  if (assignedToDropdown && !assignedToDropdown.contains(event.target)) {
    if (assignedToDropdownOptions && isDropdownOpen(assignedToDropdownOptions)) {
      handleDropdown('assigned-to-dropdown-options', 'assigned-to-arrow', 'close');
      clearAssignedTo();
    }
  }
}

/**
 * Checks and closes the "Category" dropdown in an overlay.
 * @param {Event} event - The click event.
 * @param {HTMLElement} overlayContent - The overlay content element.
 */
function checkOverlayCategoryDropdown(event, overlayContent) {
  let categoryDropdown = overlayContent.querySelector('#category-dropdown');
  let categoryDropdownOptions = overlayContent.querySelector('#category-dropdown-options');
  if (categoryDropdown && !categoryDropdown.contains(event.target)) {
    if (categoryDropdownOptions && isDropdownOpen(categoryDropdownOptions)) {
      handleDropdown('category-dropdown-options', 'category-selected-arrow', 'close');
    }
  }
}

/**
 * Handles the state of a dropdown menu (open, close, or toggle).
 * @param {string} dropdownId - The ID of the dropdown options container.
 * @param {string} arrowId - The ID of the arrow icon.
 * @param {string} action - The action to perform ('open', 'close', or 'toggle').
 */
function handleDropdown(dropdownId, arrowId, action = 'toggle') {
  let dropdown = document.getElementById(dropdownId);
  let arrow = arrowId ? document.getElementById(arrowId) : null;
  if (!dropdown) return;
  if (action === 'open') return setDropdownState(dropdownId, arrow, true);
  if (action === 'close') return setDropdownState(dropdownId, arrow, false);
  toggleDropdown(dropdown, dropdownId, arrow);
}

/**
 * Toggles a dropdown's open/close state.
 * @param {HTMLElement} dropdown - The dropdown element.
 * @param {string} dropdownId - The ID of the dropdown.
 * @param {HTMLElement} arrow - The arrow icon element.
 */
function toggleDropdown(dropdown, dropdownId, arrow) {
  let isOpen = dropdown.classList.contains('show');
  setDropdownState(dropdownId, arrow, !isOpen);
}

/**
 * Sets the state of a dropdown (open or closed).
 * @param {string} dropdownId - The ID of the dropdown.
 * @param {HTMLElement} arrow - The arrow icon element.
 * @param {boolean} open - True to open, false to close.
 */
function setDropdownState(dropdownId, arrow, open) {
  animateDropdown(dropdownId, open);
  toggleArrowRotation(arrow, open);
  if (open) {
    clearAssignedTo();
  }
}

/**
 * Toggles the rotation of a dropdown arrow.
 * @param {HTMLElement} arrow - The arrow icon element.
 * @param {boolean} isOpen - True if the dropdown is open.
 */
function toggleArrowRotation(arrow, isOpen) {
  if (arrow) {
    if (isOpen) {
      arrow.style.transform = 'rotate(180deg)';
      arrow.classList.add('arrow-hover');
    } else {
      arrow.style.transform = 'rotate(0deg)';
      arrow.classList.remove('arrow-hover');
    }
  }
}

/**
 * Animates the opening or closing of a dropdown.
 * @param {string} animateDropdownId - The ID of the dropdown element.
 * @param {boolean} open - True to open, false to close.
 */
function animateDropdown(animateDropdownId, open = true) {
  if (open) {
    openDropdownWithAnimation(animateDropdownId);
  } else {
    closeDropdownWithAnimation(animateDropdownId);
  }
}

/**
 * Opens a dropdown with an animation.
 * @param {string} animateDropdownId - The ID of the dropdown element.
 */
function openDropdownWithAnimation(animateDropdownId) {
  let dropdown = document.getElementById(animateDropdownId);
  if (!dropdown) return;
  setDropdownPadding(dropdown, true);
  if (dropdown.classList.contains('show') && dropdown.style.maxHeight === '305px') return;
  openDropdownAnimation(dropdown);
}

/**
 * Closes a dropdown with an animation.
 * @param {string} animateDropdownId - The ID of the dropdown element.
 */
function closeDropdownWithAnimation(animateDropdownId) {
  let dropdown = document.getElementById(animateDropdownId);
  if (!dropdown) return;
  setDropdownPadding(dropdown, false);
  if (!dropdown.classList.contains('show') && !dropdown.classList.contains('expanded')) return;
  closeDropdownAnimation(dropdown);
}

/**
 * Performs the closing animation for a dropdown.
 * @param {HTMLElement} dropdown - The dropdown element.
 */
function closeDropdownAnimation(dropdown) {
  dropdown.classList.remove('show', 'hidden');
  dropdown.classList.add('closing');
  setTimeout(() => {
    dropdown.classList.remove('closing', 'expanded');
    dropdown.classList.add('hidden');
    dropdown.style.maxHeight = '';
    dropdown.style.opacity = '';
  }, 300);
}

/**
 * Performs the opening animation for a dropdown.
 * @param {HTMLElement} dropdown - The dropdown element.
 */
function openDropdownAnimation(dropdown) {
  dropdown.classList.add('show', 'expanded');
  dropdown.classList.remove('hidden');
  dropdown.style.maxHeight = '0';
  dropdown.style.opacity = '0';
  setTimeout(() => {
    dropdown.style.maxHeight = '305px';
    dropdown.style.opacity = '1';
  }, 50);
}

/**
 * Sets the padding for dropdown items.
 * @param {HTMLElement} dropdown - The dropdown element.
 * @param {boolean} open - True for open state, false for closed.
 */
function setDropdownPadding(dropdown, open) {
  let filllickerCategory = dropdown.querySelector('.filllicker-category');
  if (filllickerCategory) filllickerCategory.style.padding = open ? '5px' : '0';
  if (!open) {
    let filllickerAssignedTo = dropdown.querySelector('.filllicker-assigned-to');
    if (filllickerAssignedTo) filllickerAssignedTo.style.padding = '0';
  }
}

/**
 * Animates the dropdown based on search results.
 * @param {HTMLElement} contactsRef - The contacts dropdown element.
 * @param {string} searchTerm - The search term.
 */
function animatedSearch(contactsRef, searchTerm) {
  if (!contactsRef.classList.contains('show')) return;
  contactsRef.classList.remove('expanded');
  let maxDropdownHeight = 305;
  let contentHeight = contactsRef.scrollHeight;
  if (searchTerm.trim() !== '' && contentHeight < maxDropdownHeight) {
    contactsRef.style.maxHeight = contentHeight + 'px';
  } else {
    contactsRef.style.maxHeight = maxDropdownHeight + 'px';
  }
  contactsRef.classList.add('expanded');
}

/**
 * Renders the "Assigned To" dropdown with contacts, optionally filtered by a search term.
 * @param {string} searchTerm - The search term to filter contacts.
 */
function assignedToDropdown(searchTerm = '') {
  let contactsRef = document.getElementById('assigned-to-dropdown-options');
  if (!contactsRef || !Array.isArray(contacts)) return;
  let html = getDropdownHTML(searchTerm);
  contactsRef.innerHTML = html;
  let filllicker = contactsRef.querySelector('.filllicker-assigned-to');
  if (filllicker) {
    filllicker.style.padding = contactsRef.classList.contains('show') ? '5px' : '0';
  }
  animatedSearch(contactsRef, searchTerm);
}

/**
 * Generates the HTML for the contacts dropdown.
 * @param {string} searchTerm - The search term.
 * @returns {string} The HTML string.
 */
function getDropdownHTML(searchTerm) {
  let html = `<div class="filllicker-assigned-to"></div>`;
  let lowerSearch = searchTerm.trim().toLowerCase();
  for (let i = 0; i < contacts.length; i++) {
    html += getContactDropdownHTML(i, lowerSearch);
  }
  return html;
}

/**
 * Generates the HTML for a single contact in the dropdown.
 * @param {number} i - The index of the contact.
 * @param {string} lowerSearch - The lowercase search term.
 * @returns {string} The HTML string for the contact.
 */
function getContactDropdownHTML(i, lowerSearch) {
  if (!contacts[i] || !contacts[i].name) return '';
  let name = contacts[i].name.trim().toLowerCase();
  if (lowerSearch === '' || name.startsWith(lowerSearch)) {
    let checked = selectedContacts.includes(i) ? 'checked' : '';
    return assignedToDropdownHTML(contacts, i, checked);
  }
  return '';
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
  let html = '';
  for (let i = 0; i < selectedContacts.length; i++) {
    const contact = contacts[selectedContacts[i]];
    html += showContactsAddTaskHtml(contact);
  }
  container.innerHTML = html;
}

/**
 * Selects a custom category option and updates the UI.
 * @param {HTMLElement} element - The category option element.
 */
function selectCustomOption(element) {
  let categoryDropdown = document.getElementById('category-dropdown-selected');
  if (!categoryDropdown) return;
  let p = categoryDropdown.querySelector('p');
  if (p) p.textContent = element.textContent;
  
  categoryDropdown.classList.remove('input-error');
  let categoryWarning = document.getElementById('category-dropdown-warning');
  if (categoryWarning) categoryWarning.classList.add('d-none');
  
  handleDropdown('category-dropdown-options', 'category-selected-arrow', 'close');
}

/**
 * Handles the click event on a category option.
 * @param {Event} event - The click event.
 * @param {HTMLElement} optionElement - The category option element.
 */
function handleCategoryOptionClick(event, optionElement) {
  eventBubbling(event);
  selectCustomOption(optionElement);
  enableCreateTaskButton();
  showError('category-dropdown-warning', 'category-dropdown-selected', true);
}

///**
// * Toggles the priority button state.
// * @param {string} priority - The priority level ('urgent', 'medium', 'low').
// * @param {string} prefix - An optional prefix for the button IDs.
// */
//function togglePriority(priority, prefix = '') {
//  let ids = [prefix + 'urgent', prefix + 'medium', prefix + 'low'];
//  for (let i = 0; i < ids.length; i++) {
//    let btn = document.getElementById(ids[i]);
//    if (btn) btn.classList.remove('active', 'urgent', 'medium', 'low');
//  }
//  let selectedBtn = document.getElementById(prefix + priority.toLowerCase());
//  if (selectedBtn) selectedBtn.classList.add('active', priority.toLowerCase());
//  if (!prefix) setPriority(priority);
//}
//
///**
// * Sets the priority styling for the buttons.
// * @param {string} priority - The priority level ('urgent', 'medium', 'low').
// */
//function setPriority(priority) {
//  let urgentButton = document.getElementById('urgent');
//  let mediumButton = document.getElementById('medium');
//  let lowButton = document.getElementById('low');
//  if (urgentButton) urgentButton.classList.remove('urgent');
//  if (mediumButton) mediumButton.classList.remove('medium');
//  if (lowButton) lowButton.classList.remove('low');
//  if (priority === 'urgent' && urgentButton) urgentButton.classList.add('urgent');
//  if (priority === 'medium' && mediumButton) mediumButton.classList.add('medium');
//  if (priority === 'low' && lowButton) lowButton.classList.add('low');
//}
//
///**
// * Sets the minimum date for the date input to today's date.
// */
//function dateInputMinDate() {
//  const today = new Date();
//  const yyyy = today.getFullYear();
//  const mm = String(today.getMonth() + 1).padStart(2, '0');
//  const dd = String(today.getDate()).padStart(2, '0');
//  const minDate = `${dd}/${mm}/${yyyy}`;
//  const dateInput = document.getElementById('date');
//  dateInput.setAttribute('min', minDate);
//  dateInput.value = minDate;
//}
//
///**
// * Shows the "Create Task" wrapper section.
// */
//function showWrapperCreateTask() {
//  let wrapper = document.getElementById('wrapper-create-task-section');
//  if (wrapper) {
//    wrapper.classList.remove('d-none');
//  }
//}
//
///**
// * Initializes the task status from the URL query parameters.
// */
//function initializeTaskStatusFromUrl() {
//  let urlParams = new URLSearchParams(window.location.search);
//  let statusFromUrl = urlParams.get('status');
//  if (statusFromUrl) {
//    window.currentTaskStatus = statusFromUrl;
//  }
//}
//
///**
// * Closes all open dropdowns when a click occurs outside of them.
// * @param {Event} event - The click event.
// */
//function closeDropdownsOnOutsideClick(event) {
//  if (event.defaultPrevented) return;
//  let dropdownElements = getDropdownElements();
//  checkAssignedToDropdown(event, dropdownElements);
//  checkCategoryDropdown(event, dropdownElements);
//}
//
///**
// * Gets references to all relevant dropdown elements.
// * @returns {object} An object containing the dropdown elements.
// */
//function getDropdownElements() {
//  return {
//    assignedToDropdown: document.getElementById('assigned-to-dropdown'),
//    categoryDropdown: document.getElementById('category-dropdown'),
//    assignedToDropdownOptions: document.getElementById('assigned-to-dropdown-options'),
//    categoryDropdownOptions: document.getElementById('category-dropdown-options')
//  };
//}
//
///**
// * Checks and closes the "Assigned To" dropdown if a click is outside of it.
// * @param {Event} event - The click event.
// * @param {object} elements - The dropdown elements object.
// */
//function checkAssignedToDropdown(event, elements) {
//  if (elements.assignedToDropdown && !elements.assignedToDropdown.contains(event.target)) {
//    if (elements.assignedToDropdownOptions && isDropdownOpen(elements.assignedToDropdownOptions)) {
//      handleDropdown('assigned-to-dropdown-options', 'assigned-to-arrow', 'close');
//      clearAssignedTo();
//    }
//  }
//}
//
///**
// * Checks and closes the "Category" dropdown if a click is outside of it.
// * @param {Event} event - The click event.
// * @param {object} elements - The dropdown elements object.
// */
//function checkCategoryDropdown(event, elements) {
//  if (elements.categoryDropdown && !elements.categoryDropdown.contains(event.target)) {
//    if (elements.categoryDropdownOptions && isDropdownOpen(elements.categoryDropdownOptions)) {
//      handleDropdown('category-dropdown-options', 'category-selected-arrow', 'close');
//    }
//  }
//}