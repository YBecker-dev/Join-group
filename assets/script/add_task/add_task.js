let urgentButton = document.getElementById('urgent');
let mediumButton = document.getElementById('medium');
let lowButton = document.getElementById('low');

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

function setupGlobalDropdownListener() {
  if (window.globalDropdownListener) {
    document.removeEventListener('click', window.globalDropdownListener);
  }
  window.globalDropdownListener = function(event) {
    closeDropdownsOnOutsideClick(event);
  };
  document.addEventListener('click', window.globalDropdownListener);
}

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

function checkAndCloseOverlayDropdowns(event) {
  let overlayAddTask = document.getElementById('overlay-add-task');
  if (!overlayAddTask || overlayAddTask.classList.contains('d-none')) return;
  let overlayContent = document.getElementById('add-task-overlay-content');
  if (!overlayContent) return;
  checkOverlayAssignedToDropdown(event, overlayContent);
  checkOverlayCategoryDropdown(event, overlayContent);
}

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

function checkOverlayCategoryDropdown(event, overlayContent) {
  let categoryDropdown = overlayContent.querySelector('#category-dropdown');
  let categoryDropdownOptions = overlayContent.querySelector('#category-dropdown-options');
  if (categoryDropdown && !categoryDropdown.contains(event.target)) {
    if (categoryDropdownOptions && isDropdownOpen(categoryDropdownOptions)) {
      handleDropdown('category-dropdown-options', 'category-selected-arrow', 'close');
    }
  }
}


function handleDropdown(dropdownId, arrowId, action = 'toggle') {
  let dropdown = document.getElementById(dropdownId);
  let arrow = arrowId ? document.getElementById(arrowId) : null;
  if (!dropdown) return;
  if (action === 'open') return setDropdownState(dropdownId, arrow, true);
  if (action === 'close') return setDropdownState(dropdownId, arrow, false);
  toggleDropdown(dropdown, dropdownId, arrow);
}

function toggleDropdown(dropdown, dropdownId, arrow) {
  let isOpen = dropdown.classList.contains('show');
  setDropdownState(dropdownId, arrow, !isOpen);
}

function setDropdownState(dropdownId, arrow, open) {
  animateDropdown(dropdownId, open);
  toggleArrowRotation(arrow, open);
  if (open) {
    clearAssignedTo();
  }
}

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

function animateDropdown(animateDropdownId, open = true) {
  if (open) {
    openDropdownWithAnimation(animateDropdownId);
  } else {
    closeDropdownWithAnimation(animateDropdownId);
  }
}

function openDropdownWithAnimation(animateDropdownId) {
  let dropdown = document.getElementById(animateDropdownId);
  if (!dropdown) return;
  setDropdownPadding(dropdown, true);
  if (dropdown.classList.contains('show') && dropdown.style.maxHeight === '305px') return;
  openDropdownAnimation(dropdown);
}

function closeDropdownWithAnimation(animateDropdownId) {
  let dropdown = document.getElementById(animateDropdownId);
  if (!dropdown) return;
  setDropdownPadding(dropdown, false);
  if (!dropdown.classList.contains('show') && !dropdown.classList.contains('expanded')) return;
  closeDropdownAnimation(dropdown);
}

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

function setDropdownPadding(dropdown, open) {
  let filllickerCategory = dropdown.querySelector('.filllicker-category');
  if (filllickerCategory) filllickerCategory.style.padding = open ? '5px' : '0';
  if (!open) {
    let filllickerAssignedTo = dropdown.querySelector('.filllicker-assigned-to');
    if (filllickerAssignedTo) filllickerAssignedTo.style.padding = '0';
  }
}

function animatedSearch(contactsRef, searchTerm) {
  if (!contactsRef.classList.contains('show')) return;
  contactsRef.classList.remove('expanded');
  let maxDropdownHeight = 305;
  let contentHeight = contactsRef.scrollHeight;
  if (searchTerm.trim() !== '' && contentHeight < maxDropdownHeight) {
    contactsRef.style.maxHeight = contentHeight + 'px';
    contactsRef.style.overflowY = 'hidden';
  } else {
    contactsRef.style.maxHeight = maxDropdownHeight + 'px';
    contactsRef.style.overflowY = 'auto';
  }
  contactsRef.classList.add('expanded');
}


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

function getDropdownHTML(searchTerm) {
  let html = `<div class="filllicker-assigned-to"></div>`;
  let lowerSearch = searchTerm.trim().toLowerCase();
  for (let i = 0; i < contacts.length; i++) {
    html += getContactDropdownHTML(i, lowerSearch);
  }
  return html;
}

function getContactDropdownHTML(i, lowerSearch) {
  if (!contacts[i] || !contacts[i].name) return '';
  let name = contacts[i].name.trim().toLowerCase();
  if (lowerSearch === '' || name.startsWith(lowerSearch)) {
    let checked = selectedContacts.includes(i) ? 'checked' : '';
    return assignedToDropdownHTML(contacts, i, checked);
  }
  return '';
}

function onContactCheckboxClick(i, checkbox) {
  changeColorIfItsChecked(i, checkbox.checked);
  toggleContactSelection(i);
  checkCheckbox(checkbox);
}

function checkCheckbox(divElement) {
  let checkbox = divElement.querySelector('input[type="checkbox"]');
  if (checkbox) {
    checkbox.checked = !checkbox.checked;
  }
}

function changeColorIfItsChecked(i, checked) {
  let userDropdownRef = document.getElementById('user-dropdown-' + i);
  let assignedContactRef = document.getElementById('assigned-contact-' + i);
  let userNameDropdownRef = document.getElementById('user-name-dropdown-' + i);
  if (!userDropdownRef || !assignedContactRef || !userNameDropdownRef) return;

  userDropdownRef.classList.toggle('checked-assigned-to', checked);
  assignedContactRef.classList.toggle('checked-assigned-to', checked);
  userNameDropdownRef.classList.toggle('checked-assigned-to', checked);
}

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

function handleCategoryOptionClick(event, optionElement) {
  eventBubbling(event);
  selectCustomOption(optionElement);
  enableCreateTaskButton();
  showError('category-dropdown-warning', 'category-dropdown-selected', true);
}

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


function showWrapperCreateTask() {
  let wrapper = document.getElementById('wrapper-create-task-section');
  if (wrapper) {
    wrapper.classList.remove('d-none');
  }
}

function initializeTaskStatusFromUrl() {
  let urlParams = new URLSearchParams(window.location.search);
  let statusFromUrl = urlParams.get('status');
  if (statusFromUrl) {
    window.currentTaskStatus = statusFromUrl;
  }
}

function closeDropdownsOnOutsideClick(event) {
  if (event.defaultPrevented) return;
  let dropdownElements = getDropdownElements();
  checkAssignedToDropdown(event, dropdownElements);
  checkCategoryDropdown(event, dropdownElements);
}

function getDropdownElements() {
  return {
    assignedToDropdown: document.getElementById('assigned-to-dropdown'),
    categoryDropdown: document.getElementById('category-dropdown'),
    assignedToDropdownOptions: document.getElementById('assigned-to-dropdown-options'),
    categoryDropdownOptions: document.getElementById('category-dropdown-options')
  };
}

function checkAssignedToDropdown(event, elements) {
  if (elements.assignedToDropdown && !elements.assignedToDropdown.contains(event.target)) {
    if (elements.assignedToDropdownOptions && isDropdownOpen(elements.assignedToDropdownOptions)) {
      handleDropdown('assigned-to-dropdown-options', 'assigned-to-arrow', 'close');
      clearAssignedTo();
    }
  }
}

function checkCategoryDropdown(event, elements) {
  if (elements.categoryDropdown && !elements.categoryDropdown.contains(event.target)) {
    if (elements.categoryDropdownOptions && isDropdownOpen(elements.categoryDropdownOptions)) {
      handleDropdown('category-dropdown-options', 'category-selected-arrow', 'close');
    }
  }
}