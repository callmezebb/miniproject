document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('userLoginForm');
    const registerForm = document.getElementById('userRegisterForm');
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');
    const loginContainer = document.querySelector('.form-container');
    const registerContainer = document.querySelector('.register-form');
    
    // Backend API URL - ensure this matches your server
    const API_URL = 'http://localhost:5000/api';
    
    // Test if API is accessible
    fetch(`${API_URL}/auth/test`)
        .then(response => response.json())
        .then(data => {
            console.log('API Test Result:', data);
        })
        .catch(error => {
            console.error('API Test Error:', error);
        });

    // Toggle between login and register forms
    showRegisterLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginContainer.style.display = 'none';
        registerContainer.style.display = 'block';
    });

    showLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        registerContainer.style.display = 'none';
        loginContainer.style.display = 'block';
    });

    // Handle login form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Show loading indicator
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            console.log('Attempting user login with:', { email }); // Don't log passwords
            
            const response = await fetch(`${API_URL}/auth/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log('Login response:', data);
            
            if (response.ok) {
                handleLoginSuccess(data);
            } else {
                // Show detailed error message
                console.error('Login error:', data);
                alert(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please check your network connection and try again.');
        } finally {
            // Reset button state
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    // Handle registration form submission
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Show loading indicator
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Registering...';
        submitBtn.disabled = true;
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validate form
        if (!name || !email || !password || !confirmPassword) {
            alert('All fields are required!');
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
            return;
        }

        try {
            console.log('Attempting user registration with:', { name, email });
            
            const response = await fetch(`${API_URL}/auth/user/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    name, 
                    email, 
                    password
                })
            });

            const data = await response.json();
            console.log('Registration response:', data);

            if (response.ok) {
                console.log('Registration successful:', data);
                alert('Registration successful! Please login with your credentials.');
                
                // Clear the registration form
                registerForm.reset();
                
                // Switch to login form
                registerContainer.style.display = 'none';
                loginContainer.style.display = 'block';
                
                // Prefill the email in the login form
                document.getElementById('email').value = email;
            } else {
                console.error('Registration error:', data);
                alert(data.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed. Please check your network connection and try again.');
        } finally {
            // Reset button state
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
});

function handleLoginSuccess(response) {
    try {
        // Store authentication data
        localStorage.setItem('userToken', response.token);
        localStorage.setItem('userData', JSON.stringify(response.user));
        
        console.log('Login successful, data stored:', {
            token: response.token ? 'Present' : 'Missing',
            userData: response.user ? 'Present' : 'Missing'
        });

        // Get redirect URL if it exists
        const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
        sessionStorage.removeItem('redirectAfterLogin'); // Clear it
        
        // Redirect to appropriate page
        if (redirectUrl && redirectUrl.includes('booking.html')) {
            window.location.href = redirectUrl;
        } else {
            window.location.href = 'user-dashboard.html';
        }
    } catch (error) {
        console.error('Error handling login success:', error);
        alert('There was an error processing your login. Please try again.');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5000/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Store authentication data
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            
            console.log('Login successful, stored data:', {
                token: data.token,
                user: data.user
            });

            // Redirect to hairstyles or dashboard
            window.location.href = 'hairstyles.html';
        } else {
            throw new Error(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
    }
}

// Make sure the form has an event listener
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

// Add this function to check login status
function checkLoginStatus() {
    const token = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');
    
    console.log('Checking login status...');
    console.log('Token exists:', !!token);
    console.log('User data exists:', !!userData);
    
    return !!(token && userData);
}