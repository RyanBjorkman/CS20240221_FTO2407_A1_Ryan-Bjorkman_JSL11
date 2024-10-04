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
  };

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);

  if (boards.length > 0) {
   const storedActiveBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = storedActiveBoard ? JSON.parse(localStorage.getItem("activeBoard")) : boards[0];

    elements.headerBoardName.textContent = activeBoard;

    styleActiveBoard(activeBoard);
    refreshTasksUI(); // Refreshes the tasks UI
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = elements.boardsNavLinksDiv;
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
      addTaskToColumn(task, tasksContainer);
    });
  });
  }

  function addTaskToColumn(task, tasksContainer) {
    const taskElement = document.createElement("div");
    taskElement.classList.add("task-div");
    taskElement.textContent = task.title;
    taskElement.setAttribute('data-task-id', task.id);
    tasksContainer.addEventListener('click', () => openEditTaskModal(task));
    tasksContainer.appendChild(taskElement);
  }



function refreshTasksUI() { // Refreshes the tasks UI
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { //bug fix: spelleing error forEach
    btn.classList.toggle('active', btn.textContent === boardName); //bug fix: corrected syntax for toggle method
  });
}


//add task form submission handler
function addTask(event) {
  event.preventDefault(); // Prevent the default form submission behavior

const task = {
  title: event.target.elements.title.value,
  description: event.target.elements.description.value,
  board: event.target.elements.board.value,
  status: event.target.elements.status.value
};

const newTask = createNewTask(task);
if (newTask) {
  addTaskToUI(newTask);
  toggleModal(false);
  elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  event.target.reset();
  refreshTasksUI();
}
}

function toggleModal(show, modal = elements.modalWindow) { //toggle modal function
  modal.style.display = show ? 'block' : 'none';
}

function toggleSidebar(show) {
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('main');
  sidebar.style.display = show ? 'block' : 'none';
  main.style.marginLeft = show ? '250px' : '0';
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

  const saveChangesBtn = elements.editTaskModal.querySelector('#save-changes-btn'); //added save changes button
  const deleteTaskBtn = elements.editTaskModal.querySelector('#delete-task-btn'); //added delete task button

  saveChangesBtn.onclick = () => saveTaskChanges(task.id);
  deleteTaskBtn.onclick = () => {
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal);
  };

  toggleModal(true, elements.editTaskModal);
}

function saveTaskChanges(taskId) {
  const title = elements.editTaskModal.querySelector('#title').value;
  const description = elements.editTaskModal.querySelector('#description').value;
  const board = elements.editTaskModal.querySelector('#board').value;
  const status = elements.editTaskModal.querySelector('#status').value;

  const updatedTask = {
    id: taskId,
    title,
    description,
    board,
    status
  };

  updateTask(updatedTask);
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}

document.addEventListener('DOMContentLoaded', function() {
  init();
});

function init() {
  initializeData();
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks();
}