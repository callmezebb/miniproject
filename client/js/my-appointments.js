// ...existing code...
class AppointmentsManager {
    // ...existing code...
    
    async cancelAppointment(appointmentId) {
        try {
            const response = await fetch(`http://localhost:5000/api/bookings/${appointmentId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Appointment not found. It may have been already cancelled or removed.');
                }
                throw new Error(`Server error: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            throw new Error(error.message || 'Failed to cancel appointment');
        }
    }
    // ...existing code...
}
