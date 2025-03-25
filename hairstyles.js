document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!checkAuth()) return;

    // Initialize filters
    initializeFilters();

    // Handle URL parameters
    handleUrlParameters();
});

function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const hairstyleCards = document.querySelectorAll('.hairstyle-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get filter value
            const filterValue = button.getAttribute('data-filter');
            
            // Filter cards
            hairstyleCards.forEach(card => {
                const cardTypes = card.getAttribute('data-type').split(' ');
                
                if (filterValue === 'all' || cardTypes.includes(filterValue)) {
                    card.style.display = 'block';
                    // Add animation
                    card.style.animation = 'fadeIn 0.5s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

function handleUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const faceShape = urlParams.get('faceShape');
    
    if (faceShape) {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            if (button.getAttribute('data-filter') === faceShape) {
                button.click();
            }
        });
    }
}

function bookHairstyle(style) {
    // Store selected hairstyle in localStorage
    localStorage.setItem('selectedStyle', style);
    window.location.href = 'booking.html';
}

// Animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

