document.addEventListener('DOMContentLoaded', async function () {
    const loginForm = document.getElementById('login-form');
    const token = localStorage.getItem('token');
    console.log('Token:', token);

    if (token) {
        try {
            const response = await fetch('/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                window.location.href = '/dashboard';
            } else {
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error('Error validation token:', error);
        }
    }

    if (loginForm) {

        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault()

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const response = await fetch('/users/token', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.access_token);
                window.location.href = '/dashboard';
            } else {
                alert('Login failed.')
            }
        });
    }
});