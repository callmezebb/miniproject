document.addEventListener('DOMContentLoaded', async function () {
    // Clear selectedService when landing on dashboard
    localStorage.removeItem('selectedService');
    // Check authentication
    

    // Get user details
    const user = getUser();
    const welcomeMessage = document.querySelector('.hero-content h1');
    if (welcomeMessage) {
        welcomeMessage.textContent = `Welcome, ${user.name || 'User'}!`;
    }

    // Fetch and display hairstyles
    try {
        const response = await fetch('http://localhost:5000/api/hairstyles');
        const data = await response.json();

        if (response.ok) {
            const hairstylesGrid = document.querySelector('.hairstyles-grid');
            if (hairstylesGrid) {
                data.data.forEach(hairstyle => {
                    const card = document.createElement('div');
                    card.className = 'hairstyle-card';
                    card.innerHTML = `
                        <img src="${hairstyle.image}" alt="${hairstyle.name}" class="hairstyle-image">
                        <div class="hairstyle-info">
                            <h3 class="hairstyle-name">${hairstyle.name}</h3>
                            <p class="hairstyle-description">${hairstyle.description}</p>
                        </div>
                    `;
                    hairstylesGrid.appendChild(card);
                });
            }
        } else {
            console.error('Failed to fetch hairstyles:', data.message);
        }
    } catch (error) {
        console.error('Error fetching hairstyles:', error);
    }
});

function updateUserInfo(userName) {
    const welcomeHeader = document.querySelector('.welcome-section h1');
    if (welcomeHeader) {
        welcomeHeader.textContent = `Welcome, ${userName}!`;
    }

    const userNameDisplay = document.querySelector('.user-info .name');
    if (userNameDisplay) {
        userNameDisplay.textContent = userName;
    }
}

async function loadAppointments() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/appointments/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch appointments');
        }

        const appointments = await response.json();
        displayAppointments(appointments.data);
    } catch (error) {
        console.error('Error loading appointments:', error);
        showNotification('Error loading appointments', 'error');
    }
}

function displayAppointments(appointments) {
    const appointmentsList = document.getElementById('appointmentsList');
    if (!appointmentsList) return;

    appointmentsList.innerHTML = '';

    if (appointments.length === 0) {
        appointmentsList.innerHTML = `
            <div class="no-appointments">
                <p>No appointments scheduled</p>
                <a href="booking.html" class="book-now-btn">Book Now</a>
            </div>
        `;
        return;
    }

    appointments.forEach(appointment => {
        const appointmentCard = createAppointmentCard(appointment);
        appointmentsList.appendChild(appointmentCard);
    });
}

function createAppointmentCard(appointment) {
    const card = document.createElement('div');
    card.className = 'appointment-card';
    
    const date = new Date(appointment.date);
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    card.innerHTML = `
        <div class="appointment-info">
            <h3>${appointment.salonName}</h3>
            <p class="date">${formattedDate}</p>
            <p class="time">${appointment.time}</p>
            <p class="service">${appointment.serviceName}</p>
            <span class="status ${appointment.status.toLowerCase()}">${appointment.status}</span>
        </div>
        <div class="appointment-actions">
            ${appointment.status === 'pending' ? `
                <button onclick="cancelAppointment('${appointment._id}')" class="cancel-btn">
                    Cancel
                </button>
            ` : ''}
        </div>
    `;

    return card;
}

async function cancelAppointment(appointmentId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'cancelled' })
        });

        if (!response.ok) {
            throw new Error('Failed to cancel appointment');
        }

        // Reload appointments after cancellation
        await loadAppointments();
        showNotification('Appointment cancelled successfully', 'success');
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        showNotification('Error cancelling appointment', 'error');
    }
}

function initializeDashboard() {
    // Add click handlers for quick action buttons
    document.querySelectorAll('.quick-action-btn').forEach(button => {
        button.addEventListener('click', () => {
            const action = button.getAttribute('data-action');
            switch (action) {
                case 'book':
                    window.location.href = 'booking.html';
                    break;
                case 'styles':
                    window.location.href = 'hairstyles.html';
                    break;
                case 'face-analysis':
                    window.location.href = 'face-analysis.html';
                    break;
            }
        });
    });

    // Add face analysis button to the sidebar
    const sidebarMenu = document.querySelector('.sidebar-menu');
    const faceAnalysisLink = document.createElement('a');
    faceAnalysisLink.href = '#';
    faceAnalysisLink.setAttribute('data-tab', 'face-analysis');
    faceAnalysisLink.innerHTML = `
        <i class="fas fa-portrait"></i>
        <span>Face Analysis</span>
    `;
    sidebarMenu.appendChild(faceAnalysisLink);
    
    // Add face analysis tab content
    const mainContent = document.querySelector('.main-content');
    const faceAnalysisTab = document.createElement('div');
    faceAnalysisTab.id = 'face-analysis-tab';
    faceAnalysisTab.className = 'tab-content';
    mainContent.appendChild(faceAnalysisTab);
    
    // Add click handler for face analysis
    faceAnalysisLink.addEventListener('click', function(e) {
        e.preventDefault();
        loadFaceAnalysis();
    });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

// Function to load face analysis content
async function loadFaceAnalysis() {
    const faceAnalysisTab = document.getElementById('face-analysis-tab');
    
    // Show loading state
    faceAnalysisTab.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading Face Analysis...</p>
        </div>
    `;
    
    try {
        // Load face analysis content
        const response = await fetch('face-analysis.html');
        if (!response.ok) throw new Error('Failed to load face analysis content');
        
        const content = await response.text();
        faceAnalysisTab.innerHTML = content;
        
        // Initialize face analysis functionality
        const script = document.createElement('script');
        script.src = './face-analysis.js';
        document.body.appendChild(script);
        
        // Show the face analysis tab
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        faceAnalysisTab.classList.add('active');
        
        // Update active state in sidebar
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector('[data-tab="face-analysis"]').classList.add('active');
        
    } catch (error) {
        console.error('Error loading face analysis:', error);
        faceAnalysisTab.innerHTML = `
            <div class="error-message">
                <h3>Error Loading Face Analysis</h3>
                <p>Failed to load the face analysis feature. Please try again later.</p>
                <button onclick="loadFaceAnalysis()" class="retry-button">Retry</button>
            </div>
        `;
    }
}

function updateNavigation() {
    const nav = document.querySelector('.nav-links');
    if (nav) {
        // Add My Appointments link if it doesn't exist
        if (!nav.querySelector('a[href="my-appointments.html"]')) {
            const appointmentsLink = document.createElement('li');
            appointmentsLink.innerHTML = '<a href="my-appointments.html">My Appointments</a>';
            nav.insertBefore(appointmentsLink, nav.querySelector('li:last-child'));
        }
    }
}

// Call this function when the dashboard initializes
document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
    // ... your existing initialization code
});