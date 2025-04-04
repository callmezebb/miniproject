class AppointmentsManager {
    constructor() {
        this.init();
    }

    async init() {
        try {
            console.log('Initializing appointments manager...');
            const { token, userData } = await this.checkAuthentication();
            await this.loadAppointments(token, userData.id);
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Failed to initialize: ' + error.message);
        }
    }

    async checkAuthentication() {
        const token = localStorage.getItem('userToken');
        const userDataStr = localStorage.getItem('userData');
        
        if (!token || !userDataStr) {
            window.location.href = 'user-login.html';
            throw new Error('Authentication required');
        }

        try {
            const userData = JSON.parse(userDataStr);
            console.log('User data loaded:', userData);
            return { token, userData };
        } catch (error) {
            console.error('Error parsing user data:', error);
            throw new Error('Invalid user data');
        }
    }

    async loadAppointments(token, userId) {
        try {
            this.showLoading(true);
            console.log('Loading appointments for user:', userId);

            const response = await fetch(`http://localhost:5000/api/bookings/user/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load appointments');
            }

            const appointments = await response.json();
            console.log('Appointments loaded:', appointments);
            this.displayAppointments(appointments);

        } catch (error) {
            console.error('Error loading appointments:', error);
            this.showError('Failed to load appointments: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    displayAppointments(appointments) {
        const container = document.getElementById('appointmentsContainer');
        if (!container) return;

        if (!appointments || appointments.length === 0) {
            container.innerHTML = `
                <div class="no-appointments">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No Appointments Found</h3>
                    <p>You haven't made any bookings yet.</p>
                    <a href="booking.html" class="primary-button">Book Now</a>
                </div>
            `;
            return;
        }

        // Sort appointments by date and time
        appointments.sort((a, b) => {
            const dateA = new Date(a.date + ' ' + a.time);
            const dateB = new Date(b.date + ' ' + b.time);
            return dateA - dateB;
        });

        // Group appointments by status
        const upcomingAppointments = appointments.filter(a => 
            ['pending', 'confirmed'].includes(a.status));
        const pastAppointments = appointments.filter(a => 
            ['completed', 'cancelled'].includes(a.status));

        container.innerHTML = `
            ${this.renderAppointmentSection('Upcoming Appointments', upcomingAppointments)}
            ${this.renderAppointmentSection('Past Appointments', pastAppointments)}
        `;
    }

    renderAppointmentSection(title, appointments) {
        if (!appointments.length) return '';
        
        return `
            <div class="appointments-section">
                <h2>${title}</h2>
                <div class="appointments-grid">
                    ${appointments.map(appointment => this.createAppointmentCard(appointment)).join('')}
                </div>
            </div>
        `;
    }

    createAppointmentCard(appointment) {
        const statusClasses = {
            'pending': 'status-pending',
            'confirmed': 'status-confirmed',
            'completed': 'status-completed',
            'cancelled': 'status-cancelled'
        };

        const formattedDate = new Date(appointment.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
            <div class="appointment-card ${statusClasses[appointment.status]}">
                <div class="appointment-header">
                    <h3>${this.escapeHtml(appointment.salonId.name)}</h3>
                    <span class="appointment-status">
                        ${this.escapeHtml(appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1))}
                    </span>
                </div>
                <div class="appointment-details">
                    <div class="detail-item">
                        <i class="fas fa-calendar"></i>
                        <span>${formattedDate}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <span>${this.escapeHtml(appointment.time)}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${this.escapeHtml(appointment.salonId.location)}</span>
                    </div>
                    ${appointment.hairstyleRequest ? `
                        <div class="detail-item">
                            <i class="fas fa-cut"></i>
                            <span>${this.escapeHtml(appointment.hairstyleRequest)}</span>
                        </div>
                    ` : ''}
                </div>
                ${appointment.status === 'pending' ? `
                    <div class="appointment-actions">
                        <button onclick="appointmentsManager.cancelAppointment('${appointment._id}')" class="cancel-button">
                            Cancel Appointment
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    async cancelAppointment(appointmentId) {
        if (!confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }

        try {
            const { token } = await this.checkAuthentication();
            const response = await fetch(`http://localhost:5000/api/bookings/${appointmentId}/status`, {
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

            await this.loadAppointments();
            this.showSuccess('Appointment cancelled successfully');
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            this.showError('Failed to cancel appointment: ' + error.message);
        }
    }

    showLoading(show) {
        const loadingElement = document.querySelector('.loading-spinner');
        if (loadingElement) {
            loadingElement.style.display = show ? 'flex' : 'none';
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${this.escapeHtml(message)}`;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${this.escapeHtml(message)}`;
        document.body.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 5000);
    }

    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize appointments manager
document.addEventListener('DOMContentLoaded', () => {
    const appointmentsManager = new AppointmentsManager();
});

// Logout function
function logout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    window.location.href = 'user-login.html';
} 