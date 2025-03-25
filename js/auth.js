// Define protected routes
const protectedRoutes = [
    'hairstyles.html',
    'booking.html',
    'user-dashboard.html',
    'salon-dashboard.html',
    'face-analysis.html'
];

// Check authentication status
async function checkAuth() {
    const currentPage = window.location.pathname.split('/').pop();
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');

    if (!token || !userType) {
        console.log('No token or userType found');
        if (protectedRoutes.includes(currentPage)) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (!response.ok || !data.success) {
            console.log('Token validation failed');
            localStorage.clear();
            window.location.href = 'login.html';
            return false;
        }

        // Special handling for salon users
        if (userType === 'salon') {
            const salonDetails = localStorage.getItem('salonDetails');
            
            // If salon hasn't completed registration, redirect to registration
            if (!salonDetails && currentPage !== 'salon-registration.html') {
                window.location.href = 'salon-registration.html';
                return false;
            }
            
            // If salon has completed registration, prevent accessing registration again
            if (salonDetails && currentPage === 'salon-registration.html') {
                window.location.href = 'salon-dashboard.html';
                return false;
            }
        }

        // Check if user is accessing the correct dashboard
        const currentDashboard = currentPage.includes('salon') ? 'salon' : 'user';
        if (currentDashboard !== userType) {
            console.log('Wrong dashboard for user type');
            window.location.href = userType === 'salon' ? 'salon-dashboard.html' : 'user-dashboard.html';
            return false;
        }

        return true;
    } catch (error) {
        console.error('Auth check error:', error);
        localStorage.clear();
        window.location.href = 'login.html';
        return false;
    }
}

// Logout function
function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// Add this to handle initial page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
});

function getUser() {
    return {
        id: localStorage.getItem('userId'),
        name: localStorage.getItem('userName'),
        email: localStorage.getItem('userEmail'),
        userType: localStorage.getItem('userType')
    };
}