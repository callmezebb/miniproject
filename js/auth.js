
// Define protected routes
const protectedRoutes = [
    'hairstyles.html',
    'booking.html',
    'user-dashboard.html',
    'salon-dashboard.html',
    'face-analysis.html'
];

// Helper function to get token and user details from localStorage
function getAuthDetails() {
    return {
        token: localStorage.getItem('token'),
        userType: localStorage.getItem('userType'),
        salonDetails: localStorage.getItem('salonDetails'),
    };
}

// Helper function to redirect to a specific page
function redirectTo(page) {
    console.log(`Redirecting to: ${page}`);
    window.location.href = page;
}

// Function to validate the token with the server
async function validateToken(token) {
    try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log('Token Validation Response:', data);

        if (!response.ok || !data.success) {
            throw new Error('Token validation failed');
        }

        return data; // Return user data if validation is successful
    } catch (error) {
        console.error('Error validating token:', error);
        return null;
    }
}

async function checkAuth() {
    const currentPage = window.location.pathname.split('/').pop();
    const { token, userType, salonDetails } = getAuthDetails();

    console.log('Current Page:', currentPage);
    console.log('Token:', token);
    console.log('User Type:', userType);

    // If no token or userType, redirect to login if on a protected route
    if (!token || !userType) {
        console.log('No token or userType found');
        if (protectedRoutes.includes(currentPage)) {
            redirectTo('login.html');
            return false;
        }
        return true; // Allow access to non-protected routes
    }

    // Validate the token with the server
    const userData = await validateToken(token);
    if (!userData) {
        localStorage.clear();
        redirectTo('login.html');
        return false;
    }

    // Redirect based on userType
    if (userType === 'user') {
        console.log('Redirecting user to user-dashboard.html');
        if (currentPage !== 'user-dashboard.html') {
            redirectTo('user-dashboard.html');
            return false;
        }
    } else if (userType === 'salon') {
        console.log('Redirecting salon to salon-registration.html');
        if (currentPage !== 'salon-registration.html') {
            redirectTo('salon-registration.html');
            return false;
        }
    }

    return true; // User is authenticated and on the correct page
}
// Logout function
function logout() {
    localStorage.clear();
    redirectTo('login.html');
}

// Add this to handle initial page load
document.addEventListener('DOMContentLoaded', function () {
    checkAuth();
});

// Function to get user details from localStorage
function getUser() {
    return {
        id: localStorage.getItem('userId'),
        name: localStorage.getItem('userName'),
        email: localStorage.getItem('userEmail'),
        userType: localStorage.getItem('userType')
    };
}