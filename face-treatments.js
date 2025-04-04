class FaceTreatmentsManager {
    constructor() {
        this.init();
    }

    async init() {
        await this.checkAuthentication();
        this.loadTreatmentServices();
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
                this.filterTreatments(button.dataset.filter);
            });
        });
    }

    filterTreatments(category) {
        const cards = document.querySelectorAll('.treatment-card');
        cards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    loadTreatmentServices() {
        const treatmentServices = [
            {
                id: 1,
                name: "Executive Facial",
                description: "A comprehensive facial treatment designed for the modern professional. Includes deep cleansing, exfoliation, and premium moisturizing.",
                image: "images/Executive Facial.webp",
                category: "facial",
                duration: "60 min",
                price: "$89",
                benefits: [
                    "Deep pore cleansing",
                    "Stress relief",
                    "Improved skin tone",
                    "Anti-aging effects"
                ]
            },
            {
                id: 2,
                name: "24K Gold Mask",
                description: "Luxurious gold-infused mask treatment that promotes collagen production and skin cell renewal.",
                image: "images/24K Gold Mask.webp",
                category: "mask",
                duration: "45 min",
                price: "$120",
                benefits: [
                    "Skin brightening",
                    "Reduced fine lines",
                    "Enhanced circulation",
                    "Luxury experience"
                ]
            },
            {
                id: 3,
                name: "Hydration Therapy",
                description: "Advanced hydration treatment using hyaluronic acid and vitamin-rich serums for maximum moisture retention.",
                image: "images/Hydration Therapy.webp",
                category: "therapy",
                duration: "75 min",
                price: "$95",
                benefits: [
                    "Deep hydration",
                    "Plumped skin",
                    "Balanced oil production",
                    "Long-lasting results"
                ]
            },
            {
                id: 4,
                name: "Gentleman's Facial",
                description: "Classic facial treatment tailored for men's skin concerns, including razor burn and ingrown hairs.",
                image: "images/Gentleman's Facial.webp",
                category: "facial",
                duration: "50 min",
                price: "$75",
                benefits: [
                    "Reduced razor burn",
                    "Clearer complexion",
                    "Soothing treatment",
                    "Preventive care"
                ]
            },
            {
                id: 5,
                name: "Charcoal Detox Mask",
                description: "Deep-cleansing activated charcoal mask that removes impurities and excess oil.",
                image: "images/Charcoal Detox Mask.webp",
                category: "mask",
                duration: "40 min",
                price: "$65",
                benefits: [
                    "Deep pore cleansing",
                    "Oil control",
                    "Blackhead removal",
                    "Skin purification"
                ]
            },
            {
                id: 6,
                name: "Anti-Aging Therapy",
                description: "Premium anti-aging treatment using peptides and retinol to reduce fine lines and improve skin texture.",
                image: "images/anti-aging-therapy.jpg",
                category: "therapy",
                duration: "90 min",
                price: "$150",
                benefits: [
                    "Reduced wrinkles",
                    "Improved elasticity",
                    "Even skin tone",
                    "Cellular renewal"
                ]
            },
            {
                id: 7,
                name: "LED Light Therapy",
                description: "Advanced LED light treatment for various skin concerns including acne and aging.",
                image: "images/led-therapy.jpg",
                category: "therapy",
                duration: "45 min",
                price: "$85",
                benefits: [
                    "Acne reduction",
                    "Collagen stimulation",
                    "Skin healing",
                    "No downtime"
                ]
            },
            {
                id: 8,
                name: "Vitamin C Facial",
                description: "Brightening facial treatment rich in Vitamin C for a radiant, even complexion.",
                image: "images/vitamin-c-facial.jpg",
                category: "facial",
                duration: "60 min",
                price: "$95",
                benefits: [
                    "Brightened complexion",
                    "Antioxidant protection",
                    "Collagen boost",
                    "Even skin tone"
                ]
            }
        ];

        const grid = document.getElementById('treatmentServicesGrid');
        grid.innerHTML = treatmentServices.map(service => this.createServiceCard(service)).join('');
    }

    createServiceCard(service) {
        return `
            <div class="treatment-card" data-category="${service.category}">
                <img src="${service.image}" alt="${service.name}" class="treatment-image">
                <div class="treatment-info">
                    <h3 class="treatment-name">${service.name}</h3>
                    <p class="treatment-description">${service.description}</p>
                    <div class="treatment-benefits">
                        <div class="benefits-title">Benefits:</div>
                        <ul class="benefits-list">
                            ${service.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="treatment-meta">
                        <div class="treatment-details">
                            <span class="treatment-duration">
                                <i class="far fa-clock"></i> ${service.duration}
                            </span>
                            <span class="treatment-price">
                                <i class="fas fa-tag"></i> ${service.price}
                            </span>
                        </div>
                        <a href="booking.html?service=treatment&name=${encodeURIComponent(service.name)}" 
                           class="book-treatment-btn">
                            <i class="fas fa-calendar-plus"></i> Book Now
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize the treatments page
document.addEventListener('DOMContentLoaded', () => {
    const faceTreatmentsManager = new FaceTreatmentsManager();
});

// Logout function
function logout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    window.location.href = 'user-login.html';
} 