document.addEventListener('DOMContentLoaded', function() {
    console.log('Salon Registration Page Loaded');
    
    // Get the salon registration form
    const salonRegForm = document.getElementById('salonRegistrationForm');
    const servicesContainer = document.getElementById('servicesContainer');
    const addServiceBtn = document.getElementById('addServiceBtn');
    
    // Get authentication data
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    const salonId = localStorage.getItem('salonId');
    
    console.log('Auth Check:', {
        hasToken: !!token,
        userType: userType,
        salonId: salonId
    });
    
    // Redirect to login if not authenticated
    if (!token || userType !== 'salon' || !salonId) {
        console.log('Not authenticated as salon, redirecting to login');
        window.location.href = 'salon-login.html';
        return;
    }

    // Handle adding new service entry
    if (addServiceBtn) {
        addServiceBtn.addEventListener('click', function() {
            const serviceEntry = document.createElement('div');
            serviceEntry.className = 'service-entry';
            serviceEntry.innerHTML = `
                <button type="button" class="remove-service">✕</button>
                <div class="form-group">
                    <label>Service Name*</label>
                    <input type="text" name="serviceName[]" required placeholder="e.g., Haircut">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <input type="text" name="serviceDescription[]" placeholder="Brief description">
                </div>
                <div class="form-row">
                    <div class="form-group half">
                        <label>Price ($)*</label>
                        <input type="number" name="servicePrice[]" required min="0" step="0.01" placeholder="0.00">
                    </div>
                    <div class="form-group half">
                        <label>Duration (minutes)*</label>
                        <input type="number" name="serviceDuration[]" required min="5" step="5" placeholder="30">
                    </div>
                </div>
            `;
            servicesContainer.appendChild(serviceEntry);
            
            // Add event listener to the new remove button
            serviceEntry.querySelector('.remove-service').addEventListener('click', function() {
                servicesContainer.removeChild(serviceEntry);
            });
        });
    }
    
    // Add event listeners to existing remove service buttons
    document.querySelectorAll('.remove-service').forEach(button => {
        button.addEventListener('click', function() {
            const serviceEntry = this.parentElement;
            servicesContainer.removeChild(serviceEntry);
        });
    });
    
    // Handle form submission
    if (salonRegForm) {
        salonRegForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted');
            
            // Show loading indicator
            const submitBtn = salonRegForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;
            
            // Get basic form data
            const formData = new FormData(salonRegForm);
            const salonData = {};
            
            // Extract basic fields
            salonData.phone = formData.get('phone');
            salonData.location = formData.get('location');
            salonData.description = formData.get('description');
            
            // Extract business hours
            salonData.businessHours = {
                monday: {
                    open: document.getElementById('mondayOpen').value,
                    close: document.getElementById('mondayClose').value
                },
                tuesday: {
                    open: document.getElementById('tuesdayOpen').value,
                    close: document.getElementById('tuesdayClose').value
                },
                wednesday: {
                    open: document.getElementById('wednesdayOpen').value,
                    close: document.getElementById('wednesdayClose').value
                },
                thursday: {
                    open: document.getElementById('thursdayOpen').value,
                    close: document.getElementById('thursdayClose').value
                },
                friday: {
                    open: document.getElementById('fridayOpen').value,
                    close: document.getElementById('fridayClose').value
                },
                saturday: {
                    open: document.getElementById('saturdayOpen').value,
                    close: document.getElementById('saturdayClose').value
                },
                sunday: {
                    open: document.getElementById('sundayOpen').value,
                    close: document.getElementById('sundayClose').value
                }
            };
            
            // Extract services
            const serviceNames = formData.getAll('serviceName[]');
            const serviceDescriptions = formData.getAll('serviceDescription[]');
            const servicePrices = formData.getAll('servicePrice[]');
            const serviceDurations = formData.getAll('serviceDuration[]');
            
            salonData.services = [];
            
            for (let i = 0; i < serviceNames.length; i++) {
                if (serviceNames[i]) { // Only add if service name is not empty
                    salonData.services.push({
                        name: serviceNames[i],
                        description: serviceDescriptions[i] || '',
                        price: parseFloat(servicePrices[i]) || 0,
                        duration: parseInt(serviceDurations[i]) || 30
                    });
                }
            }
            
            // Set profile as complete
            salonData.isProfileComplete = true;
            
            console.log('Salon data to submit:', salonData);
            
            // API URL
            const API_URL = 'http://localhost:5000/api';
            
            // Use XMLHttpRequest for better compatibility
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${API_URL}/salons/complete-registration`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    console.log('Server response status:', xhr.status);
                    
                    if (xhr.status >= 200 && xhr.status < 300) {
                        console.log('Registration successful!');
                        
                        try {
                            // Parse response data
                            const data = JSON.parse(xhr.responseText);
                            console.log('Response data:', data);
                            
                            // Store salon data in localStorage for dashboard
                            if (data.data) {
                                localStorage.setItem('salonName', data.data.name || 'Your Salon');
                                localStorage.setItem('salonPhone', data.data.phone || '');
                                localStorage.setItem('salonLocation', data.data.location || '');
                                localStorage.setItem('salonDescription', data.data.description || '');
                                
                                // Store hours and services as JSON strings
                                localStorage.setItem('salonBusinessHours', JSON.stringify(data.data.businessHours || {}));
                                localStorage.setItem('salonServices', JSON.stringify(data.data.services || []));
                            }
                            
                            alert('Salon profile completed successfully!');
                            
                            // Redirect to dashboard with a small delay to ensure alert is seen
                            setTimeout(function() {
                                window.location.href = 'salon-dashboard.html';
                            }, 500);
                            
                        } catch (e) {
                            console.error('Error parsing response:', e);
                            alert('Registration completed, but there was an error loading your data.');
                            window.location.href = 'salon-dashboard.html';
                        }
                    } else {
                        console.error('Registration failed:', xhr.responseText);
                        let errorMessage = 'Failed to complete registration';
                        
                        try {
                            const errorData = JSON.parse(xhr.responseText);
                            errorMessage = errorData.message || errorMessage;
                        } catch (e) {
                            console.error('Error parsing error response:', e);
                        }
                        
                        alert(errorMessage + '. Please try again.');
                        submitBtn.textContent = originalBtnText;
                        submitBtn.disabled = false;
                    }
                }
            };
            
            xhr.onerror = function() {
                console.error('Network error during registration');
                alert('Network error. Please check your connection and try again.');
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            };
            
            // Send the data
            xhr.send(JSON.stringify(salonData));
        });
    } else {
        console.error('Salon registration form not found!');
    }
}); 