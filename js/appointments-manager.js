class AppointmentsManager {
    constructor() {
        this.init();
    }

    init() {
        // Initialize any required setup
    }

    async cancelAppointment(appointmentId) {
        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch(`/api/appointments/${appointmentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Remove the appointment card from DOM
                const appointmentCard = document.querySelector(`[data-appointment-id="${appointmentId}"]`);
                if (appointmentCard) {
                    appointmentCard.remove();
                }
            } else {
                throw new Error('Failed to cancel appointment');
            }
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            alert('Failed to cancel appointment. Please try again.');
        }
    }
}

// Initialize the appointments manager globally
window.appointmentsManager = new AppointmentsManager();
