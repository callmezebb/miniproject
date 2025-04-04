document.addEventListener('DOMContentLoaded', function() {
    // Check if user is coming from face analysis
    const fromFaceAnalysis = sessionStorage.getItem('fromFaceAnalysis');
    const analyzedFaceShape = sessionStorage.getItem('analyzedFaceShape');

    // Initialize page without authentication redirect
    initializeHairstylesPage();

    // If coming from face analysis, handle the redirect
    if (fromFaceAnalysis && analyzedFaceShape) {
        handleFaceAnalysisRedirect();
    }
});

function initializeHairstylesPage() {
    // Initialize filters
    initializeFilters();

    // Update navigation state
    updateNavigationState();
}

function updateNavigationState() {
    // Add active class to current page in navigation
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === 'hairstyles.html') {
            link.classList.add('active');
        }
    });
}

function handleFaceAnalysisRedirect() {
    // Clear the session storage flags
    sessionStorage.removeItem('fromFaceAnalysis');
    const faceShape = sessionStorage.getItem('analyzedFaceShape');
    sessionStorage.removeItem('analyzedFaceShape');

    if (faceShape) {
        // Find and click the corresponding filter button
        const filterButton = document.querySelector(`.filter-btn[data-filter="${faceShape}"]`);
        if (filterButton) {
            setTimeout(() => {
                filterButton.click();
                // Scroll to the hairstyles section
                document.querySelector('#hairstyles').scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }
}

// Add logout functionality
function logout() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'user-login.html';
}

function updateUserInterface() {
    try {
        // Try to get either user or salon data
        const userData = JSON.parse(localStorage.getItem('userData')) || 
                        JSON.parse(localStorage.getItem('salonData'));
        
        if (userData) {
            // Update user name if the element exists
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = userData.name || userData.salonName || 'User';
            }
        }
    } catch (error) {
        console.error('Error updating UI:', error);
    }
}

// Add this debugging function
function debugLocalStorage() {
    console.log('LocalStorage Contents:');
    console.log('userToken:', localStorage.getItem('userToken'));
    console.log('salonToken:', localStorage.getItem('salonToken'));
    console.log('userData:', localStorage.getItem('userData'));
    console.log('salonData:', localStorage.getItem('salonData'));
}

// Call this when page loads
debugLocalStorage();

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
            
            // Filter hairstyles
            filterHairstyles(filterValue);
        });
    });

    // Initially show all styles
    document.querySelector('.filter-btn[data-filter="all"]')?.click();
}

function filterHairstyles(filterValue) {
    const hairstyleCards = document.querySelectorAll('.hairstyle-card');
    
            hairstyleCards.forEach(card => {
                const cardTypes = card.getAttribute('data-type').split(' ');
                
                if (filterValue === 'all' || cardTypes.includes(filterValue)) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.5s ease';
                } else {
                    card.style.display = 'none';
                }
            });
}

function bookHairstyle(style) {
    // Store selected hairstyle in localStorage
    localStorage.setItem('selectedStyle', style);
    window.location.href = 'booking.html';
}

// Add styles
const styles = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(20px);
        }
    }

    .recommended {
        border: 2px solid #3498db;
        transform: scale(1.02);
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .recommended-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background-color: #3498db;
        color: white;
        padding: 5px 10px;
        border-radius: 20px;
        font-size: 0.8rem;
        display: flex;
        align-items: center;
        gap: 5px;
        z-index: 1;
    }

    .recommended-badge i {
        color: #ffd700;
    }

    .filter-btn {
        padding: 8px 16px;
        margin: 0 5px;
        border: 2px solid #3498db;
        border-radius: 25px;
        background-color: white;
        color: #3498db;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
    }

    .filter-btn:hover {
        background-color: #3498db;
        color: white;
    }

    .filter-btn.active {
        background-color: #3498db;
        color: white;
    }

    .hairstyle-card {
        position: relative;
        transition: all 0.3s ease;
    }

    .hairstyle-card.recommended:hover {
        transform: translateY(-5px) scale(1.02);
    }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Add these styles to your existing styles
const additionalStyles = `
    .highlight-animation {
        animation: highlight 1s ease-in-out;
    }

    @keyframes highlight {
        0% {
            transform: scale(1);
            box-shadow: 0 0 0 rgba(52, 152, 219, 0);
        }
        50% {
            transform: scale(1.05);
            box-shadow: 0 0 20px rgba(52, 152, 219, 0.3);
        }
        100% {
            transform: scale(1);
            box-shadow: 0 0 0 rgba(52, 152, 219, 0);
        }
    }

    .recommended {
        border: 2px solid #3498db;
        transform: scale(1.02);
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        position: relative;
        z-index: 2;
    }

    .recommended-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background-color: #3498db;
        color: white;
        padding: 8px 15px;
        border-radius: 20px;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 5px;
        z-index: 3;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        animation: badgeAppear 0.5s ease-out;
    }

    .recommended-badge i {
        color: #ffd700;
    }

    @keyframes badgeAppear {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .hairstyle-card {
        transition: all 0.3s ease;
    }

    .recommended:hover {
        transform: translateY(-5px) scale(1.02);
    }

    /* Smooth scrolling for the entire page */
    html {
        scroll-behavior: smooth;
    }
`;

// Add the styles to the document
const styleSheetAdditional = document.createElement('style');
styleSheetAdditional.textContent = additionalStyles;
document.head.appendChild(styleSheetAdditional);

// Add this to your existing hairstyles.js
function createHairstyleCard(hairstyle) {
    return `
        <div class="hairstyle-card" data-type="${hairstyle.faceShape}">
            <img src="${hairstyle.image}" alt="${hairstyle.name}">
            <div class="hairstyle-info">
                <h3>${hairstyle.name}</h3>
                <p>${hairstyle.description}</p>
                <button class="book-style-btn" onclick="redirectToBooking('${hairstyle.id}', '${hairstyle.name}')">
                    <i class="fas fa-calendar-alt"></i> Book This Style
                </button>
            </div>
        </div>
    `;
}

function redirectToBooking(hairstyleId, hairstyleName) {
    // Store hairstyle details in sessionStorage
    sessionStorage.setItem('selectedHairstyle', JSON.stringify({
        id: hairstyleId,
        name: hairstyleName
    }));
    window.location.href = 'booking.html';
}


