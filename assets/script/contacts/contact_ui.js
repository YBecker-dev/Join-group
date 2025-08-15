/**
 * Opens a small editing overlay to edit or delete contacts in the mobile version.
 */
function showMobileEditOverlay(indexDetails) {
  let overlayRef = document.getElementById('editContact-Overlay');
  
  if (overlayRef.classList.contains('d-none')) {
    openMobileOverlay(overlayRef, indexDetails);
  } else {
    closeMobileOverlay(overlayRef);
  }
}

/**
 * Opens mobile edit overlay with animation
 */
function openMobileOverlay(overlayRef, indexDetails) {
  overlayRef.classList.remove('d-none');
  overlayRef.innerHTML = getNoteTemplateMobileEditOverlay(indexDetails);
  setTimeout(() => {
    let mobileOverlay = document.getElementById('editDeleteOverlayMobile');
    if (mobileOverlay) {
      mobileOverlay.classList.add('slide-in-mobile');
    }
  }, 10);
}

/**
 * Closes mobile edit overlay with animation
 */
function closeMobileOverlay(overlayRef) {
  let mobileOverlay = document.getElementById('editDeleteOverlayMobile');
  if (mobileOverlay) {
    mobileOverlay.classList.add('slide-out-mobile');
    setTimeout(() => {
      overlayRef.classList.add('d-none');
      overlayRef.innerHTML = '';
    }, 300);
  }
}

/**
 * Opens an overlay from the template to create new contacts.
 */
function toggleContactOverlay() {
  let overlayRef = document.getElementById('add-new-contact');
  if (overlayRef.classList.contains('d-none')) {
    overlayRef.classList.remove('d-none');
    overlayRef.innerHTML = getNoteTemplateAddNewContact();
  } else {
    overlayRef.classList.add('d-none');
    overlayRef.innerHTML = '';
  }
}

/**
 * Indicates when a contact has been successfully created.
 */
function toggleSuccessfullOverlay() {
  let overlayElements = setupSuccessOverlay();
  showSuccessOverlay(overlayElements.overlayRef);
  animateSuccessOverlay(overlayElements.overlayContentDiv);
  hideSuccessOverlayAfterDelay(overlayElements);
}

/**
 * Sets up success overlay elements and content
 */
function setupSuccessOverlay() {
  let overlayRef = document.getElementById('successfully-Overlay');
  let overlayContent = document.getElementById('successWraper');
  overlayContent.innerHTML = getNoteTemplateSuccesfullOverlay();
  let overlayContentDiv = document.getElementById('successfully');
  return { overlayRef, overlayContent, overlayContentDiv };
}

/**
 * Shows success overlay
 */
function showSuccessOverlay(overlayRef) {
  overlayRef.classList.toggle('d-none');
}

/**
 * Animates success overlay with slide in/out
 */
function animateSuccessOverlay(overlayContentDiv) {
  setTimeout(() => {
    overlayContentDiv.classList.add('slide-in');
  }, 10);
  setTimeout(() => {
    overlayContentDiv.classList.remove('slide-in');
    overlayContentDiv.classList.add('slide-out');
  }, 2000);
}

/**
 * Hides success overlay after delay
 */
function hideSuccessOverlayAfterDelay(overlayElements) {
  setTimeout(() => {
    overlayElements.overlayRef.classList.add('d-none');
    overlayElements.overlayContent.innerHTML = '';
  }, 3000);
}

/**
 * Closes all overlays, both desktop and mobile versions.
 */
function closeOverlay() {
  let overlayRef = document.getElementById('add-new-contact');
  let contentOverlayRef = document.getElementById('edit-contact');
  if (overlayRef) {
    overlayRef.classList.add('d-none');
    overlayRef.innerHTML = '';
  }
  if (contentOverlayRef) {
    contentOverlayRef.classList.add('d-none');
    contentOverlayRef.innerHTML = '';
  }
}

/**
 * Opens the contact editing overlay
 */
function openEditOverlay(index) {
  let contentOverlayRef = document.getElementById('edit-contact');
  contentOverlayRef.classList.remove('d-none');
  contentOverlayRef.innerHTML = getNoteTemplateEditContact(index);
}