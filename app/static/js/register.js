document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('register-form');

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {

            event.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (password !== confirmPassword) {
                alert('Password do not match.')
                return;
            }

            const response = await fetch('/users/create', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    hashed_password: password
                })
            });

            console.log(response.status)

            if (response.ok) {

                const loginResponse = await fetch('/users/token', {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({
                        username: username,
                        password: password
                    })
                });

                const data = await loginResponse.json();
                if (loginResponse.ok) {
                    localStorage.setItem('token', data.access_token);
                    window.location.href = '/dashboard';
                } else {
                    alert('Login failed.')
                }

            } else {
                alert('Registration failed.')
            }

        });
    }
});