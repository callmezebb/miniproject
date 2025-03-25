document.addEventListener('DOMContentLoaded', async function () {
    // Check authentication
    if (!await checkAuth()) return;

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
    window.location.href = 'login.html';
}