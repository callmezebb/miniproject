class BookingSystem {
    constructor() {
        this.selectedSalonId = null;
        this.selectedTimeSlot = null;
        this.selectedDate = null;
        this.currentStep = 1;
        this.token = localStorage.getItem('userToken');
        this.init();
    }

    async init() {
        try {
            // Check authentication first
            await this.checkAuthentication();
            
            // Only proceed with initialization if authenticated
            console.log('User authenticated, loading salons...');
            await this.loadSalons();
            
            // Set up the rest of the booking system
            this.checkForHairstyleRedirect();
            this.setupEventListeners();
            this.setMinDate();
            
            // Fill in selected hairstyle if exists
            this.fillSelectedHairstyle();
            
            console.log('Booking system initialized');
        } catch (error) {
            console.error('Initialization error:', error);
            // Don't show error message if it's an authentication error
            if (!error.message.includes('Authentication required')) {
                this.showError(error.message);
            }
        }
    }

    checkAuthentication() {
        return new Promise((resolve, reject) => {
            try {
                // Check if user is already logged in
                const token = localStorage.getItem('userToken');
                const userData = localStorage.getItem('userData');
                
                console.log('Authentication check:', {
                    hasToken: !!token,
                    hasUserData: !!userData
                });

                // If both token and userData exist, consider user authenticated
                if (token && userData) {
                    try {
                        // Parse userData to verify it's valid JSON
                        const parsedUserData = JSON.parse(userData);
                        if (parsedUserData) {
                            console.log('User authenticated:', parsedUserData.email || parsedUserData.name);
                            resolve();
                            return;
                        }
                    } catch (e) {
                        console.error('Invalid user data format:', e);
                    }
                }

                // If we reach here, authentication failed
                console.error('Authentication failed - redirecting to login');
                window.location.href = 'user-login.html';
                reject(new Error('Authentication required'));
                
            } catch (error) {
                console.error('Authentication check error:', error);
                reject(error);
            }
        });
    }

    handleAuthFailure(reason) {
        console.error('Authentication failed:', reason);
        sessionStorage.setItem('redirectAfterLogin', window.location.href);
        // Clear the selected hairstyle from localStorage
        localStorage.removeItem('selectedHairstyle');
        
        this.showError('Please log in to access the booking system');
        
        setTimeout(() => {
            window.location.href = 'user-login.html';
        }, 2000);
    }

    async loadSalons() {
        try {
            this.showLoading(true);
            const token = localStorage.getItem('userToken');
            
            const response = await fetch('http://localhost:5000/api/salons/registered', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load salons');
            }

            const salons = await response.json();
            
            if (!Array.isArray(salons) || salons.length === 0) {
                throw new Error('No registered salons found');
            }

            this.displaySalonCards(salons);
            console.log('Loaded salons:', salons);
        } catch (error) {
            console.error('Load salons error:', error);
            this.showError(`Failed to load salons: ${error.message}`);
            
            document.getElementById('salonGrid').innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Unable to load salons. Please try again later.</p>
                    <button onclick="window.location.reload()" class="retry-button">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            `;
        } finally {
            this.showLoading(false);
        }
    }

    displaySalonCards(salons) {
        const salonGrid = document.getElementById('salonGrid');
        salonGrid.innerHTML = '';
        
        salons.forEach(salon => {
            // Generate random rating for display purposes (remove in production)
            const rating = (Math.random() * 2 + 3).toFixed(1);
            const starsCount = Math.round(rating);
            
            // Create salon card
            const card = document.createElement('div');
            card.className = 'salon-card';
            card.dataset.salonId = salon._id;
            card.dataset.salonData = JSON.stringify(salon);
            
            card.innerHTML = `
                <div class="salon-selected-badge">
                    <i class="fas fa-check"></i>
                </div>
                <div class="salon-card-image">
                    <img src="${salon.image || 'images/salon-placeholder.jpg'}" alt="${this.escapeHtml(salon.name)}">
                </div>
                <div class="salon-card-body">
                    <h3 class="salon-card-title">${this.escapeHtml(salon.name)}</h3>
                    <div class="salon-card-info">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${this.escapeHtml(salon.location)}</span>
                    </div>
                    <div class="salon-card-info">
                        <i class="fas fa-phone"></i>
                        <span>${this.escapeHtml(salon.phone)}</span>
                    </div>
                    <div class="salon-card-info">
                        <i class="fas fa-clock"></i>
                        <span>${this.formatBusinessHours(salon.businessHours)}</span>
                    </div>
                    <div class="salon-rating">
                        <div class="stars">
                            ${this.generateStars(starsCount)}
                        </div>
                        <span>${rating}/5</span>
                    </div>
                </div>
                <div class="salon-card-footer">
                    <div class="salon-services-preview">
                        ${salon.services && salon.services.length > 0 
                            ? `${salon.services.length} services available` 
                            : 'Services info not available'}
                    </div>
                    <button class="select-salon-btn">Select</button>
                </div>
            `;
            
            card.addEventListener('click', () => this.handleSalonCardClick(card));
            salonGrid.appendChild(card);
        });
    }

    generateStars(count) {
        let stars = '';
        for (let i = 0; i < 5; i++) {
            if (i < count) {
                stars += '<i class="fas fa-star"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    }

    handleSalonCardClick(card) {
        console.log('Salon card clicked');
        
        // Remove selected class from all cards
        document.querySelectorAll('.salon-card').forEach(c => 
            c.classList.remove('selected'));
        
        // Add selected class to clicked card
        card.classList.add('selected');
        
        // Store the selected salon ID
        this.selectedSalonId = card.dataset.salonId;
        console.log('Selected salon ID:', this.selectedSalonId);
        
        // Enable the continue button
        const nextButton = document.getElementById('nextToStep2');
        if (nextButton) {
            nextButton.disabled = false;
            console.log('Next button enabled');
        }
        
        try {
            const salonData = JSON.parse(card.dataset.salonData);
            this.displaySalonDetails(salonData);
            document.getElementById('summarySalon').textContent = salonData.name;
        } catch (error) {
            console.error('Error displaying salon details:', error);
        }
    }

    displaySalonDetails(salon) {
        const detailsContainer = document.getElementById('salonDetails');
        detailsContainer.innerHTML = `
            <div class="salon-details">
                <h4>${this.escapeHtml(salon.name)}</h4>
                <div class="salon-info">
                    <div class="salon-info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${this.escapeHtml(salon.location)}</span>
                    </div>
                    <div class="salon-info-item">
                        <i class="fas fa-phone"></i>
                        <span>${this.escapeHtml(salon.phone)}</span>
                    </div>
                    <div class="salon-info-item">
                        <i class="fas fa-clock"></i>
                        <span>${this.formatBusinessHours(salon.businessHours)}</span>
                    </div>
                </div>
                ${salon.services && salon.services.length > 0 ? `
                    <div class="salon-services">
                        <h5>Services Offered:</h5>
                        <ul>
                            ${salon.services.map(service => `
                                <li>${this.escapeHtml(service.name)} - $${service.price}</li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
        detailsContainer.style.display = 'block';
    }

    checkForHairstyleRedirect() {
        const hairstyleData = sessionStorage.getItem('selectedHairstyle');
        if (hairstyleData) {
            try {
                const hairstyle = JSON.parse(hairstyleData);
                // Pre-fill the hairstyle request field
                const requestField = document.getElementById('hairstyleRequest');
                if (requestField) {
                    requestField.value = `I would like to get the "${hairstyle.name}" hairstyle.`;
                }
            } catch (error) {
                console.error('Error parsing hairstyle data:', error);
            }
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners');
        
        // Next buttons
        document.getElementById('nextToStep2').addEventListener('click', () => {
            console.log('Next to step 2 clicked');
            if (this.selectedSalonId) {
                this.goToStep(2);
            } else {
                this.showError('Please select a salon first');
            }
        });

        document.getElementById('nextToStep3').addEventListener('click', () => {
            console.log('Next to step 3 clicked');
            if (this.selectedDate && this.selectedTimeSlot) {
                this.goToStep(3);
            } else {
                this.showError('Please select both date and time');
            }
        });

        document.getElementById('nextToStep4').addEventListener('click', () => {
            console.log('Next to step 4 clicked');
            this.prepareAndGoToStep4();
        });

        // Back buttons
        document.getElementById('backToStep1').addEventListener('click', () => {
            console.log('Back to step 1 clicked');
            this.goToStep(1);
        });

        document.getElementById('backToStep2').addEventListener('click', () => {
            console.log('Back to step 2 clicked');
            this.goToStep(2);
        });

        document.getElementById('backToStep3').addEventListener('click', () => {
            console.log('Back to step 3 clicked');
            this.goToStep(3);
        });

        // Date selection
        document.getElementById('bookingDate').addEventListener('change', (e) => {
            this.handleDateSelection(e.target.value);
        });

        // Time slots container event delegation
        document.getElementById('timeSlots').addEventListener('click', (e) => {
            if (e.target.classList.contains('time-slot') && !e.target.classList.contains('booked')) {
                this.handleTimeSlotSelection(e.target);
            }
        });

        // Confirm booking
        document.getElementById('confirmBookingBtn').addEventListener('click', () => {
            this.confirmBooking();
        });
    }

    handleSalonSelection(select) {
        if (!select.value) {
            document.getElementById('selectedSalonDetails').style.display = 'none';
            document.getElementById('nextToStep2').disabled = true;
            return;
        }

        this.selectedSalonId = select.value;
        document.getElementById('nextToStep2').disabled = false;
        
        try {
            const selectedOption = select.options[select.selectedIndex];
            const salonData = JSON.parse(selectedOption.dataset.salon);
            this.displaySalonDetails(salonData);
            document.getElementById('summarySalon').textContent = salonData.name;
        } catch (error) {
            console.error('Error displaying salon details:', error);
        }
    }

    goToStep(step) {
        console.log(`Attempting to go to step ${step}`);
        
        // Validate step transition
        if (step === 2 && !this.selectedSalonId) {
            this.showError('Please select a salon first');
            return;
        }

        // Hide all steps
        const steps = document.querySelectorAll('.booking-step');
        steps.forEach(el => {
            el.classList.remove('active');
            console.log(`Removed active class from step ${el.id}`);
        });

        // Show target step
        const targetStep = document.getElementById(`step${step}`);
        if (targetStep) {
            targetStep.classList.add('active');
            console.log(`Added active class to step${step}`);
        } else {
            console.error(`Step ${step} element not found`);
            return;
        }

        // Update progress indicators
        const progressSteps = document.querySelectorAll('.progress-step');
        progressSteps.forEach(el => {
            const stepNum = parseInt(el.dataset.step);
            if (stepNum <= step) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });

        // Update current step
        this.currentStep = step;
        console.log(`Current step updated to ${step}`);

        // Scroll to top of the step
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async handleDateSelection(date) {
        try {
            this.selectedDate = date;
            this.showLoading(true);
            
            const response = await fetch('http://localhost:5000/api/bookings/available-slots', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                },
                body: JSON.stringify({
                    salonId: this.selectedSalonId,
                    date: date
                })
            });

            if (!response.ok) throw new Error('Failed to load time slots');
            
            const availableSlots = await response.json();
            this.displayTimeSlots(availableSlots);
            document.getElementById('summaryDate').textContent = new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error loading time slots:', error);
            this.showError('Failed to load available time slots');
        } finally {
            this.showLoading(false);
        }
    }

    displayTimeSlots(availableSlots) {
        const timeSlotsContainer = document.getElementById('timeSlots');
        const businessHours = this.generateTimeSlots();
        
        timeSlotsContainer.innerHTML = businessHours.map(time => {
            const isBooked = !availableSlots.includes(time);
            return `
                <div class="time-slot ${isBooked ? 'booked' : ''}" 
                     data-time="${time}" 
                     ${isBooked ? 'disabled' : ''}>
                    ${time}
                </div>
            `;
        }).join('');

        // Add click handlers for time slots
        timeSlotsContainer.querySelectorAll('.time-slot:not(.booked)').forEach(slot => {
            slot.addEventListener('click', () => this.handleTimeSlotSelection(slot));
        });
    }

    generateTimeSlots() {
        const slots = [];
        for (let hour = 9; hour <= 17; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
            slots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
        return slots;
    }

    handleTimeSlotSelection(slot) {
        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
        slot.classList.add('selected');
        this.selectedTimeSlot = slot.dataset.time;
        document.getElementById('summaryTime').textContent = this.selectedTimeSlot;
        document.getElementById('nextToStep3').disabled = false;
    }

    fillSelectedHairstyle() {
        const selectedService = localStorage.getItem('selectedService');
        if (selectedService) {
            const textarea = document.getElementById('hairstyleRequest');
            if (textarea) {
                textarea.value = `${selectedService}`;
            }
        }
    }

    prepareAndGoToStep4() {
        // Get service request from textarea or localStorage
        const serviceRequest = document.getElementById('hairstyleRequest').value || localStorage.getItem('selectedService') || 'No specific request';
        
        // Prepare summary elements
        const summaryElements = {
            'summarySalon': this.selectedSalonId ? document.querySelector(`.salon-card[data-id="${this.selectedSalonId}"] h4`)?.textContent : 'Not selected',
            'summaryDate': this.selectedDate ? new Date(this.selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) : 'Not selected',
            'summaryTime': this.selectedTimeSlot || 'Not selected',
            'summaryHairstyle': serviceRequest,
            'summaryInstructions': document.getElementById('specialInstructions').value || 'None'
        };

        // Update all summary elements
        Object.entries(summaryElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });

        // Go to step 4
        this.goToStep(4);
    }

    async confirmBooking() {
        if (!this.validateBooking()) {
            return;
        }

        try {
            this.showLoading(true);
            const userData = JSON.parse(localStorage.getItem('userData'));
            const serviceRequest = document.getElementById('hairstyleRequest').value || localStorage.getItem('selectedService') || '';
            
            const bookingData = {
                salonId: this.selectedSalonId,
                date: this.selectedDate,
                time: this.selectedTimeSlot,
                hairstyleRequest: serviceRequest,
                specialInstructions: document.getElementById('specialInstructions')?.value || '',
                userName: userData.name || '',
                userEmail: userData.email || '',
                userPhone: userData.phone || '',
                createdAt: new Date().toISOString(),
                status: 'pending'
            };

            const response = await fetch('http://localhost:5000/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(bookingData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create booking');
            }

            const result = await response.json();

            // Clear service selection from localStorage after successful booking
            localStorage.removeItem('selectedService');

            this.showBookingSuccess(result);
            this.showSuccess('Booking confirmed successfully!');
            setTimeout(() => {
                window.location.href = 'my-appointments.html';
            }, 2000);

        } catch (error) {
            console.error('Error creating booking:', error);
            this.showError(`Booking failed: ${error.message}`);
        } finally {
            this.showLoading(false);
        }
    }

    validateBooking() {
        if (!this.selectedSalonId) {
            this.showError('Please select a salon');
            this.goToStep(1);
            return false;
        }
        
        if (!this.selectedDate) {
            this.showError('Please select a date');
            this.goToStep(2);
            return false;
        }
        
        if (!this.selectedTimeSlot) {
            this.showError('Please select a time slot');
            this.goToStep(2);
            return false;
        }
        
        const hairstyleRequest = document.getElementById('hairstyleRequest').value.trim();
        if (!hairstyleRequest) {
            this.showError('Please describe your desired hairstyle');
            this.goToStep(3);
            return false;
        }
        
        return true;
    }

    showBookingSuccess(bookingData) {
        // Hide the booking form
        document.querySelector('.booking-form-wrapper').style.display = 'none';
        
        // Show success message
        const successDiv = document.getElementById('bookingSuccess');
        successDiv.style.display = 'block';
        
        // Update booking ID
        document.getElementById('bookingId').textContent = bookingData._id;
        
        // Add booking details to success message
        const successContent = `
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>Booking Confirmed!</h3>
            <div class="booking-details">
                <p>Your appointment has been successfully booked.</p>
                <p>Booking ID: ${bookingData._id}</p>
                <p>Date: ${new Date(bookingData.date).toLocaleDateString()}</p>
                <p>Time: ${bookingData.time}</p>
                <p>Salon: ${document.getElementById('summarySalon').textContent}</p>
            </div>
            <div class="success-actions">
                <a href="user-dashboard.html" class="primary-button">
                    <i class="fas fa-user"></i> Go to Dashboard
                </a>
            </div>
        `;
        
        successDiv.innerHTML = successContent;
    }

    showSuccess(message) {
        const successDiv = document.getElementById('bookingSuccess');
        if (successDiv) {
            document.querySelector('.booking-form-wrapper').style.display = 'none';
            successDiv.style.display = 'block';
            successDiv.textContent = message;
        }
    }

    showError(message) {
        const errorContainer = document.getElementById('errorMessages');
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
            
            setTimeout(() => {
                errorContainer.style.display = 'none';
            }, 5000);
        }
    }

    showLoading(show = true) {
        const loader = document.getElementById('loadingIndicator');
        if (show) {
            loader.style.display = 'flex';
            loader.innerHTML = `
                <i class="fas fa-spinner fa-spin"></i>
                Loading...
            `;
        } else {
            loader.style.display = 'none';
        }
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    formatBusinessHours(hours) {
        if (!hours) return 'Hours not available';
        return `${hours.open} - ${hours.close}`;
    }

    setMinDate() {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('bookingDate');
        if (dateInput) {
            dateInput.min = today;
        }
    }
}

// Initialize booking system
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing booking system');
    new BookingSystem();
});

function logout() {
    // Clear all stored data
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    sessionStorage.clear();
    
    // Redirect to login page
    window.location.href = 'user-login.html';
}