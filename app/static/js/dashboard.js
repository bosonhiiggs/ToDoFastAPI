document.addEventListener('DOMContentLoaded', async function () {
    const todoTableBody = document.getElementById('todo-body');
    const addTodoForm = document.getElementById('add-todo-form');
    const token = localStorage.getItem('token');
    console.log('Token:', token);

    if (!token) {
        window.location.href = '/';
        return;
    }

    try {
        const response = await fetch('users/me', {
            headers: {'Authorization': `Bearer ${token}`}
        });

        if (!response.ok) {
            localStorage.removeItem('token');
            window.location.href = '/';
            return;
        }

        const user = await response.json()
        console.log('User data', user);

        const usernameElement = document.getElementById('username-display');
        if (usernameElement) {
            usernameElement.textContent = `Welcome, ${user.username}!`
        }

    } catch (error) {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('token');
        window.location.href = '/';
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = '/';
        });
    }

    async function loadTodos() {
        if (!token) {
            alert('You must be logged in to view todos.');
        }
        const response = await fetch('/users/me/todos/', {
            headers: {'Authorization': `Bearer ${token}`}
        });
        const todos = await response.json();
        if (response.ok) {
            todoTableBody.innerHTML = '';

            todos.forEach(todo => {
                const row = document.createElement('tr');
                row.dataset.id = todo.id;
                row.innerHTML = `
                <td>
                    <span class="todo-title">${todo.title}</span>
                    <input class="todo-title-edit" type="text" value="${todo.title}" style="display:none;">
                </td>
                <td>
                    <span class="todo-description">${todo.description}</span>
                    <input class="todo-description-edit" type="text" value="${todo.description}" style="display:none;">
                </td>
                <td>
                    <span class="todo-status">${todo.is_completed ? 'Completed' : 'Not Completed'}</span>
                    <input type="checkbox" class="todo-status-edit" ${todo.is_completed ? 'checked' : ''} style="display:none;">
                </td>
                <td>
                    <button class="edit-btn">Edit</button>
                    <button class="save-btn" style="display:none;">Save</button>
                    <button class="cancel-btn" style="display:none;">Cancel</button>
                    <button class="delete-btn">Delete</button>
                </td>
            `;
                todoTableBody.appendChild(row);
            });
        } else {
            alert('Failed to load todos.')
        }
    }

    async function addTodo() {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be logged in to add a todo.');
        }
        const title = document.getElementById('new-title').value;
        const description = document.getElementById('new-description').value;
        // const status = document.getElementById('new-status').value === 'true';

        const response = await fetch('/users/me/create', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                description: description,
                // is_completed: status
            })

        });

        if (response.ok) {
            loadTodos();
            addTodoForm.reset();
        } else {
            alert('Failed to add todo.')
        }
    }

    async function deleteTodo(todoId) {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be logged in to delete a todo.');
        }
        const response = await fetch(`/users/me/todos/${todoId}`, {
            method: 'DELETE',
            headers: {'Authorization': `Bearer ${token}`}
        })

        if (response.ok) {
            loadTodos();
        } else {
            alert('Failed to delete todo.');
        }
    }

    async function editTodo(todoId, title, description, status) {
        console.log(todoId, title, description, status)

        const token = localStorage.getItem('token');

        const updateData = {};

        if (title !== null && title !== undefined) updateData.new_title = title;
        if (description !== null && description !== undefined) updateData.new_description = description;
        if (status !== null && status !== undefined) updateData.new_status = status;

        console.log('Payload to send:', JSON.stringify(updateData))


        if (!token) {
            alert('You must be logged in to edit a todo.');
        }

        const response = await fetch(`/users/me/todos/${todoId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            await loadTodos();
        } else {
            alert('Failed to edit todo.');
        }
    }

    todoTableBody.addEventListener('click', async (event) => {
        const target = event.target;
        const row = target.closest('tr');
        const todoId = row.dataset.id;

        if (target.classList.contains('edit-btn')) {

            row.querySelector('.todo-title').style.display = 'none';
            row.querySelector('.todo-title-edit').style.display = 'inline';

            row.querySelector('.todo-description').style.display = 'none';
            row.querySelector('.todo-description-edit').style.display = 'inline';

            row.querySelector('.todo-status').style.display = 'none';
            row.querySelector('.todo-status-edit').style.display = 'inline';

            row.querySelector('.edit-btn').style.display = 'none';
            row.querySelector('.save-btn').style.display = 'inline';
            row.querySelector('.cancel-btn').style.display = 'inline';
            row.querySelector('.delete-btn').style.display = 'none';
        } else if (target.classList.contains('save-btn')) {

            const newTitle = row.querySelector('.todo-title-edit').value;
            const newDescription = row.querySelector('.todo-description-edit').value;
            const newStatus = row.querySelector('.todo-status-edit').checked;

            console.log(newTitle, newDescription, newStatus)

            await editTodo(todoId, newTitle, newDescription, newStatus)

        } else if (target.classList.contains('cancel-btn')) {

            row.querySelector('.todo-title').style.display = 'inline';
            row.querySelector('.todo-title-edit').style.display = 'none';

            row.querySelector('.todo-description').style.display = 'inline';
            row.querySelector('.todo-description-edit').style.display = 'none';

            row.querySelector('.todo-status').style.display = 'inline';
            row.querySelector('.todo-status-edit').style.display = 'none'

            row.querySelector('.edit-btn').style.display = 'inline';
            row.querySelector('.save-btn').style.display = 'none';
            row.querySelector('.cancel-btn').style.display = 'none';
            row.querySelector('.delete-btn').style.display = 'inline';

        } else if (target.classList.contains('delete-btn')) {

            if (confirm('Are you sure you want do delete this todo?')) {
                await deleteTodo(todoId);
            }

        }
    });

    addTodoForm.addEventListener('submit', (event) => {
        event.preventDefault();
        addTodo();
    });

    if (localStorage.getItem('token')) {
        await loadTodos();
    }

});