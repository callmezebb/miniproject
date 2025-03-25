// Global event listener
document.addEventListener('DOMContentLoaded', function() {
    // Handle URL parameters
    handleUrlParameters();
    
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Initialize scroll animations
    initializeScrollAnimations();
});

// Handle URL parameters for filtering and navigation
function handleUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check if we're on the hairstyles page with a filter parameter
    const hairstylesContainer = document.getElementById('hairstyles-container');
    if (hairstylesContainer && urlParams.has('filter')) {
        const filterValue = urlParams.get('filter');
        
        // Activate the corresponding filter button
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            if (btn.getAttribute('data-filter') === filterValue) {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                
                // Add active class to this button
                btn.classList.add('active');
                
                // Filter the hairstyles
                const hairstyleCards = document.querySelectorAll('.hairstyle-card');
                hairstyleCards.forEach(card => {
                    if (filterValue === 'all' || card.getAttribute('data-type').includes(filterValue)) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            }
        });
    }
}

// Mobile menu functionality
function initializeMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
}

// Scroll animations
function initializeScrollAnimations() {
    const scrollElements = document.querySelectorAll('.scroll-animate');
    
    const elementInView = (el, scrollOffset = 0) => {
        const elementTop = el.getBoundingClientRect().top;
        return (elementTop <= 
            (window.innerHeight || document.documentElement.clientHeight) - scrollOffset
        );
    };
    
    const displayScrollElement = (element) => {
        element.classList.add('scrolled');
    };
    
    const handleScrollAnimation = () => {
        scrollElements.forEach((el) => {
            if (elementInView(el, 100)) {
                displayScrollElement(el);
            }
        });
    };
    
    window.addEventListener('scroll', () => {
        handleScrollAnimation();
    });
}

// Utility function to show notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}