let currentSelectedIndex = null;

/**
 * contacts are loaded and displayed in HTML
 */
async function initContacts() {
  await loadContacts();
  renderContacts();
  initFrameworkFunctions();
}

/**
 * Initials of all contacts are displayed.
 */
function getInitials(name) {
  if (!name) return '??';
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
}

/**
 * Loads contacts from ContactTemplate into contact.html in alphabetical order.
 */
function renderContacts() {
  let contentRef = document.getElementById('contactContent');
  if (!contentRef) return;

  let groupedContacts = groupContactsByInitial(contacts);
  let html = buildContactsHTML(groupedContacts);
  contentRef.innerHTML = html;
}

/**
 * Builds HTML string for all contacts grouped by initials
 */
function buildContactsHTML(groupedContacts) {
  let html = '';
  let initials = Object.keys(groupedContacts).sort();
  
  for (let index = 0; index < initials.length; index++) {
    let initial = initials[index];
    html += buildInitialGroupHTML(initial, groupedContacts[initial]);
  }
  return html;
}

/**
 * Builds HTML for a single initial group with its contacts
 */
function buildInitialGroupHTML(initial, contactIndices) {
  let html = ` <div class="agenda">
                <div class="agenda-category"><p>${initial}</p></div>
                <div class="agenda-line"></div>
              </div>`;
  for (let i = 0; i < contactIndices.length; i++) {
    html += getNoteTemplateContact(contactIndices[i]);
  }
  return html;
}

/**
 * Ensures that contacts are sorted alphabetically
 */
function groupContactsByInitial(contacts) {
  let groups = createInitialGroups(contacts);
  return sortGroupsByInitial(groups);
}

/**
 * Creates groups of contacts by their initial letter
 */
function createInitialGroups(contacts) {
  let groups = {};
  for (let i = 0; i < contacts.length; i++) {
    let name = contacts[i].name || '';
    let initial = name.charAt(0).toUpperCase();
    if (!groups[initial]) groups[initial] = [];
    groups[initial].push(i);
  }
  return groups;
}

/**
 * Sorts contact groups alphabetically by initial
 */
function sortGroupsByInitial(groups) {
  let sortedGroups = {};
  Object.keys(groups)
    .sort()
    .forEach((key) => {
      sortedGroups[key] = groups[key];
    });
  return sortedGroups;
}

/**
 * Ensures that newly created contacts are assigned a color.
 */
function changeContactColorIfSelected(index, isSelected) {
  let openDetails = document.querySelector(`[onclick*="openDetails(${index})"]`);
  if (openDetails) {
    if (window.innerWidth >= 1440) {
      if (isSelected) {
        openDetails.classList.add('active');
      } else {
        openDetails.classList.remove('active');
      }
    }
  }
}

/**
 * Opens a contact in the detail view.
 */
function openDetails(index) {
  let allContacts = document.querySelectorAll('.person');
  let details = document.getElementById('contactDetails');
  if (currentSelectedIndex === index) {
    closeContactDetails(allContacts, details);
    return;
  }
  allContacts.forEach((contact) => contact.classList.remove('active'));
  details.classList.remove('show');
  details.classList.add('hide');
  currentSelectedIndex = index;
  setanimation(details, index);
}

/**
 * Close the Edit Overlay after making changes
 */
function closeContactDetails(allContacts, details) {
  allContacts.forEach((contact) => contact.classList.remove('active'));
  details.classList.remove('show');
  details.classList.add('hide');
  setTimeout(() => {
    details.innerHTML = '';
  }, 300);
  currentSelectedIndex = null;
}

/**
 * Ensures that contacts open with a slight delay and load completely to prevent jerkiness
 */
function setanimation(details, index) {
  setTimeout(() => {
    details.innerHTML = getNoteTemplateContactDetails(index);
    details.classList.remove('hide');
    setTimeout(() => {
      details.classList.add('show');
      setTimeout(() => {
        changeContactColorIfSelected(index, true);
      }, 300);
    }, 10);
  }, 20);
}

/**
 * closes the details in the mobile version
 */
function closeDetails() {
  closeMobileDetailsView();
  removeActiveStatesOnMobile();
  currentSelectedIndex = null;
}

/**
 * Closes mobile details view elements
 */
function closeMobileDetailsView() {
  let contentCloseDetails = document.getElementById('namesDetails');
  let overlayBtn = document.getElementById('showOverlayBtn');
  if (contentCloseDetails) {
    overlayBtn.classList.toggle('d-none');
    contentCloseDetails.classList.add('d-none');
    contentCloseDetails.innerHTML = '';
  }
}

/**
 * Removes active states from elements on mobile
 */
function removeActiveStatesOnMobile() {
  if (window.innerWidth < 1440) {
    document.querySelectorAll('.active').forEach(function (element) {
      element.classList.remove('active');
    });
  }
}

/**
 * assigns colors when a new contact is created
 */
function getRandomColor() {
  return (
    '#' +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')
  );
}