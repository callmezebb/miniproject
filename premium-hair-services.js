class PremiumHairServicesManager {
    constructor() {
        this.init();
    }

    async init() {
        await this.checkAuthentication();
        this.loadPremiumServices();
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
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.filterServices(button.dataset.filter);
            });
        });

        // Add click handlers for service cards
        const serviceCards = document.querySelectorAll('.service-card');
        serviceCards.forEach(card => {
            // Add click handler for the entire card
            card.addEventListener('click', function(e) {
                // Get the service name from the h3 element
                const selectedService = card.querySelector('.service-name').textContent;
                
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
            const bookButton = card.querySelector('.book-service-btn');
            if (bookButton) {
                bookButton.addEventListener('click', function(e) {
                    e.preventDefault(); // Prevent default link behavior
                    e.stopPropagation(); // Prevent the click from bubbling up to the card
                    
                    // Get the service name from the parent card's h3 element
                    const selectedService = e.currentTarget.closest('.service-card').querySelector('.service-name').textContent;
                    
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

    filterServices(category) {
        const cards = document.querySelectorAll('.service-card');
        cards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    loadPremiumServices() {
        const premiumServices = [
            {
                id: 1,
                name: "Keratin Treatment",
                description: "Professional keratin smoothing treatment that eliminates frizz and adds incredible shine. Perfect for managing unruly hair.",
                
                category: "treatment",
                duration: "120 min",
                price: "$200",
                benefits: [
                    "Eliminates frizz for up to 6 months",
                    "Reduces styling time by 50%",
                    "Adds brilliant shine",
                    "Makes hair more manageable"
                ],
                maintenance: "Recommended every 4-6 months"
            },
            {
                id: 2,
                name: "Hair Spa Therapy",
                description: "Luxury hair spa treatment combining scalp massage, deep conditioning, and steam therapy for ultimate hair rejuvenation.",
                
                category: "treatment",
                duration: "90 min",
                price: "$120",
                benefits: [
                    "Deep nourishment",
                    "Stress relief",
                    "Improved hair texture",
                    "Scalp health improvement"
                ],
                maintenance: "Recommended monthly"
            },
            {
                id: 3,
                name: "Scalp Micropigmentation",
                description: "Advanced cosmetic procedure that creates the appearance of fuller hair using specialized pigments.",

                category: "specialized",
                duration: "180 min",
                price: "$800",
                benefits: [
                    "Natural-looking results",
                    "Non-invasive procedure",
                    "Long-lasting solution",
                    "Immediate results"
                ],
                maintenance: "Touch-up every 4-6 years"
            },
            {
                id: 4,
                name: "Hair Loss Treatment",
                description: "Comprehensive treatment program using PRP therapy and specialized products to combat hair loss.",
                
                category: "specialized",
                duration: "60 min",
                price: "$350",
                benefits: [
                    "Stimulates hair growth",
                    "Strengthens existing hair",
                    "Improves scalp health",
                    "Natural results"
                ],
                maintenance: "Monthly sessions recommended"
            },
            {
                id: 5,
                name: "Premium Hair Extensions",
                description: "High-quality human hair extensions applied using advanced methods for natural-looking length and volume.",
                
                category: "styling",
                duration: "150 min",
                price: "$400",
                benefits: [
                    "Instant length and volume",
                    "Natural look and feel",
                    "Various styling options",
                    "Premium quality hair"
                ],
                maintenance: "Maintenance every 6-8 weeks"
            },
            {
                id: 6,
                name: "Japanese Straightening",
                description: "Permanent thermal reconditioning treatment for perfectly straight, smooth hair.",
                
                category: "treatment",
                duration: "240 min",
                price: "$350",
                benefits: [
                    "Permanent results",
                    "Silky smooth texture",
                    "Eliminates daily straightening",
                    "Long-lasting effects"
                ],
                maintenance: "Touch-up every 6-8 months"
            },
            {
                id: 7,
                name: "Hair Botox Treatment",
                description: "Deep conditioning and restructuring treatment that repairs damaged hair from within.",
                
                category: "treatment",
                duration: "90 min",
                price: "$180",
                benefits: [
                    "Deep hair repair",
                    "Eliminates frizz",
                    "Adds shine and softness",
                    "Improves hair health"
                ],
                maintenance: "Recommended every 3-4 months"
            },
            {
                id: 8,
                name: "Custom Hair System",
                description: "Personalized non-surgical hair replacement system tailored to your specific needs and style.",
                
                category: "specialized",
                duration: "120 min",
                price: "$500",
                benefits: [
                    "Natural appearance",
                    "Custom color matching",
                    "Secure attachment",
                    "Immediate results"
                ],
                maintenance: "Monthly maintenance required"
            },
            {
                id: 9,
                name: "Olaplex Treatment",
                description: "Professional bond-building treatment that repairs and strengthens damaged hair at a molecular level.",
                
                category: "treatment",
                duration: "60 min",
                price: "$120",
                benefits: [
                    "Repairs broken bonds",
                    "Strengthens hair structure",
                    "Prevents damage",
                    "Suitable for all hair types"
                ],
                maintenance: "Recommended monthly"
            },
            {
                id: 10,
                name: "Luxury Scalp Treatment",
                description: "Premium scalp care treatment including exfoliation, massage, and specialized serums for optimal scalp health.",
                
                category: "treatment",
                duration: "75 min",
                price: "$150",
                benefits: [
                    "Deep scalp cleansing",
                    "Promotes hair growth",
                    "Balances scalp oils",
                    "Relieves tension"
                ],
                maintenance: "Recommended every 4-6 weeks"
            }
        ];

        const grid = document.getElementById('premiumServicesGrid');
        grid.innerHTML = premiumServices.map(service => this.createServiceCard(service)).join('');
    }

    createServiceCard(service) {
        return `
            <div class="service-card" data-category="${service.category}">
                
                <div class="service-category">${service.category}</div>
                <div class="service-info">
                    <h3 class="service-name">${service.name}</h3>
                    <p class="service-description">${service.description}</p>
                    <div class="service-benefits">
                        <div class="benefits-title">Benefits:</div>
                        <ul class="benefits-list">
                            ${service.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="service-meta">
                        <div class="service-details">
                            <span class="service-duration">
                                <i class="far fa-clock"></i> ${service.duration}
                            </span>
                            <span class="service-price">
                                <i class="fas fa-tag"></i> ${service.price}
                            </span>
                            <span class="service-maintenance">
                                <i class="fas fa-sync"></i> ${service.maintenance}
                            </span>
                        </div>
                        <a href="booking.html?service=${encodeURIComponent(service.name)}" 
                           class="book-service-btn">
                            <i class="fas fa-calendar-plus"></i> Book Now
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize the services page
document.addEventListener('DOMContentLoaded', () => {
    const hairServicesManager = new PremiumHairServicesManager();
});

// Logout function
function logout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    window.location.href = 'user-login.html';
} 