class BeardStylesManager {
    constructor() {
        this.init();
    }

    async init() {
        await this.checkAuthentication();
        this.loadBeardStyles();
        this.setupEventListeners();
    }

    async checkAuthentication() {
        const token = localStorage.getItem('userToken');
        const userData = localStorage.getItem('userData');
        
        if (!token || !userData) {
            window.location.href = 'user-login.html';
            throw new Error('Authentication required');
        }
    }

    setupEventListeners() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');
                // Filter styles
                this.filterStyles(button.dataset.filter);
            });
        });

        // Add click handlers for beard style cards
        const styleCards = document.querySelectorAll('.style-card');
        styleCards.forEach(card => {
            // Add click handler for the entire card
            card.addEventListener('click', function(e) {
                // Get the style name from the h3 element
                const selectedService = card.querySelector('.style-name').textContent;
                
                // Store the service name in localStorage
                localStorage.setItem('selectedService', selectedService);
                console.log('Selected service:', selectedService);
                
                // Auto-fill the textarea in booking form
                const bookingForm = document.querySelector('.booking-form-wrapper');
                if (bookingForm) {
                    const textarea = bookingForm.querySelector('#hairstyleRequest');
                    if (textarea) {
                        textarea.value = `${selectedService}`;
                    }
                }
                
                // Redirect to booking page
                window.location.href = 'booking.html';
            });
            
            // Add click handler for the book button specifically
            const bookButton = card.querySelector('.book-style-btn');
            if (bookButton) {
                bookButton.addEventListener('click', function(e) {
                    e.preventDefault(); // Prevent default link behavior
                    e.stopPropagation(); // Prevent the click from bubbling up to the card
                    
                    // Get the style name from the parent card's h3 element
                    const selectedService = e.currentTarget.closest('.style-card').querySelector('.style-name').textContent;
                    
                    // Store the service name in localStorage
                    localStorage.setItem('selectedService', selectedService);
                    console.log('Selected service:', selectedService);
                    
                    // Auto-fill the textarea in booking form
                    const bookingForm = document.querySelector('.booking-form-wrapper');
                    if (bookingForm) {
                        const textarea = bookingForm.querySelector('#hairstyleRequest');
                        if (textarea) {
                            textarea.value = `${selectedService}`;
                        }
                    }
                    
                    // Redirect to booking page
                    window.location.href = 'booking.html';
                });
            }
        });
    }

    filterStyles(category) {
        const cards = document.querySelectorAll('.style-card');
        cards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    loadBeardStyles() {
        const beardStyles = [
            {
                id: 1,
                name: "Corporate Beard",
                description: "A well-groomed, medium-length beard that's perfect for professional settings. Neatly trimmed and shaped to maintain a clean, business-appropriate appearance.",
                image: "images/corporate-beard.jpg",
                category: "medium",
                duration: "35 min"
            },
            {
                id: 2,
                name: "Professional Stubble",
                description: "A precisely maintained short stubble that offers a clean, sophisticated look. Ideal for modern business environments and formal occasions.",
                image: "images/professional-stubble.jpg",
                category: "short",
                duration: "25 min"
            },
            {
                id: 3,
                name: "Executive Contour",
                description: "A short, perfectly contoured beard that follows the jawline. Creates a sharp, defined look suitable for executive positions.",
                image: "images/executive-contour.jpg",
                category: "short",
                duration: "30 min"
            },
            {
                id: 4,
                name: "Classic Business Goatee",
                description: "A neat, trimmed goatee with clean lines and professional appearance. Perfect for those who want a minimal yet sophisticated facial hair style.",
                image: "images/business-goatee.jpg",
                category: "short",
                duration: "25 min"
            },
            {
                id: 5,
                name: "Refined Circle Beard",
                description: "A precisely trimmed circle beard that connects the mustache to a rounded goatee. Offers a polished look suitable for formal settings.",
                image: "images/refined-circle.jpg",
                category: "short",
                duration: "30 min"
            },
            {
                id: 6,
                name: "Modern Van Dyke",
                description: "A contemporary take on the Van Dyke style, featuring a trimmed mustache and goatee combination. Perfect for creative professionals.",
                image: "images/modern-van-dyke.jpg",
                category: "medium",
                duration: "35 min"
            },
            {
                id: 7,
                name: "Structured Full Beard",
                description: "A well-maintained full beard with defined lines and proper tapering. Suitable for professionals who prefer a fuller yet neat appearance.",
                image: "images/structured-full.jpg",
                category: "medium",
                duration: "40 min"
            },
            {
                id: 8,
                name: "Tailored Boxed Beard",
                description: "A clean-cut, boxed beard style with sharp angles and precise lines. Ideal for those wanting a modern yet professional look.",
                image: "images/tailored-boxed.jpg",
                category: "medium",
                duration: "35 min"
            }
        ];

        const grid = document.getElementById('beardStylesGrid');
        grid.innerHTML = beardStyles.map(style => this.createStyleCard(style)).join('');
    }

    createStyleCard(style) {
        return `
            <div class="style-card" data-category="${style.category}">
                <img src="${style.image}" alt="${style.name}" class="style-image">
                <div class="style-info">
                    <h3 class="style-name">${style.name}</h3>
                    <p class="style-description">${style.description}</p>
                    <div class="style-meta">
                        <span class="style-duration">
                            <i class="far fa-clock"></i> ${style.duration}
                        </span>
                        <a href="booking.html?style=beard&name=${encodeURIComponent(style.name)}" 
                           class="book-style-btn">
                            <i class="fas fa-calendar-plus"></i> Book Now
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize the beard styles page
document.addEventListener('DOMContentLoaded', () => {
    const beardStylesManager = new BeardStylesManager();
});

// Logout function
function logout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    window.location.href = 'user-login.html';
} 