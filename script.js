const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav-links');

burger.addEventListener('click', () => {
    nav.classList.toggle('nav-active');
    burger.classList.toggle('toggle');
});

// Smooth scrolling
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({
        behavior: 'smooth'
    });
}

// Face Analysis
const faceUpload = document.getElementById('face-upload');
const previewContainer = document.getElementById('preview-container');
const faceShapeResult = document.getElementById('face-shape-result');
const viewStylesBtn = document.getElementById('view-styles');

faceUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewContainer.innerHTML = `<img src="${e.target.result}" alt="Face preview">`;
            analyzeFaceShape();
        }
        reader.readAsDataURL(file);
    }
});

function analyzeFaceShape() {
    // Simulate face shape analysis
    const shapes = ['Oval', 'Round', 'Square', 'Heart', 'Diamond', 'Triangle'];
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    
    setTimeout(() => {
        faceShapeResult.innerHTML = `
            <h3>Analysis Result</h3>
            <p>Your face shape appears to be: <strong>${randomShape}</strong></p>
        `;
        viewStylesBtn.classList.remove('hidden');
        viewStylesBtn.onclick = () => {
            scrollToSection('hairstyles');
            filterHairstyles(randomShape.toLowerCase());
        };
    }, 1500);
}

// Hairstyles Gallery
const hairstyles = [
    { id: 1, name: 'Textured Crop', faceType: 'oval', image: 'textured-crop.jpg' },
    { id: 2, name: 'Quiff', faceType: 'oval', image: 'quiff.jpg' },
    { id: 3, name: 'Side Part', faceType: 'round', image: 'side-part.jpg' },
    { id: 4, name: 'Faux Hawk', faceType: 'round', image: 'faux-hawk.jpg' },
    { id: 5, name: 'Pompadour', faceType: 'square', image: 'pompadour.jpg' },
    { id: 6, name: 'Textured Fringe', faceType: 'square', image: 'textured-fringe.jpg' },
];

const hairstylesContainer = document.getElementById('hairstyles-container');
const filterButtons = document.querySelectorAll('.filter-btn');

function displayHairstyles(filteredStyles = hairstyles) {
    hairstylesContainer.innerHTML = filteredStyles.map(style => `
        <div class="hairstyle-card">
            <img src="images/${style.image}" alt="${style.name}">
            <h3>${style.name}</h3>
            <p>Ideal for ${style.faceType} face shape</p>
            <button onclick="bookStyle(${style.id})">Book This Style</button>
        </div>
    `).join('');
}

function filterHairstyles(faceType) {
    const filteredStyles = faceType === 'all' 
        ? hairstyles 
        : hairstyles.filter(style => style.faceType === faceType);
    displayHairstyles(filteredStyles);
    
    filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === faceType);
    });
}

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterHairstyles(button.dataset.filter);
    });
});

// Initialize hairstyles gallery
displayHairstyles();

// Booking Form
const bookingForm = document.getElementById('booking-form');

bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        barber: document.getElementById('barber').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value
    };

    // Here you would typically send this data to a server
    console.log('Booking submitted:', formData);
    alert('Booking submitted successfully!');
    bookingForm.reset();
});

function bookStyle(styleId) {
    scrollToSection('booking');
    // You could pre-fill the booking form with the selected style
    // or add it to the form data when submitting
}

// Form input animation
document.querySelectorAll('.form-group input').forEach(input => {
    input.addEventListener('focus', () => {
        input.classList.add('active');
    });

    input.addEventListener('blur', () => {
        if (!input.value) {
            input.classList.remove('active');
        }
    });
});
