/**
 * Opens the "Create Task" overlay or redirects to the add task page.
 * @param {Event} event - The event that triggered the function.
 * @returns {Promise<void>}
 */
async function openCreateTask(event) {
  selectedContacts = [];
  let targetStatus = getTargetStatusFromEvent(event);
  if (shouldRedirectToAddTaskPage()) {
    window.location.href = `/assets/html/add_task.html?status=${targetStatus}`;
    return;
  }
  await setupAddTaskOverlay();
  await initializeAddTaskForm(targetStatus);
}


/**
 * Closes the "Create Task" overlay with an animation.
 */
function closeCreateTask() {
  let overlayBg = document.getElementById('overlay-add-task');
  let overlayContent = document.getElementById('add-task-overlay-content');
  overlayContent.classList.remove('show');
  overlayContent.classList.add('hide');
  overlayBg.classList.remove('visible');
  removeOverlayListener(overlayContent);
  setTimeout(() => {
    overlayBg.classList.add('d-none');
    overlayContent.innerHTML = '';
    overlayContent.classList.remove('hide');
  }, 300);
}


/**
 * Removes the event listener from the overlay content.
 * @param {HTMLElement} content - The overlay content element.
 */

function removeOverlayListener(content) {
  if (window.overlayContentListener) {
    content.removeEventListener('click', window.overlayContentListener, true);
    window.overlayContentListener = null;
  }
}


/**
 * Animates the opening of the add task overlay.
 * @param {HTMLElement} overlayBg - The overlay background element.
 * @param {HTMLElement} overlayContent - The overlay content element.
 */
function animatedOpeningAddTask(overlayBg, overlayContent) {
  overlayBg.classList.remove('d-none');
  overlayBg.classList.remove('visible');
  overlayContent.classList.remove('show', 'hide');
  setTimeout(() => {
    overlayBg.classList.add('visible');
    overlayContent.classList.add('show');
  }, 10);
}
