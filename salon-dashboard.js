document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!checkAuth()) return;

    // Initialize form
    initializeForm();
});

function initializeForm() {
    const form = document.getElementById('salon-registration-form');
    const imageInput = document.getElementById('salonImages');

    // Set default working hours
    document.getElementById('openTime').value = '09:00';
    document.getElementById('closeTime').value = '20:00';

    // Add default service row
    addService();

    // Form submission handler
    form.addEventListener('submit', handleSubmit);

    // Image upload handler
    imageInput.addEventListener('change', handleImageUpload);
}

async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    const formData = new FormData();
    
    // Basic info
    formData.append('name', document.getElementById('salonName').value);
    formData.append('location', document.getElementById('location').value);
    formData.append('phone', document.getElementById('phone').value);

    // Working hours
    const workingHours = {
        days: getSelectedDays(),
        openTime: document.getElementById('openTime').value,
        closeTime: document.getElementById('closeTime').value
    };
    formData.append('workingHours', JSON.stringify(workingHours));

    // Services
    const services = getServices();
    formData.append('services', JSON.stringify(services));

    // Images
    const imageFiles = document.getElementById('salonImages').files;
    for (let i = 0; i < imageFiles.length; i++) {
        formData.append('images', imageFiles[i]);
    }

    try {
        const response = await fetch('http://localhost:5000/api/salons/register', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
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

    // Check required fields
    for (const [fieldId, message] of Object.entries(requiredFields)) {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            showNotification(message, 'error');
            field.focus();
            return false;
        }
    }

    // Validate phone number
    const phone = document.getElementById('phone').value;
    if (!/^\d{10}$/.test(phone)) {
        showNotification('Please enter a valid 10-digit phone number', 'error');
        return false;
    }

    // Validate working hours
    const openTime = document.getElementById('openTime').value;
    const closeTime = document.getElementById('closeTime').value;
    if (!openTime || !closeTime || openTime >= closeTime) {
        showNotification('Please enter valid working hours', 'error');
        return false;
    }

    // Validate services
    const services = getServices();
    if (services.length === 0) {
        showNotification('Please add at least one service', 'error');
        return false;
    }

    return true;
}

function handleImageUpload(input) {
    const maxImages = 5;
    const maxSize = 5 * 1024 * 1024; // 5MB
    const preview = document.getElementById('image-preview');
    preview.innerHTML = '';

    if (input.files.length > maxImages) {
        showNotification(`Maximum ${maxImages} images allowed`, 'error');
        input.value = '';
        return;
    }

    for (const file of input.files) {
        if (file.size > maxSize) {
            showNotification('Image size should not exceed 5MB', 'error');
            continue;
        }

        if (!file.type.startsWith('image/')) {
            showNotification('Please upload only image files', 'error');
            continue;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    }
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
    const serviceRows = document.querySelectorAll('.service-row');
    
    serviceRows.forEach(row => {
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
    const days = [];
    document.querySelectorAll('input[name="days"]:checked').forEach(checkbox => {
        days.push(checkbox.value);
    });
    return days;
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}