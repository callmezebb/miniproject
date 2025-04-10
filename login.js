document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) {
        console.error('Login form not found');
        return;
    }

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const userType = document.getElementById('userType').value;

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, userType }),
            });

            const data = await response.json();
            console.log('Login response:', data);

            if (response.ok && data.token) {
                // Store token with Bearer prefix
                localStorage.setItem('token', `Bearer ${data.token}`);
                localStorage.setItem('userType', data.user.userType);
                localStorage.setItem('userName', data.user.name);
                localStorage.setItem('userEmail', data.user.email);
                localStorage.setItem('userId', data.user.id);

                // Check user type and registration status
                if (data.user.userType === 'salon') {
                    // Check if salon has completed registration
                    const salonDetails = localStorage.getItem('salonDetails');
                    if (!salonDetails) {
                        window.location.href = 'salon-registration.html';
                    } else {
                        window.location.href = 'salon-dashboard.html';
                    }
                } else {
                    window.location.href = 'user-dashboard.html';
                }
            } else {
                alert(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login. Please try again.');
        }
    });
});