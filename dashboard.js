document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!checkAuth()) return;

    // Get user info
    const user = getUser();

    // Update welcome message if on dashboard
    const welcomeSection = document.querySelector('.welcome-section h1');
    if (welcomeSection) {
        welcomeSection.textContent = `Welcome, ${user.name || 'User'}!`;
    }

    // Add logout button to navigation
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && !document.querySelector('.logout-btn')) {
        const logoutLi = document.createElement('li');
        const logoutBtn = document.createElement('a');
        logoutBtn.href = '#';
        logoutBtn.textContent = 'Logout';
        logoutBtn.classList.add('logout-btn');
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
        logoutLi.appendChild(logoutBtn);
        navLinks.appendChild(logoutLi);
    }

    // Add click handlers for navigation
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            if (!link.classList.contains('logout-btn')) {
                const href = link.getAttribute('href');
                if (href && href !== '#') {
                    if (!checkAuth()) {
                        e.preventDefault();
                    }
                }
            }
        });
    });
});