class TodoManager {
    constructor() {
        this.todoList = document.getElementsByTagName('li');
        this.isOpened = false;
        this.todoContainer = document.getElementById('todo-container');
        this.addTaskBtn = document.getElementById('add-task-btn');
        this.init();
    }

    init() {
        this.addTaskBtn.addEventListener('click', () => { 
            if (this.isOpened) this.addTask();
            else this.openTodo();
        });
    }

    openTodo() {
        this.isOpened = true;
    }

    closeTodo() {
        this.isOpened = false;
    }

    addTask() {
        var task = document.createElement('li');
        var taskInput = document.getElementById('myInput').value;
        var text = document.createTextNode(taskInput);
        task.appendChild(text);
        if (taskInput === '') {
            alert('Add a task!!!')
        }
        for (var i = 0; i < this.todoList.length; i++) {
            var span = document.createElement('span');
            var text = document.createTextNode('\u00D7');
            span.className = 'close';
            span.appendChild(text);
            todoList[i].appendChild(span);
        }

        var close = document.getElementsByClassName('close');
        for (var i = 0; i< close.length; i++) {
            var div = this.parentElement;
            
        }
    }

    getTodoDiv() {
        const task = document.createElement('div');
        task.classList.add('task');
        task.innerHTML = `
            <textarea class="task-text" placeholder="I will code for siege!" ></textarea>
            <button class="delete-task-btn">Delete</button>
        `
        task.querySelector('.delete-task-btn').addEventListener('click', () => {
            this.todoContainer.removeChild(task);
        });
        return task;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TodoManager();
});