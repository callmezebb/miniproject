class AppointmentsManager {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
        this.init();
    }

    init() {
        // Ensure DOM is loaded before initializing
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.loadAppointments());
        } else {
            this.loadAppointments();
        }
    }

    async loadAppointments() {
        try {
            const response = await fetch(`${this.baseUrl}/appointments`);
            if (!response.ok) throw new Error('Failed to load appointments');
            const appointments = await response.json();
            console.log('Appointments loaded:', appointments);
        } catch (error) {
            console.error('Error loading appointments:', error);
        }
    }

    async cancelAppointment(appointmentId) {
        if (!appointmentId) return;
        
        try {
            if (!confirm('Are you sure you want to cancel this appointment?')) {
                return;
            }

            const response = await fetch(`${this.baseUrl}/appointments/${appointmentId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to cancel appointment');
            }

            // Remove appointment from DOM
            const appointmentElement = document.querySelector(`[data-appointment-id="${appointmentId}"]`);
            if (appointmentElement) {
                const card = appointmentElement.closest('.appointment-card');
                if (card) card.remove();
            }

            alert('Appointment cancelled successfully');
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            alert('Failed to cancel appointment: ' + error.message);
        }
    }
}

// Initialize the appointments manager globally
window.appointmentsManager = new AppointmentsManager();
