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
    const token = localStorage.getItem('token');
    return {
        token: token, // Token should already include 'Bearer ' prefix
        userType: localStorage.getItem('userType'),
        userName: localStorage.getItem('userName'),
        userEmail: localStorage.getItem('userEmail')
    };
}

// Helper function to redirect to a specific page
function redirectTo(page) {
    console.log(`Redirecting to: ${page}`);
    window.location.href = page;
}

// Function to validate the token with the server
async function validateToken(token) {
    if (!token) return null;
    
    try {
        const response = await fetch('http://localhost:5000/api/auth/validate', {
            headers: {
                'Authorization': token // Token already includes 'Bearer ' prefix
            }
        });
        
        if (!response.ok) {
            throw new Error('Token validation failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Token validation error:', error);
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