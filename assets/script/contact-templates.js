// Contact Overview
function getNoteTemplateContact(index) {
  let user = contacts[index];

  return ` <div onclick="openDetails(${index}), event.stopPropagation()" class="person">
              <p class="initial" style="background-color: ${user.color}">${user.initials}</p>
              <div class="person-details">
                <p class="contact-name">${user.name}</p>
                <p>
                  <a class="mail">${user.email}</a>
                </p>
              </div>
            </div>`;
}

// view Contact
function getNoteTemplateContactDetails(indexDetails) {
  let user = contacts[indexDetails];

  return `  <div class="namesDetails" id="namesDetails">
              <div class="contactHeadlineMobile">
                <div class="headlineMobile">
                  <h2>Contacts</h2>
                  <span class="team">Better with a team</span>
                  <div class="separatingLineMobile"></div>
                </div>
                <img class="showArrowMobile" onclick="closeDetails()" src="../img/icon/arrow-left.png" alt="Arrow - back to Contact List">
              </div>
              <div class="contactInformations">
                <p class="initialOverlay" style="background-color: ${user.color}">${user.initials}</p>
                
                <div class="contactDetails">
                  <h3 class="infoNames">${user.name}</h3>
                  <div class="contactIcons">
                    <div id="editOverlay" onclick="openEditOverlay(${indexDetails})">
                      <img class="editIcon" src="../img/icon/add_task_icon/subtasks/edit.png" alt="pencil">
                      <span class="editText">Edit</span>
                    </div>
                    <div id="deleteOverlay" onclick="deleteContact(${indexDetails})">
                      <img class="editIcon" src="../img/icon/add_task_icon/subtasks/delete.png" alt="wastebasket">
                      <span class="editText">Delete</span>
                    </div> 
                  </div>
                </div>
              </div>
              <p class="contact-Information">Contact Information</p>
              <div class="infoBlock">
                <div class="infoBlock-details">
                  <h4>Email</h4>
                  <a class="mail" href="mailto:${user.email}">${user.email}</a>
                </div>
                <div class="infoBlock-details">
                  <h4>Phone</h4>
                  <a class="phonenumber" href="tel:${user.phone}">${user.phone}</a>
                </div>
              </div>
             
            </div>
            <div class="editContactBtn-wrapper">
              <button id="showOverlayBtn" class="editContactBtnMobile" onclick="showMobileEditOverlay(${indexDetails})">
                  <div class="dotted"></div>
                  <div class="dotted"></div>
                  <div class="dotted"></div>
                </button>
              </div>`;
}

// add new Contact
function getNoteTemplateAddNewContact() {
  return ` <div class="newContactOverlay" onclick="event.stopPropagation()">
            <div class="headDiv">
              <div class="headDiv-wrapper-newContact">
                <div class="closeMobile-wrapper">
                  <img onclick="closeOverlay()" class="closeMobile" src="../img/icon/Close-white.png">
                </div>
                  <div class="contactLogo-wrapper">
                    <img class="contactLogo" src="/assets/img/logo/logo_white.png" alt="Logo_white">
                  </div>
                  <div class="add-headline mobile-headline">
                    <p class="add-contact">Add contact</p>
                    <p class="addTastText">Tasks are better with a team!</p>
                    <div class="line"></div>
                  </div> 
              </div>
            </div>

            <div class="editDiv-addContact">
              <div class="profileInitials-addContacts">
                <img class="profileImg-addContacts" src="../img/icon/profile.png" alt="profile Image">
              </div>        
              <div class="profilDiv-addContacts">
              <div class="closeDiv">
                <div class="close-wrapper">
                  <img onclick="closeOverlay()" class="close" src="../img/icon/close.png" alt="Close-Button">
                </div>
              </div>
                <div class="add-new-contact-inputs">
                  <div class="addNewContactDiv" onclick="event.stopPropagation(), clearInputError()" id="addNewContactInput">
                    <input id="newContactName" class="addNewContact" type="text" placeholder="Name" required onclick="event.stopPropagation()" oninput="validateNameInput(this)">
                    <img class="addNewContactIcon" src="../img/icon/person.png" alt="Person Icon">
                  </div> 
                  <div class="addNewContactDiv" onclick="event.stopPropagation()" id="addNewContactEmailDiv">
                    <input id="newContactMail" class="addNewContact" type="email" placeholder="Email" required onclick="event.stopPropagation()" oninput="validateEmailInput(this)">
                    <img class="addNewContactIcon" src="../img/icon/mail.png" alt="Email Icon">
                  </div> 
                  <div class="addNewContactDiv" onclick="event.stopPropagation()" >
                    <input id="newContactPhone" class="addNewContact" type="tel" placeholder="Phone" required onclick="event.stopPropagation()" oninput="validatePhoneInput(this)" value="">
                    <img class="addNewContactIcon" src="../img/icon/phone.png" alt="phone Icon">
                  </div>
                </div>
                <div class="accept-addContact">
                  <div class="hide-button-addContact">
                    <button onclick="closeOverlay()" class="clear-button">Cancel<img class="save-close" src="../img/icon/close.png"></button>
                  </div>
                  <button onclick="saveToLocalstorage()" class="create-button">Create contact<img class="save-close" src="../img/icon/save.png" alt="saveIcon"></button>
                </div>         
              </div>
            </div>
          </div>`;
}

// edit Contact
function getNoteTemplateEditContact(index) {
  let user = contacts[index] || {};

  return ` <div class="newContactOverlay" onclick="eventBubbling(event)">
            <div class="headDiv">
              <div class ="headDiv-wrapper">
                <div class="closeMobile-wrapper">
                  <img onclick="closeOverlay()" class="closeMobile" src="../img/icon/Close-white.png">
                </div>
                <div class ="contactLogo-wrapper">
                  <img class="contactLogo" src="/assets/img/logo/logo_white.png" alt="Logo_white">
                </div>
                <div class="headline-wrapper">
                  <div class="add-headline">
                  <p class="add-contact">Edit contact</p>
                  </div>
                  <div class="line"></div>
                </div>
              </div>
            </div>

            <div class="editDiv">
              <div class="profileInitials">
                <p id="newContactInitials" class="initialOverlay" style="background-color: ${user.color}">${user.initials}</p>
              </div>        
              <div class="profilDiv">
                <div class="closeDiv">
                   <div class="close-wrapper">
                    <img onclick="closeOverlay()" class="close" src="../img/icon/close.png" alt="Close-Button">
                  </div>
                </div>
                <div class="add-new-contact-inputs">
                  <div class="addNewContactDiv" onclick="eventBubbling(event)" id="addNewContactInput">
                    <input id="editContactName" class="addNewContact" type="text" placeholder="Name" required onclick="eventBubbling(event)" value="${user.name || ''}" oninput="validateNameInput(this)">
                    <img class="addNewContactIcon" src="../img/icon/person.png" alt="Person Icon">
                  </div> 
                  <div class="addNewContactDiv" onclick="eventBubbling(event)" id="editContactEmailDiv">
                    <input id="editContactMail" class="addNewContact" type="email" placeholder="Email" required onclick="eventBubbling(event)" value="${user.email || ''}" oninput="validateEmailInput(this)">
                    <img class="addNewContactIcon" src="../img/icon/mail.png" alt="Email Icon">
                  </div> 
                  <div class="addNewContactDiv" onclick="eventBubbling(event)" id="editContactPhoneDiv">
                    <input id="editContactPhone" class="addNewContact" type="tel" minlength="10" placeholder="Phone" required onclick="eventBubbling(event)" value="${user.phone || ''}" oninput="validatePhoneInput(this)">
                    <img class="addNewContactIcon" src="../img/icon/phone.png" alt="phone Icon">
                  </div>
                
              </div>
              <div class="accept">
                  <div class="hide-button">
                    <button onclick="deleteContact(${index})" class="clear-button">Delete</button>
                  </div>
                  <button onclick="updateContact(${index})" class="create-button">Save<img class="save-close" src="../img/icon/save.png" alt="hookIcon"></button>
                </div>
              
            </div>`;
}

function getNoteTemplateMobileEditOverlay(indexDetails) {

  return` <div class="editDeleteOverlayMobile" id="editDeleteOverlayMobile"> 
            <div id="editOverlayMobile" class="mobile" onclick="openEditOverlay(${indexDetails})">
              <img class="editIcon" src="../img/icon/add_task_icon/subtasks/edit.png" alt="pencil">
              <span class="editText">Edit</span>
            </div>
            <div id="deleteOverlayMobile" class="mobile" onclick="deleteContact(${indexDetails})">
              <img class="editIcon" src="../img/icon/add_task_icon/subtasks/delete.png" alt="wastebasket">
              <span class="editText">Delete</span>
            </div>
          </div>`;
}