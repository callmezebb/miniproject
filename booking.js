let currentStep = 1;
let selectedSalon = null;
let selectedService = null;
let selectedDate = null;
let selectedTime = null;

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    initializeBooking();
    setupDatePicker();
});

function checkAuth() {
    const userType = localStorage.getItem('userType');
    const userEmail = localStorage.getItem('userEmail');
    
    if (!userType || userType !== 'user' || !userEmail) {
        window.location.href = 'index.html';
    }
}

function initializeBooking() {
    // Check if a style was selected from hairstyles page
    const selectedStyle = localStorage.getItem('selectedStyle');
    if (selectedStyle) {
        // We'll use this later when we get to the customer notes step
        localStorage.setItem('pendingStyle', selectedStyle);
        // Clear the selection from localStorage to avoid reusing it accidentally
        localStorage.removeItem('selectedStyle');
    }
    
    loadSalons();
    updateNavigationButtons();
}

function loadSalons() {
    const salonsGrid = document.getElementById('salonsGrid');
    const salons = getAllSalons();

    salonsGrid.innerHTML = salons.map(salon => `
        <div class="salon-card" onclick="selectSalon('${salon.email}')">
            <div class="salon-name">${salon.name}</div>
            <div class="salon-info">
                <p><i class="fas fa-location-dot"></i> ${salon.address}</p>
                <p><i class="fas fa-clock"></i> ${getOperatingHoursDisplay(salon)}</p>
            </div>
        </div>
    `).join('');
}

function getAllSalons() {
    // In a real application, this would fetch from a backend
    // For demo, we'll get from localStorage
    const salons = [];
    
    // Check for salonDetails
    const salonDetails = localStorage.getItem('salonDetails');
    if (salonDetails) {
        salons.push(JSON.parse(salonDetails));
    }
    
    // Also check for demo salon data
    if (localStorage.getItem('citySalonDetails')) {
        salons.push(JSON.parse(localStorage.getItem('citySalonDetails')));
    }
    
    if (localStorage.getItem('modernSalonDetails')) {
        salons.push(JSON.parse(localStorage.getItem('modernSalonDetails')));
    }
    
    return salons;
}

function selectSalon(salonEmail) {
    // Find the selected salon by email
    const salons = getAllSalons();
    selectedSalon = salons.find(salon => salon.email === salonEmail);
    
    if (!selectedSalon) {
        alert('Error: Salon not found');
        return;
    }
    
    document.querySelectorAll('.salon-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    
    // Update selected salon info in step 2
    const selectedSalonInfo = document.getElementById('selectedSalonInfo');
    selectedSalonInfo.innerHTML = `
        <div class="selected-salon-header">
            <h3>${selectedSalon.name}</h3>
            <p><i class="fas fa-location-dot"></i> ${selectedSalon.address}</p>
        </div>
    `;
    
    loadServices(selectedSalon);
}

function loadServices(salon) {
    const servicesGrid = document.getElementById('servicesGrid');
    const services = Object.entries(salon.services)
        .filter(([_, service]) => service.available);

    servicesGrid.innerHTML = services.map(([name, service]) => `
        <div class="service-card" onclick="selectService('${name}')">
            <div class="service-name">${formatServiceName(name)}</div>
            <div class="service-info">
                <p>Price: $${service.price}</p>
                <p>Duration: ${service.duration} minutes</p>
            </div>
        </div>
    `).join('');
}

function selectService(serviceName) {
    selectedService = {...selectedSalon.services[serviceName], name: serviceName};
    
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    
    // Reset date and time selection
    selectedDate = null;
    selectedTime = null;
    document.getElementById('appointmentDate').value = '';
    document.getElementById('timeSlots').innerHTML = '<p>Please select a date first</p>';
}

function setupDatePicker() {
    const datePicker = document.getElementById('appointmentDate');
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30); // Allow booking up to 30 days in advance
    
    datePicker.min = today.toISOString().split('T')[0];
    datePicker.max = maxDate.toISOString().split('T')[0];
    
    datePicker.addEventListener('change', function() {
        selectedDate = this.value;
        loadTimeSlots();
    });
}

function loadTimeSlots() {
    const timeSlotsGrid = document.getElementById('timeSlots');
    
    if (!selectedDate || !selectedSalon || !selectedService) {
        timeSlotsGrid.innerHTML = '<p>Please select a date to view available time slots</p>';
        return;
    }

    // Get the day of week (0 = Sunday, 1 = Monday, etc.)
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[new Date(selectedDate).getDay()];

    // Check if salon is open on selected day
    const dayHours = selectedSalon.operatingHours[dayOfWeek];
    if (dayHours.isClosed) {
        timeSlotsGrid.innerHTML = '<p class="closed-message">Salon is closed on this day. Please select another date.</p>';
        return;
    }

    // Generate time slots
    const openTime = dayHours.open || "09:00";
    const closeTime = dayHours.close || "20:00";
    
    const slots = generateAvailableTimeSlots(selectedDate, openTime, closeTime);
    
    if (slots.length === 0) {
        timeSlotsGrid.innerHTML = '<p class="no-slots-message">No available time slots for this date.</p>';
        return;
    }

    timeSlotsGrid.innerHTML = slots.map(slot => `
        <div class="time-slot ${slot.available ? '' : 'unavailable'} ${selectedTime === slot.time ? 'selected' : ''}"
             ${slot.available ? `onclick="selectTime('${slot.time}')"` : ''}>
            ${slot.time}
        </div>
    `).join('');
}

function generateAvailableTimeSlots(date, openTime, closeTime) {
    const slots = [];
    const serviceDuration = parseInt(selectedService.duration);
    
    // Create Date objects for start and end times
    const startTime = new Date(`${date}T${openTime}`);
    const endTime = new Date(`${date}T${closeTime}`);
    endTime.setMinutes(endTime.getMinutes() - serviceDuration); // Adjust end time for service duration

    const currentTime = new Date();
    let currentSlot = new Date(startTime);

    // Generate slots at 30-minute intervals
    while (currentSlot <= endTime) {
        // Skip past times if booking for today
        if (date === currentTime.toISOString().split('T')[0] && 
            currentSlot <= currentTime) {
            currentSlot.setMinutes(currentSlot.getMinutes() + 30);
            continue;
        }

        const slotTime = currentSlot.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
        });

        const isAvailable = checkSlotAvailability(date, slotTime, serviceDuration);

        slots.push({
            time: slotTime,
            available: isAvailable
        });

        currentSlot.setMinutes(currentSlot.getMinutes() + 30);
    }

    return slots;
}

function checkSlotAvailability(date, time, duration) {
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const salonAppointments = appointments.filter(apt => 
        apt.salonEmail === selectedSalon.email && 
        apt.date === date &&
        apt.status !== 'cancelled'
    );

    // Convert time to minutes for easier comparison
    const [timeStr, period] = time.split(' ');
    let [hours, minutes] = timeStr.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    const slotStart = hours * 60 + minutes;
    const slotEnd = slotStart + duration;

    // Check for overlapping appointments
    for (const apt of salonAppointments) {
        const [aptTime, aptPeriod] = apt.time.split(' ');
        let [aptHours, aptMinutes] = aptTime.split(':').map(Number);
        if (aptPeriod === 'PM' && aptHours !== 12) aptHours += 12;
        if (aptPeriod === 'AM' && aptHours === 12) aptHours = 0;

        const aptStart = aptHours * 60 + aptMinutes;
        const aptEnd = aptStart + parseInt(apt.duration);

        // Check if slots overlap
        if ((slotStart >= aptStart && slotStart < aptEnd) ||
            (slotEnd > aptStart && slotEnd <= aptEnd) ||
            (slotStart <= aptStart && slotEnd >= aptEnd)) {
            return false;
        }
    }

    return true;
}

function selectTime(time) {
    selectedTime = time;
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    updateBookingSummary();
}

function updateBookingSummary() {
    const summary = document.getElementById('bookingSummary');
    if (!summary) return;

    summary.innerHTML = `
        <p><strong>Salon:</strong> ${selectedSalon.name}</p>
        <p><strong>Service:</strong> ${formatServiceName(selectedService.name)}</p>
        <p><strong>Price:</strong> $${selectedService.price}</p>
        <p><strong>Date:</strong> ${formatDate(selectedDate)}</p>
        <p><strong>Time:</strong> ${selectedTime}</p>
        <p><strong>Duration:</strong> ${selectedService.duration} minutes</p>
    `;
}

function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < 4) {
            document.getElementById(`step${currentStep}`).classList.add('hidden');
            currentStep++;
            document.getElementById(`step${currentStep}`).classList.remove('hidden');
            updateNavigationButtons();
            
            // If moving to step 3, initialize date picker with today's date
            if (currentStep === 3) {
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('appointmentDate').value = today;
                selectedDate = today;
                loadTimeSlots();
            }
            
            // If moving to step 4, check for pending style selection
            if (currentStep === 4) {
                const pendingStyle = localStorage.getItem('pendingStyle');
                if (pendingStyle) {
                    const notesField = document.getElementById('customerNotes');
                    notesField.value = `Requested style: ${pendingStyle}`;
                    // Clear the pending style
                    localStorage.removeItem('pendingStyle');
                }
            }
        } else {
            confirmBooking();
        }
    } else {
        showStepError();
    }
}

function showStepError() {
    switch(currentStep) {
        case 1:
            alert('Please select a salon to continue.');
            break;
        case 2:
            alert('Please select a service to continue.');
            break;
        case 3:
            alert('Please select both a date and time slot to continue.');
            break;
        case 4:
            alert('Please fill in all required fields.');
            break;
    }
}

function previousStep() {
    if (currentStep > 1) {
        document.getElementById(`step${currentStep}`).classList.add('hidden');
        currentStep--;
        document.getElementById(`step${currentStep}`).classList.remove('hidden');
        updateNavigationButtons();
    }
}

function validateCurrentStep() {
    switch(currentStep) {
        case 1:
            return selectedSalon !== null;
        case 2:
            return selectedService !== null;
        case 3:
            return selectedDate !== null && selectedTime !== null;
        case 4:
            return validateCustomerDetails();
        default:
            return false;
    }
}

function validateCustomerDetails() {
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    
    if (!name || !phone) {
        return false;
    }
    return true;
}

function confirmBooking() {
    const appointment = {
        id: generateAppointmentId(),
        salonEmail: selectedSalon.email,
        salonName: selectedSalon.name,
        clientName: document.getElementById('customerName').value,
        clientEmail: localStorage.getItem('userEmail'),
        phone: document.getElementById('customerPhone').value,
        service: formatServiceName(selectedService.name),
        price: selectedService.price,
        date: selectedDate,
        time: selectedTime,
        duration: selectedService.duration,
        notes: document.getElementById('customerNotes').value || 'No special notes',
        status: 'upcoming',
        createdAt: new Date().toISOString()
    };

    // Save appointment
    saveAppointment(appointment);
    
    // Show confirmation
    showConfirmation(appointment);
}

function saveAppointment(appointment) {
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    appointments.push(appointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));
}

function showConfirmation(appointment) {
    const modal = document.getElementById('confirmationModal');
    const details = document.getElementById('confirmationDetails');
    
    details.innerHTML = `
        <p><strong>Appointment ID:</strong> ${appointment.id}</p>
        <p><strong>Salon:</strong> ${appointment.salonName}</p>
        <p><strong>Service:</strong> ${appointment.service}</p>
        <p><strong>Date:</strong> ${formatDate(appointment.date)}</p>
        <p><strong>Time:</strong> ${appointment.time}</p>
        <p><strong>Duration:</strong> ${appointment.duration} minutes</p>
        <p><strong>Price:</strong> $${appointment.price}</p>
    `;
    
    modal.style.display = 'flex';
}

function closeConfirmation() {
    document.getElementById('confirmationModal').style.display = 'none';
    window.location.href = 'user-dashboard.html';
}

function updateNavigationButtons() {
    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    backBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
    nextBtn.textContent = currentStep === 4 ? 'Confirm Booking' : 'Next';
}

function formatServiceName(name) {
    return name.replace(/([A-Z])/g, ' $1')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function generateAppointmentId() {
    return 'APT' + Date.now().toString(36).toUpperCase();
}

function handleLogout() {
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
    window.location.href = 'index.html';
}

function getOperatingHoursDisplay(salon) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const openDays = days.filter(day => !salon.operatingHours[day].isClosed);
    
    if (openDays.length === 0) return 'Closed';
    if (openDays.length === 7) return 'Open 7 days';
    
    // Find consecutive ranges of days
    const ranges = [];
    let currentRange = [openDays[0]];
    
    for (let i = 1; i < openDays.length; i++) {
        const currentDayIndex = days.indexOf(openDays[i]);
        const prevDayIndex = days.indexOf(openDays[i-1]);
        
        if (currentDayIndex - prevDayIndex === 1) {
            // Consecutive day
            currentRange.push(openDays[i]);
        } else {
            // Start a new range
            ranges.push([...currentRange]);
            currentRange = [openDays[i]];
        }
    }
    ranges.push(currentRange);
    
    // Format ranges
    return ranges.map(range => {
        if (range.length === 1) {
            return capitalizeFirstLetter(range[0]);
        } else {
            return `${capitalizeFirstLetter(range[0])}-${capitalizeFirstLetter(range[range.length-1])}`;
        }
    }).join(', ');
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}