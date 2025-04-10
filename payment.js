document.addEventListener('DOMContentLoaded', function() {
    // Check if user came from booking page
    const appointmentData = JSON.parse(localStorage.getItem('appointmentData'));
    if (!appointmentData) {
        // Redirect back to booking if no appointment data
        window.location.href = 'booking.html';
        return;
    }

    // Prevent going back to booking page
    history.pushState(null, null, document.URL);
    window.addEventListener('popstate', function () {
        history.pushState(null, null, document.URL);
    });

    // Display appointment details
    if (appointmentData) {
        displayAppointmentDetails(appointmentData);
    }

    // Handle payment method selection
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            togglePaymentForm(this.value);
        });
    });

    // Handle payment submission
    const payNowBtn = document.getElementById('payNowBtn');
    payNowBtn.addEventListener('click', handlePayment);
});

function displayAppointmentDetails(data) {
    const detailsContainer = document.getElementById('appointmentDetails');
    const totalAmount = document.getElementById('totalAmount');
    
    detailsContainer.innerHTML = `
        <p>
            <span>Service:</span>
            <span>${data.service || 'Haircut'}</span>
        </p>
        <p>
            <span>Date:</span>
            <span>${new Date(data.date).toLocaleDateString()}</span>
        </p>
        <p>
            <span>Time:</span>
            <span>${data.time}</span>
        </p>
        <p>
            <span>Salon:</span>
            <span>${data.salonName}</span>
        </p>
    `;

    // Set fixed amount of 200 rupees
    totalAmount.textContent = '₹200.00';
}

function togglePaymentForm(method) {
    const upiForm = document.getElementById('upiForm');
    const cardForm = document.getElementById('cardForm');
    
    if (method === 'upi') {
        upiForm.style.display = 'block';
        cardForm.style.display = 'none';
    } else {
        upiForm.style.display = 'none';
        cardForm.style.display = 'block';
    }
}

async function handlePayment() {
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
    
    if (!selectedMethod) {
        alert('Please select a payment method');
        return;
    }

    try {
        // Show loading state
        const payBtn = document.getElementById('payNowBtn');
        payBtn.textContent = 'Processing...';
        payBtn.disabled = true;

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Store payment status
        localStorage.setItem('paymentStatus', 'completed');

        // After successful payment
        localStorage.removeItem('appointmentData'); // Clear the appointment data

        // Show success message and redirect
        alert('Payment successful! Redirecting to appointments page...');
        window.location.href = 'my-appointments.html';

    } catch (error) {
        console.error('Payment failed:', error);
        alert('Payment failed. Please try again.');
    } finally {
        const payBtn = document.getElementById('payNowBtn');
        payBtn.textContent = 'Pay Now';
        payBtn.disabled = false;
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}
