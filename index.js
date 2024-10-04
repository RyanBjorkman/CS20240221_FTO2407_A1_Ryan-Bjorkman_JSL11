// TASK: import helper functions from utils
import { getTasks, createNewTask, patchTask, putTask, deleteTask } from './utils/taskFunctions.js';
// TASK: import initialData
import { initialData } from './initialData.js';

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
//clear local storage to help with debugging
//localStorage.clear()

// TASK: Get elements from the DOM
// Fetch the elements from the DOM
const elements = {
  headerBoardName: document.getElementById('header-board-name'),
  columnDivs: document.querySelectorAll('.column-div'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  filterDiv: document.getElementById('filterDiv'),
  themeSwitch: document.getElementById('switch'),
  createNewTaskBtn: document.getElementById('add-new-task-btn'),
  modalWindow: document.getElementById('new-task-modal-window'),
  editTaskModal: document.querySelector('.edit-task-modal-window'),  // New: added selector for edit task modal
};

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
// Corrected the : to ; in the conditional expression
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; 
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
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
    // Fixed the onclick function
    boardElement.onclick = () => { 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board // Assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    };
    boardsContainer.appendChild(boardElement);
  });
}

// Function to initialize the titles before the following function runs
function checkColumnTitlesInitialized() {
    // Initialize column titles if not already set
    elements.columnDivs.forEach(column => {
      const status = column.getAttribute("data-status");
      column.innerHTML = `<div class="column-head-div">
                            <span class="dot" id="${status}-dot"></span>
                            <h4 class="columnHeader">${status.toUpperCase()}</h4>
                          </div>`;
    });
}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  // Ensuring column titles are set outside of this function
  checkColumnTitlesInitialized();

  const tasks = getTasks();  // Fetch tasks from a simulated local storage function
  // Changed = to === for proper comparison
  const filteredTasks = tasks.filter(task => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs
  // Added a function called checkColumnTitlesInitialized to make sure they are set before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);
    // Fixed the = to === for the filter
    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      // Fixed the syntax errors on the onclick
      taskElement.onclick = () => { 
        openEditTaskModal(task);
      };

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
  // Corrected foreach to forEach
  document.querySelectorAll('.board-btn').forEach(btn => { 
    // Added classList to correctly use the .add and .remove functions  
    if (btn.textContent === boardName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active'); 
    }
  });
}

function addTaskToUI(task) {
  // Changed to backticks to use template literal
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); 
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
  taskElement.textContent = task.title;  // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  // Added taskElement as an argument
  tasksContainer.appendChild(taskElement); 
}

function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  // Corrected click to onclick
  cancelEditBtn.onclick = () => toggleModal(false, elements.editTaskModal);

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none';  // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none';  // Also hide the filter overlay
  });

  // Show sidebar event listener
  // Corrected click to onclick
  elements.hideSideBarBtn.onclick = () => toggleSidebar(false);
  elements.showSideBarBtn.onclick = () => toggleSidebar(true);

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block';  // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit', (event) => {
    addTask(event);
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  // Corrected the ternary
  modal.style.display = show ? 'block' : 'none'; 
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  // Added a validation to ensure the title is mandatory
  const titleInput = document.getElementById('title-input').value;
  if (!titleInput) {
    alert('Task title is required!');
    return;
  }

  // Assign user input to the task object
  // Added title, description, and status to the task const
  const task = {
    title: document.getElementById('title-input').value,
    description: document.getElementById('desc-input').value,
    status: document.getElementById('select-status').value,
    board: activeBoard
  };
  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = 'none';  // Also hide the filter overlay
    event.target.reset();
    refreshTasksUI();
  }
}

// Create a const that fetches the sidebar div
function toggleSidebar(show) {
  const sidebar = document.getElementById('side-bar-div');
  // Create a const to fetch the ID from the HTML for the button to show the sidebar
  const showButton = document.getElementById('show-side-bar-btn');
  sidebar.classList.toggle('show-sidebar', show);
  // Hide button when sidebar is showing
  showButton.style.display = show ? 'none' : 'block';
  // Save the visibility to localstorage
  localStorage.setItem("showSideBar", show);
}

// Show sidebar button
document.getElementById('show-side-bar-btn').addEventListener('click', () => {
  toggleSidebar(true);  
});

// Hide sidebar button
document.getElementById('hide-side-bar-btn').addEventListener('click', () => {
  toggleSidebar(false);
});

// Toggles light/dark theme
function toggleTheme() {
  // Check if light theme is currently enabled  
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';

  // Set up a toggle for the theme with an if statement
  if (isLightTheme) {
    // Remove the light theme class
    document.body.classList.remove('light-theme');
    // Update local storage
    localStorage.setItem('light-theme', 'disabled');
    // Update the logo to the dark mode logo
    logo.src = './assets/logo-dark.svg';
  } else {
    // Add the light theme class
    document.body.classList.add('light-theme');
    // Update local storage
    localStorage.setItem('light-theme', 'enabled'); 
    // Update the logo to the light mode logo
    logo.src = './assets/logo-light.svg';
  }
}

function openEditTaskModal(task) {
  // Set task details in modal inputs
  document.getElementById('edit-task-title-input').value = task.title;
  document.getElementById('edit-task-desc-input').value = task.description;
  document.getElementById('edit-select-status').value = task.status;

  // Get button elements from the task modal
  const saveChangesBtn = document.getElementById('save-task-changes-btn');
  const deleteTaskBtn = document.getElementById('delete-task-btn');

  // Call saveTaskChanges upon click of Save Changes button
  saveChangesBtn.onclick = () => saveTaskChanges(task.id);

  // Delete task using a helper function and close the task modal with an added confirmation
  deleteTaskBtn.onclick = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
      toggleModal(false, elements.editTaskModal);
      refreshTasksUI();
    }
  };

  toggleModal(true, elements.editTaskModal);  // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const updatedTask = {
    id: taskId,
    title: document.getElementById('edit-task-title-input').value,
    description: document.getElementById('edit-task-desc-input').value,
    status: document.getElementById('edit-select-status').value,
  };

  // Create an object with the updated task details

  // Update task using a helper function
  patchTask(taskId, updatedTask);

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init();  // init is called after the DOM is fully loaded
});

function init() {
  initializeData();
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks();  // Initial display of boards and tasks
  // Set the logo source based on the theme so that the light logo shows when you refresh the page
  const logo = document.getElementById('logo');
  logo.src = isLightTheme ? './assets/logo-light.svg' : './assets/logo-dark.svg';
  // Ensure that the dark/light mode toggle correctly reflects what is stored in local memory
  const themeButton = document.getElementById('switch');
  themeButton.checked = isLightTheme;
}
