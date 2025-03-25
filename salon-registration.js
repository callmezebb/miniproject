document.addEventListener('DOMContentLoaded', function() {
    if (!checkSalonAuth()) return;
    initializeForm();
});

function checkSalonAuth() {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (!token || userType !== 'salon') {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function initializeForm() {
    const form = document.getElementById('salon-registration-form');
    
    // Set default working hours
    document.getElementById('openTime').value = '09:00';
    document.getElementById('closeTime').value = '20:00';
    addService();
    form.addEventListener('submit', handleSubmit);
}

async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = {
        name: document.getElementById('salonName').value,
        location: document.getElementById('location').value,
        phone: document.getElementById('phone').value,
        email: localStorage.getItem('userEmail'),
        workingHours: {
            days: getSelectedDays(),
            openTime: document.getElementById('openTime').value,
            closeTime: document.getElementById('closeTime').value
        },
        services: getServices()
    };

    try {
        const response = await fetch('http://localhost:5000/api/salons/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            showNotification('Registration successful!', 'success');
            localStorage.setItem('salonDetails', JSON.stringify(data.data));
            setTimeout(() => {
                window.location.href = 'salon-dashboard.html';
            }, 1500);
        } else {
            throw new Error(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification(error.message, 'error');
    }
}

function validateForm() {
    const requiredFields = {
        'salonName': 'Salon name is required',
        'location': 'Location is required',
        'phone': 'Phone number is required'
    };

    for (const [fieldId, message] of Object.entries(requiredFields)) {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            showNotification(message, 'error');
            field.focus();
            return false;
        }
    }

    const phone = document.getElementById('phone').value;
    if (!/^\d{10}$/.test(phone)) {
        showNotification('Please enter a valid 10-digit phone number', 'error');
        return false;
    }

    const services = getServices();
    if (services.length === 0) {
        showNotification('Please add at least one service', 'error');
        return false;
    }

    return true;
}

function addService() {
    const container = document.getElementById('services-container');
    const serviceRow = document.createElement('div');
    serviceRow.className = 'service-row';
    serviceRow.innerHTML = `
        <input type="text" class="service-name" placeholder="Service name" required>
        <input type="number" class="service-price" placeholder="Price" required min="0">
        <input type="number" class="service-duration" placeholder="Duration (min)" required min="15" step="15">
        <button type="button" class="remove-service" onclick="removeService(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(serviceRow);
}

function removeService(button) {
    const container = document.getElementById('services-container');
    if (container.children.length > 1) {
        button.closest('.service-row').remove();
    } else {
        showNotification('At least one service is required', 'error');
    }
}

function getServices() {
    const services = [];
    document.querySelectorAll('.service-row').forEach(row => {
        const name = row.querySelector('.service-name').value.trim();
        const price = row.querySelector('.service-price').value;
        const duration = row.querySelector('.service-duration').value;
        
        if (name && price && duration) {
            services.push({
                name,
                price: parseFloat(price),
                duration: parseInt(duration)
            });
        }
    });
    return services;
}

function getSelectedDays() {
    return Array.from(document.querySelectorAll('input[name="days"]:checked'))
        .map(checkbox => checkbox.value);
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}