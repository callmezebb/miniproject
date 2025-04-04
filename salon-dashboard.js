document.addEventListener('DOMContentLoaded', function() {
    console.log('Salon Dashboard Loading...');
    
    // Get authentication data from localStorage
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    const salonId = localStorage.getItem('salonId');
    const salonName = localStorage.getItem('salonName');
    
    // Log auth data (without exposing the actual token)
    console.log('Auth Check:', {
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        userType: userType,
        salonId: salonId
    });
    
    // Redirect to login if not authenticated
    if (!token || userType !== 'salon' || !salonId) {
        console.log('Not authenticated as salon, redirecting to login');
        window.location.href = 'salon-login.html';
        return;
    }

    // Set up tab navigation
    setupTabs();
    
    // Load salon data into the dashboard
    loadSalonData();
    
    // Load bookings
    loadBookings();
    
    // Add logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Clear authentication data
            localStorage.removeItem('token');
            localStorage.removeItem('userType');
            localStorage.removeItem('salonId');
            localStorage.removeItem('salonName');
            localStorage.removeItem('salonPhone');
            localStorage.removeItem('salonLocation');
            localStorage.removeItem('salonDescription');
            localStorage.removeItem('salonBusinessHours');
            localStorage.removeItem('salonServices');
            
            // Redirect to login page
            window.location.href = 'salon-login.html';
        });
    }
});

// Set up tab navigation
function setupTabs() {
    const tabLinks = document.querySelectorAll('.sidebar-menu a');
    
    tabLinks.forEach(tabLink => {
        tabLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs
            tabLinks.forEach(link => link.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show selected tab content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// Load salon data into the dashboard
function loadSalonData() {
    // Get salon data from localStorage
    const salonName = localStorage.getItem('salonName') || 'Your Salon';
    const salonPhone = localStorage.getItem('salonPhone') || '-';
    const salonLocation = localStorage.getItem('salonLocation') || '-';
    const salonEmail = localStorage.getItem('salonEmail') || '-';
    const salonDescription = localStorage.getItem('salonDescription') || '';
    
    // Try to parse business hours and services from localStorage
    let businessHours = {};
    let services = [];
    
    try {
        const storedHours = localStorage.getItem('salonBusinessHours');
        if (storedHours) {
            businessHours = JSON.parse(storedHours);
        }
    } catch (e) {
        console.error('Error parsing business hours:', e);
    }

    try {
        const storedServices = localStorage.getItem('salonServices');
        if (storedServices) {
            services = JSON.parse(storedServices);
        }
    } catch (e) {
        console.error('Error parsing services:', e);
    }
    
    // Update salon name in all locations
    document.querySelectorAll('#salonName, #sidebarSalonName').forEach(el => {
        el.textContent = salonName;
    });
    
    // Update overview information
    if (document.getElementById('overviewPhone')) {
        document.getElementById('overviewPhone').textContent = salonPhone;
    }
    
    if (document.getElementById('overviewLocation')) {
        document.getElementById('overviewLocation').textContent = salonLocation;
    }
    
    if (document.getElementById('overviewEmail')) {
        document.getElementById('overviewEmail').textContent = salonEmail;
    }
    
    // Update business hours
    const hoursContainer = document.getElementById('hoursContainer');
    if (hoursContainer) {
        hoursContainer.innerHTML = '';
        
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        days.forEach((day, index) => {
            const dayCard = document.createElement('div');
            dayCard.className = 'day-card';
            
            let hoursText = 'Closed';
            if (businessHours[day] && businessHours[day].open && businessHours[day].close) {
                hoursText = `${formatTime(businessHours[day].open)} - ${formatTime(businessHours[day].close)}`;
            }
            
            dayCard.innerHTML = `
                <strong>${dayNames[index]}</strong>
                <span>${hoursText}</span>
            `;
            
            hoursContainer.appendChild(dayCard);
        });
    }
    
    // Update services
    const servicesContainer = document.getElementById('servicesContainer');
    if (servicesContainer) {
        servicesContainer.innerHTML = '';
        
        if (services.length > 0) {
            services.forEach(service => {
                const serviceCard = document.createElement('div');
                serviceCard.className = 'service-card';
                serviceCard.innerHTML = `
                    <h3>${service.name}</h3>
                    <p>${service.description || 'No description provided.'}</p>
                    <div class="service-meta">
                        <span>$${service.price.toFixed(2)}</span>
                        <span>${service.duration} min</span>
                    </div>
                `;
                servicesContainer.appendChild(serviceCard);
            });
        } else {
            servicesContainer.innerHTML = `
                <p>No services have been added yet.</p>
            `;
        }
    }
    
    // If we don't have salon data, try to fetch it from the server
    if (!salonPhone || !salonLocation) {
        fetchSalonDataFromServer();
    }
}

// Format time from 24-hour to 12-hour format
function formatTime(timeString) {
    if (!timeString) return '';
    
    let [hours, minutes] = timeString.split(':');
    hours = parseInt(hours);
    
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert to 12-hour format
    
    return `${hours}:${minutes} ${ampm}`;
}

// Fetch salon data from the server
function fetchSalonDataFromServer() {
    const token = localStorage.getItem('token');
    const salonId = localStorage.getItem('salonId');
    
    if (!token || !salonId) return;
    
    const API_URL = 'http://localhost:5000/api';
    
    fetch(`${API_URL}/salons/${salonId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch salon data');
        }
        return response.json();
    })
    .then(data => {
        console.log('Salon data fetched:', data);
        
        if (data.data) {
            // Update localStorage with the fetched data
            localStorage.setItem('salonName', data.data.name || 'Your Salon');
            localStorage.setItem('salonPhone', data.data.phone || '-');
            localStorage.setItem('salonLocation', data.data.location || '-');
            localStorage.setItem('salonEmail', data.data.email || '-');
            localStorage.setItem('salonDescription', data.data.description || '');
            
            if (data.data.businessHours) {
                localStorage.setItem('salonBusinessHours', JSON.stringify(data.data.businessHours));
            }
            
            if (data.data.services) {
                localStorage.setItem('salonServices', JSON.stringify(data.data.services));
            }
            
            // Reload the salon data in the UI
            loadSalonData();
        }
    })
    .catch(error => {
        console.error('Error fetching salon data:', error);
    });
}

// Load bookings data
function loadBookings() {
    const token = localStorage.getItem('token');
    const salonId = localStorage.getItem('salonId');
    
    if (!token || !salonId) return;
    
    const API_URL = 'http://localhost:5000/api';
    
    fetch(`${API_URL}/bookings/salon/${salonId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch bookings');
        }
        return response.json();
    })
    .then(data => {
        console.log('Bookings fetched:', data);
        
        // Display bookings in both recent and all bookings sections
        displayRecentBookings(data.data || []);
        displayAllBookings(data.data || []);
    })
    .catch(error => {
        console.error('Error fetching bookings:', error);
        
        // Display error message in bookings containers
        const recentBookingsContainer = document.getElementById('recentBookingsContainer');
        const allBookingsContainer = document.getElementById('allBookingsContainer');
        
        const errorMessage = `
            <div class="no-bookings">
                <p>Failed to load bookings. Please refresh the page to try again.</p>
            </div>
        `;
        
        if (recentBookingsContainer) {
            recentBookingsContainer.innerHTML = errorMessage;
        }
        
        if (allBookingsContainer) {
            allBookingsContainer.innerHTML = errorMessage;
        }
    });
}

// Display recent bookings
function displayRecentBookings(bookings) {
    const recentBookingsContainer = document.getElementById('recentBookingsContainer');
    if (!recentBookingsContainer) return;
    
    if (bookings.length === 0) {
        recentBookingsContainer.innerHTML = `
            <div class="no-bookings">
                <p>No bookings found.</p>
                <p>When users make bookings with your salon, they will appear here.</p>
            </div>
        `;
        return;
    }
    
    // Sort bookings by date, newest first
    bookings.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Display only the 3 most recent bookings
    const recentBookings = bookings.slice(0, 3);
    
    recentBookingsContainer.innerHTML = '';
    
    recentBookings.forEach(booking => {
        const bookingCard = createBookingCard(booking);
        recentBookingsContainer.appendChild(bookingCard);
    });
}

// Display all bookings
function displayAllBookings(bookings) {
    const allBookingsContainer = document.getElementById('allBookingsContainer');
    if (!allBookingsContainer) return;
    
    if (bookings.length === 0) {
        allBookingsContainer.innerHTML = `
            <div class="no-bookings">
                <p>No bookings found.</p>
                <p>When users make bookings with your salon, they will appear here.</p>
            </div>
        `;
        return;
    }

    // Sort bookings by date, newest first
    bookings.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    allBookingsContainer.innerHTML = '';
    
    bookings.forEach(booking => {
        const bookingCard = createBookingCard(booking);
        allBookingsContainer.appendChild(bookingCard);
    });
}

// Create a booking card element
function createBookingCard(booking) {
    const bookingDate = new Date(booking.date);
    const formattedDate = bookingDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const bookingCard = document.createElement('div');
    bookingCard.className = `booking-card ${booking.status || 'pending'}`;
    
    bookingCard.innerHTML = `
        <div class="booking-header">
            <h3 class="booking-title">Booking #${booking._id.substring(0, 8)}</h3>
            <span class="booking-status status-${booking.status || 'pending'}">${booking.status || 'pending'}</span>
        </div>
        <div class="booking-details">
            <p class="booking-detail">
                <strong>Customer</strong>
                ${booking.userName || 'Anonymous User'}
            </p>
            <p class="booking-detail">
                <strong>Service</strong>
                ${booking.service || 'Not specified'}
            </p>
            <p class="booking-detail">
                <strong>Date</strong>
                ${formattedDate}
            </p>
            <p class="booking-detail">
                <strong>Time</strong>
                ${booking.time || 'Not specified'}
            </p>
        </div>
        ${booking.status !== 'cancelled' && booking.status !== 'completed' ? `
            <div class="booking-actions">
                ${booking.status !== 'confirmed' ? `
                    <button class="booking-btn confirm-btn" data-id="${booking._id}">Confirm</button>
                ` : ''}
                <button class="booking-btn cancel-btn" data-id="${booking._id}">Cancel</button>
            </div>
        ` : ''}
    `;
    
    // Add event listeners to the buttons after the card is created
    setTimeout(() => {
        const confirmBtn = bookingCard.querySelector('.confirm-btn');
        const cancelBtn = bookingCard.querySelector('.cancel-btn');
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => confirmBooking(booking._id));
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => cancelBooking(booking._id));
        }
    }, 0);
    
    return bookingCard;
}

// Confirm a booking
function confirmBooking(bookingId) {
    if (!confirm('Are you sure you want to confirm this booking?')) {
        return;
    }
    
    updateBookingStatus(bookingId, 'confirmed');
}

// Cancel a booking
function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }
    
    updateBookingStatus(bookingId, 'cancelled');
}

// Update booking status
function updateBookingStatus(bookingId, status) {
    const token = localStorage.getItem('token');
    if (!token || !bookingId) return;
    
    const API_URL = 'http://localhost:5000/api';
    
    fetch(`${API_URL}/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update booking status');
        }
        return response.json();
    })
    .then(data => {
        console.log('Booking updated:', data);
        alert(`Booking ${status} successfully.`);
        
        // Reload bookings to reflect changes
        loadBookings();
    })
    .catch(error => {
        console.error('Error updating booking:', error);
        alert(`Failed to ${status} the booking. Please try again.`);
    });
}

// Function to add a new service
async function addService(serviceData) {
    debugLog('Adding new service:', serviceData);
    
    const token = localStorage.getItem('token');
    const salonId = localStorage.getItem('salonId');
    
    if (!token || !salonId) {
        showNotification('Authentication required', 'error');
        return false;
    }
    
    try {
        const response = await fetch(`http://localhost:5000/api/salons/${salonId}/services`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(serviceData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        debugLog('Service added successfully:', result);
        
        // Update localStorage with new services
        await fetchServicesFromServer();
        
        showNotification('Service added successfully!', 'success');
        return true;
    } catch (error) {
        console.error('Error adding service:', error);
        showNotification('Failed to add service: ' + error.message, 'error');
        return false;
    }
}

// Function to create service form
function createServiceForm() {
    const form = document.createElement('form');
    form.className = 'service-form';
    form.innerHTML = `
        <h3>Add New Service</h3>
        <div class="form-group">
            <label for="serviceName">Service Name *</label>
            <input type="text" id="serviceName" required>
        </div>
        <div class="form-group">
            <label for="servicePrice">Price (USD) *</label>
            <input type="number" id="servicePrice" step="0.01" min="0" required>
        </div>
        <div class="form-group">
            <label for="serviceDuration">Duration (minutes) *</label>
            <input type="number" id="serviceDuration" min="1" required>
        </div>
        <div class="form-group">
            <label for="serviceDescription">Description</label>
            <textarea id="serviceDescription" rows="3"></textarea>
        </div>
        <div class="form-actions">
            <button type="submit" class="btn-primary">Add Service</button>
            <button type="button" class="btn-secondary" onclick="closeServiceForm()">Cancel</button>
        </div>
    `;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const serviceData = {
            name: form.serviceName.value.trim(),
            price: parseFloat(form.servicePrice.value),
            duration: parseInt(form.serviceDuration.value),
            description: form.serviceDescription.value.trim()
        };
        
        const success = await addService(serviceData);
        if (success) {
            closeServiceForm();
            loadAndDisplayServices();
        }
    });
    
    return form;
}

// Function to show add service form
function showAddServiceForm() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'serviceFormModal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const form = createServiceForm();
    modalContent.appendChild(form);
    modal.appendChild(modalContent);
    
    document.body.appendChild(modal);
}

// Function to close service form
function closeServiceForm() {
    const modal = document.getElementById('serviceFormModal');
    if (modal) {
        modal.remove();
    }
}

// Update the loadAndDisplayServices function to include an Add Service button
function loadAndDisplayServices() {
    debugLog('Loading services...');
    
    const servicesContainer = document.getElementById('servicesContainer');
    if (!servicesContainer) {
        console.error('Services container not found!');
        return;
    }
    
    // Add the "Add Service" button at the top
    const headerSection = document.createElement('div');
    headerSection.className = 'services-header';
    headerSection.innerHTML = `
        <button class="btn-primary add-service-btn" onclick="showAddServiceForm()">
            <i class="fas fa-plus"></i> Add New Service
        </button>
    `;
    
    servicesContainer.innerHTML = '';
    servicesContainer.appendChild(headerSection);
    
    // Show loading state
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.textContent = 'Loading services...';
    servicesContainer.appendChild(loadingDiv);
    
    // Rest of your existing loadAndDisplayServices code...
}


// Add the additional styles to the document
const additionalStyleSheet = document.createElement('style');
additionalStyleSheet.textContent = additionalStyles;
document.head.appendChild(additionalStyleSheet);
