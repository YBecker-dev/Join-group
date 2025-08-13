/**
 * Toggles the visibility of the dropdown menu.
 */
function showDropDown(){
    let dropdown_menu = document.getElementById('drop-down')
    dropdown_menu.classList.toggle('d-none');    
}


/**
 * Finds the status area of a task and calls a function to hide the active status.
 * @param {string} trueTaskId - The ID of the task.
 */
function findStatusArea(trueTaskId){
    let boardTaskContainer= document.getElementById('task-'+trueTaskId);
    let firstParent = boardTaskContainer.parentElement;
    let targetParentElement = firstParent.parentElement;
    let statusID = targetParentElement.id
    hideActivStatus(trueTaskId, statusID);  
}


/**
 * Hides the dropdown menu for the currently active status.
 * @param {string} trueTaskId - The ID of the task.
 * @param {string} statusID - The ID of the status area.
 */
function hideActivStatus(trueTaskId, statusID){
    let targetArea = document.getElementById(statusID);
    let todoDropDown = document.getElementById(statusID+'-mobil-'+trueTaskId)
    let sections = targetArea.getElementsByTagName('section');
    let sectionId;
    for(let section  of sections){
        let sectionbodys = section.children;
        for(let sectionbody of sectionbodys){
            sectionId = sectionbody.id;
            let filterId = sectionId.slice(5)
            let targetId = Number(filterId);
            if(trueTaskId === targetId){
                todoDropDown.classList.add('d-none');
            }
        }
    }
}


/**
 * Changes a task's status to 'todo' on mobile.
 * @param {string} trueTaskId - The ID of the task.
 * @param {string} taskId - The database ID of the task.
 */
async function changeTaskStatusMobilToDo(trueTaskId ,taskId){
    let overlayRef = document.getElementById('overlayBoard');
    let taskOverlayRef = document.getElementById('overlay-content-loader');
    let originalTask = document.getElementById('task-'+trueTaskId);
    let targetArea = document.getElementById('todo');
    let section = document.createElement('section');
    section.appendChild(originalTask);
    targetArea.appendChild(section);
    await changeFirebaseStatus(targetArea, taskId);

    overlayRef.classList.toggle('visible');
    overlayRef.classList.add('d-none');
    taskOverlayRef.classList.toggle('show');
}


/**
 * Changes a task's status to 'inProgress' on mobile.
 * @param {string} trueTaskId - The ID of the task.
 * @param {string} taskId - The database ID of the task.
 */
async function changeTaskStatusMobilInProgress(trueTaskId ,taskId){
    let overlayRef = document.getElementById('overlayBoard');
    let taskOverlayRef = document.getElementById('overlay-content-loader');
    let originalTask = document.getElementById('task-'+trueTaskId);
    let targetArea = document.getElementById('inProgress');
    let section = document.createElement('section');
    section.appendChild(originalTask);
    targetArea.appendChild(section);
    await changeFirebaseStatus(targetArea, taskId);
    overlayRef.classList.toggle('visible');
    overlayRef.classList.add('d-none');
    taskOverlayRef.classList.toggle('show');
}


/**
 * Changes a task's status to 'awaitFeedback' on mobile.
 * @param {string} trueTaskId - The ID of the task.
 * @param {string} taskId - The database ID of the task.
 */
async function changeTaskStatusMobilAwaitFeedback(trueTaskId ,taskId){
    let overlayRef = document.getElementById('overlayBoard');
    let taskOverlayRef = document.getElementById('overlay-content-loader');
    let originalTask = document.getElementById('task-'+trueTaskId);
    let targetArea = document.getElementById('awaitFeedback');
    let section = document.createElement('section');
    section.appendChild(originalTask);
    targetArea.appendChild(section);
    await changeFirebaseStatus(targetArea, taskId);
    overlayRef.classList.toggle('visible');
    overlayRef.classList.add('d-none');
    taskOverlayRef.classList.toggle('show');
}


/**
 * Changes a task's status to 'done' on mobile.
 * @param {string} trueTaskId - The ID of the task.
 * @param {string} taskId - The database ID of the task.
 */
async function changeTaskStatusMobilDone(trueTaskId ,taskId){
    let overlayRef = document.getElementById('overlayBoard');
    let taskOverlayRef = document.getElementById('overlay-content-loader');
    let originalTask = document.getElementById('task-'+trueTaskId);
    let targetArea = document.getElementById('done');
    let section = document.createElement('section');
    section.appendChild(originalTask);
    targetArea.appendChild(section);
    await changeFirebaseStatus(targetArea, taskId);
    overlayRef.classList.toggle('visible');
    overlayRef.classList.add('d-none');
    taskOverlayRef.classList.toggle('show');
}


/**
 * Updates a task's status in the Firebase database.
 * @param {HTMLElement} targetArea - The target HTML element representing the new status.
 * @param {string} taskId - The database ID of the task.
 */
async function changeFirebaseStatus(targetArea, taskId){ /// 14Zeilen
    try{
            let response = await fetch(BASE_URL_TASKS_AND_USERS + 'tasks.json');
            let data = await response.json();
            if(!data){
                console.log('Probleme beim API abruf')
                return;
            }
            let targetTaskId = taskId;
            let allTasksId = Object.keys(data);
            if(allTasksId.includes(targetTaskId)){ 
                let newStatus = targetArea.id; 
                let newSequence = checkSequenzNr(allTasksId, data)
                console.log(newStatus);
                const statusUpdate = {
                    status : newStatus,
                    sequence : newSequence,
                }
                await updateNewStatus(statusUpdate, targetTaskId);
            }else{
                console.log(false, "Die ID wurde nicht gefunden");
            }
    }catch(error){
        console.error(error)
    }   
}


/**
 * Checks the sequence numbers of all tasks to determine the next one.
 * @param {Array<string>} allTasksId - An array of all task IDs.
 * @param {object} data - The task data object.
 * @returns {number} - The next sequence number.
 */
function checkSequenzNr(allTasksId, data){
    let processingSequenz = [];
    for(s = 0; s < allTasksId.length; s++){
        let test = allTasksId[s];
        processingSequenz.push(data[test].sequence);  
    }
    const maxCount = Math.max(...processingSequenz);
    let newMaxCount = maxCount +1
    processingSequenz=[];
    return(newMaxCount)
}


/**
 * Updates a task's status and sequence number in the database via a PATCH request.
 * @param {object} statusUpdate - The object containing the new status and sequence.
 * @param {string} targetTaskId - The database ID of the task to update.
 */
async function updateNewStatus(statusUpdate, targetTaskId) {
    try{
        const update = await fetch(BASE_URL_TASKS_AND_USERS + 'tasks/' + targetTaskId + '.json', {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(statusUpdate),
        });
        if(!update.ok){
            let errorMessage = await update.text();
            console.error(errorMessage);
        }else{
            console.log("Update erfolgreich")
        }
    }catch(error){
        console.error(error);
    }
    window.location.reload();
}
