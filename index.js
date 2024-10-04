// TASK: import helper functions from utils
import { getTasks, createNewTask } from './utils.js'; //importing getTasks and createNewTask functions from utils.js
// TASK: import initialData
import { initialData } from './initialData.js'; //importing initialData from initialData.js

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

// TASK: Get elements from the DOM
const elements = {
  boardsNavLinksDiv: document.getElementById('boards-nav-links-div'), // Retrieve the element with the ID 'boards-nav-links-div' and store it in the 'boardsNavLinksDiv' property
  headerBoardName: document.getElementById('header-board-name'), // Retrieve the element with the ID 'header-board-name' and store it in the 'headerBoardName' property
  columnDivs: document.querySelectorAll('.column-div'), // Retrieve all elements with the class 'column-div' and store them in the 'columnDivs' property
  modalWindow: document.getElementById('modal-window'), // Retrieve the element with the ID 'modal-window' and store it in the 'modalWindow' property
  editTaskModal: document.getElementById('edit-task-modal'), // Retrieve the element with the ID 'edit-task-modal' and store it in the 'editTaskModal' property
  filterDiv: document.getElementById('filter-div'), // Retrieve the element with the ID 'filter-div' and store it in the 'filterDiv' property
  hideSideBarBtn: document.getElementById('hide-sidebar-btn'), // Retrieve the element with the ID 'hide-sidebar-btn' and store it in the 'hideSideBarBtn' property
  showSideBarBtn: document.getElementById('show-sidebar-btn'), // Retrieve the element with the ID 'show-sidebar-btn' and store it in the 'showSideBarBtn' property
  themeSwitch: document.getElementById('theme-switch'), // Retrieve the element with the ID 'theme-switch' and store it in the 'themeSwitch' property
  createNewTaskBtn: document.getElementById('create-new-task-btn'), // Retrieve the element with the ID 'create-new-task-btn' and store it in the 'createNewTaskBtn' property
  filterDiv: document.getElementById('filter-div'), // Retrieve the element with the ID 'filter-div' and store it in the 'filterDiv' property
};

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);

  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard : boards[0]; //corrected syntax for ternary operation from ; to :
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container

  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', () => handleBoardClick(board)); //bug fix: addEventListener and corrected syntax brackets
    boardsContainer.appendChild(boardElement);
});

styleActiveBoard(activeBoard); // Styles the active board
}

function handleBoardClick(board) { //bug fix: corrected syntax for handleBoardClick function
  elements.headerBoardName.textContent = board;
  filterAndDisplayTasksByBoard(board);
  activeBoard = board;
  localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
  styleActiveBoard(board);
}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName); //corected syntax for filter function

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { //corrected syntax for forEach function
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener('click', () => { //corrected syntax for addEventListener function
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { //bug fix: spelleing error forEach
    
    if(btn.textContent === boardName) {
      btn.classList.add('active') //bug fix: corrected syntax for add class
    }
    else {
      btn.classList.remove('active'); //bug fix: corrected syntax for remove class
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector('.column-div[data-status="${task.status}"]'); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement); // Append the task element to the tasks container 
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.click = () => toggleModal(false, elements.editTaskModal); //bug fix: corrected syntax in click function

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal)); //bug fix: corrected syntax in addEventListener function
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  }

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  // bug fix: corrected syntax in event listener function
  elements.hideSideBarBtn.addEventListener('click', function() { //bug fix: corrected syntax in event listener function
    toggleSidebar(false);
  });
  elements.showSideBarBtn.addEventListener('click', function() { //bug fix: corrected syntax in event listener function
    toggleSidebar(true);
  });

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });


// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; //bug fix: corrected syntax for ternary operation
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  // Assign user input to the task object
  const task = {
    title: event.target.elements.title.value,
    description: event.target.elements.description.value,
    board: event.target.elements.board.value,
    status: event.target.elements.status.value
  }; //bug fix: corrected syntax for object properties

  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
    event.target.reset();
    refreshTasksUI();
  }
}//bug fix: corrected syntax for event.target.reset()


function toggleSidebar(show) {
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('main');
  if (show) {
    sidebar.style.display = 'block';
    main.style.marginLeft = '250px';
  } else {
    sidebar.style.display = 'none';
    main.style.marginLeft = '0';
  }
  localStorage.setItem('showSideBar', show.toString());
}

function toggleTheme() {
  document.body.classList.toggle('light-theme');
  const isLightTheme = document.body.classList.contains('light-theme') ? 'enabled' : 'disabled';
  localStorage.setItem('light-theme', isLightTheme); 
}



function openEditTaskModal(task) {
  // Set task details in modal inputs 
  elements.editTaskModal.querySelector('#title').value = task.title; //added value to title input
  elements.editTaskModal.querySelector('#description').value = task.description; //added value to description input
  elements.editTaskModal.querySelector('#board').value = task.board; //added value to board input
  elements.editTaskModal.querySelector('#status').value = task.status;//added value to status input
   

  // Get button elements from the task modal
  const saveChangesBtn = elements.editTaskModal.querySelector('#save-changes-btn'); //added save changes button
  const deleteTaskBtn = elements.editTaskModal.querySelector('#delete-task-btn'); //added delete task button

  // Call saveTaskChanges upon click of Save Changes button
  saveChangesBtn.addEventListener('click', () => { //added event listener for save changes button
    saveTaskChanges(task.id);
  }); 

  // Delete task using a helper function and close the task modal
  deleteTaskBtn.addEventListener('click', () => { //added event listener for delete task button
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal);
  });


  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const title = elements.editTaskModal.querySelector('#title').value; //added title input
  const description = elements.editTaskModal.querySelector('#description').value; //added description input
  const board = elements.editTaskModal.querySelector('#board').value; //added board input
  const status = elements.editTaskModal.querySelector('#status').value; //added status

  // Create an object with the updated task details
  const updatedTask = {
    id: taskId,
    title: title,
    description: description,
    board: board,
    status: status
  }; //added updated task object


  // Update task using a hlper function
  updateTask(updatedTask); // Update the task in the localStorage

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal); // Close the modal
  refreshTasksUI(); // Refresh the UI
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData();
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}