document.addEventListener('DOMContentLoaded', function() {
    console.log('scripts.js loaded');

    const todoTableBody = document.getElementById('todo-body');
    const addTodoForm = document.getElementById('add-todo-form');
    const loginForm = document.getElementById('login-form'); // Предполагается, что у вас есть форма для логина

    async function loadTodos() {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be logged in to view todos.');
            return;
        }
        const response = await fetch('/users/me/todos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const todos = await response.json();
        if (response.ok) {
            todoTableBody.innerHTML = '';
            todos.forEach(todo => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${todo.title}</td>
                    <td>${todo.description}</td>
                    <td>${todo.is_completed ? 'Completed' : 'Not Completed'}</td>
                    <td>
                        <button class="edit-btn" data-id="${todo.id}">Edit</button>
                        <button class="delete-btn" data-id="${todo.id}">Delete</button>
                    </td>
                `;
                todoTableBody.appendChild(row);
            });
        } else {
            alert('Failed to load todos.');
        }
    }

    async function addTodo() {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be logged in to add a todo.');
            return;
        }
        const title = document.getElementById('new-title').value;
        const description = document.getElementById('new-description').value;
        const status = document.getElementById('new-status').value === 'true';

        const response = await fetch('/users/me/create', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                description: description,
                is_completed: status
            })
        });

        if (response.ok) {
            loadTodos();
            addTodoForm.reset();
        } else {
            alert('Failed to add todo.');
        }
    }

    async function deleteTodo(todoId) {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be logged in to delete a todo.');
            return;
        }
        const response = await fetch(`/users/me/todos/${todoId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            loadTodos();
        } else {
            alert('Failed to delete todo.');
        }
    }

    async function editTodo(todoId, title, description, status) {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be logged in to edit a todo.');
            return;
        }

        const response = await fetch(`/users/me/todos/${todoId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                new_title: title,
                new_description: description,
                new_status: status
            })
        });

        if (response.ok) {
            loadTodos();
        } else {
            alert('Failed to edit todo.');
        }
    }

    todoTableBody.addEventListener('click', async (event) => {
        const target = event.target;
        const todoId = target.dataset.id;

        if (target.classList.contains('edit-btn')) {
            const title = prompt('Enter new title:');
            const description = prompt('Enter new description:');
            const status = confirm('Mark as completed?');
            if (title && description !== null) {
                await editTodo(todoId, title, description, status);
            }
        } else if (target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this todo?')) {
                await deleteTodo(todoId);
            }
        }
    });

    addTodoForm.addEventListener('submit', (event) => {
        event.preventDefault();
        addTodo();
    });

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const response = await fetch('/users/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
                },
            body: new URLSearchParams({
                username: username,
                password: password
            })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.access_token);
            loadTodos();
        } else {
            alert('Login failed.');
        }
    });

    // Initial load
    if (localStorage.getItem('token')) {
        loadTodos();
    }
});
