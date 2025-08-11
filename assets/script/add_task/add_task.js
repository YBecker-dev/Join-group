selectedContacts = [];
let lastValidDate = '';
let lastDateLength = 0;
let urgentButton = document.getElementById('urgent');
let mediumButton = document.getElementById('medium');
let lowButton = document.getElementById('low');

async function initAddTask() {
  selectedContacts = [];
  await loadContacts();
  initFrameworkFunctions();
  setPriority('medium');
  addFormValidation('add-task-form');
  addInputErrorListeners();
  document.addEventListener('click', function () {
    handleDropdown('assigned-to-dropdown-options', 'assigned-to-arrow', 'close');
    handleDropdown('category-dropdown-options', 'category-selected-arrow', 'close');
    clearAssignedTo();
  });
  dateInputMinDate();
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

function deleteSubtask(element) {
  let subtaskItem = element.closest('.subtask-item');
  let editSubtaskItem = element.closest('.subtask-item-edit');
  if (subtaskItem) subtaskItem.remove();
  if (editSubtaskItem) editSubtaskItem.remove();
}

function showPlusIcon() {
  let iconSpan = document.getElementById('subtasks-icon');
  if (iconSpan) {
    iconSpan.innerHTML = `
      <img src="/assets/img/icon/add_task_icon/plus.png" alt="Add" onclick="pushSubtaskInput(event)">
    `;
  }
}

function onSubtaskInputChange() {
  let input = document.getElementById('add-task-input4');
  if (input && input.value.trim()) {
    showSaveCancelIcons();
  } else {
    showPlusIcon();
  }
}

function showSaveCancelIcons() {
  let iconSpan = document.getElementById('subtasks-icon');
  if (iconSpan) {
    iconSpan.innerHTML = showSaveCancelIconsHtml();
  }
}

function onSubtaskInputKeydown(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    pushSubtaskInput(event);
  }
}

function showWrapperCreateTask() {
  let wrapper = document.getElementById('wrapper-create-task-section');
  if (wrapper) {
    wrapper.classList.remove('d-none');
  }
}