document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('salonLoginForm');
    const registerForm = document.getElementById('salonRegisterForm');
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
            console.log('Attempting salon login with:', { email }); // Don't log passwords
            
            const response = await fetch(`${API_URL}/auth/salon/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log('Login response:', data);
            
            if (response.ok) {
                console.log('Login successful, storing salon data to localStorage');
                
                // Save token and basic salon data
                localStorage.setItem('token', data.token);
                localStorage.setItem('userType', 'salon');
                localStorage.setItem('salonId', data.salon._id);
                localStorage.setItem('salonName', data.salon.name || 'Your Salon');
                
                // Save all salon details for dashboard
                if (data.salon.phone) localStorage.setItem('salonPhone', data.salon.phone);
                if (data.salon.location) localStorage.setItem('salonLocation', data.salon.location);
                if (data.salon.email) localStorage.setItem('salonEmail', data.salon.email);
                if (data.salon.ownerName) localStorage.setItem('ownerName', data.salon.ownerName);
                if (data.salon.description) localStorage.setItem('salonDescription', data.salon.description);
                
                // Store complex objects as JSON strings
                if (data.salon.businessHours) {
                    localStorage.setItem('salonBusinessHours', JSON.stringify(data.salon.businessHours));
                }
                
                if (data.salon.services) {
                    localStorage.setItem('salonServices', JSON.stringify(data.salon.services));
                }
                
                // Log what we've stored
                console.log('Stored salon data:', {
                    id: data.salon._id,
                    name: data.salon.name,
                    phone: data.salon.phone,
                    location: data.salon.location,
                    hasBusinessHours: !!data.salon.businessHours,
                    serviceCount: data.salon.services ? data.salon.services.length : 0
                });
                
                // Redirect based on profile completion status
                if (data.salon.isProfileComplete) {
                    console.log('Profile complete, redirecting to dashboard');
                    window.location.href = 'salon-dashboard.html';
                } else {
                    console.log('Profile incomplete, redirecting to registration');
                    window.location.href = 'salon-registration.html';
                }
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
        
        const salonName = document.getElementById('salonName').value;
        const ownerName = document.getElementById('ownerName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validate form
        if (!salonName || !ownerName || !email || !password || !confirmPassword) {
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
            console.log('Attempting salon registration with:', { salonName, ownerName, email });
            
            const response = await fetch(`${API_URL}/auth/salon/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    salonName, 
                    ownerName, 
                    email, 
                    password
                })
            });

            const data = await response.json();
            console.log('Registration response:', data);

            if (response.ok) {
                console.log('Registration successful:', data);
                alert('Registration successful! Please login with your credentials to complete your salon profile.');
                
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