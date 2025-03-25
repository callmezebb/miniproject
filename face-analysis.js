// face-analysis.js
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const userType = localStorage.getItem('userType');
    if (!userType || userType !== 'user') {
        window.location.href = 'index.html';
    }

    initFaceAnalysisPage();
});

function initFaceAnalysisPage() {
    const fileUpload = document.getElementById('face-upload');
    const previewContainer = document.getElementById('preview-container');
    const analyzeBtn = document.getElementById('analyze-btn');
    const loadingIndicator = document.getElementById('loading-indicator');
    const resultContainer = document.getElementById('face-shape-result');
    const viewStylesBtn = document.getElementById('view-styles');
    
    // Handle file upload
    if (fileUpload) {
        fileUpload.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    // Show image preview
                    previewContainer.innerHTML = `<img src="${e.target.result}" class="preview-image">`;
                    previewContainer.style.display = 'block'; // Make sure the preview is visible
                    
                    // Enable analyze button
                    analyzeBtn.disabled = false;
                    
                    // Store image data hash for consistent analysis
                    localStorage.setItem('currentImageData', hashCode(e.target.result));
                };
                
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
    
    // Handle analyze button click
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', function() {
            // Show loading indicator
            loadingIndicator.classList.remove('hidden');
            resultContainer.querySelector('.placeholder-text').style.display = 'none';
            
            // Simulate analysis (replace with actual API call in production)
            setTimeout(function() {
                // Hide loading indicator
                loadingIndicator.classList.add('hidden');
                
                // Get the face shape based on the image hash
                const imageHash = localStorage.getItem('currentImageData');
                const faceShape = determineFaceShape(imageHash);
                
                // Show result
                resultContainer.innerHTML = `
                    <div class="result-content">
                        <div class="result-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h3>Analysis Complete!</h3>
                        <div class="shape-result">
                            <p>Your face shape is:</p>
                            <h2>${faceShape}</h2>
                        </div>
                        <div class="shape-description">
                            <p>${getShapeDescription(faceShape)}</p>
                        </div>
                    </div>
                `;
                
                // Show view styles button
                viewStylesBtn.classList.remove('hidden');
                
                // Set up view styles button to redirect to hairstyles page with filter
                viewStylesBtn.onclick = function() {
                    // Store the face shape in localStorage
                    localStorage.setItem('faceShape', faceShape.toLowerCase());
                    
                    // Redirect to hairstyles page with filter parameter
                    window.location.href = `hairstyles.html?filter=${faceShape.toLowerCase()}`;
                };
            }, 2000);
        });
    }
}

// Function to generate a simple hash code from a string
function hashCode(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    
    return hash;
}

// Function to determine face shape based on image hash
function determineFaceShape(imageHash) {
    // Use the hash to consistently determine a face shape
    // This ensures the same image always gets the same result
    if (!imageHash) return 'Oval'; // Default if no hash
    
    // Convert hash to a positive number and use modulo 3 to get one of three shapes
    const hashNum = Math.abs(parseInt(imageHash));
    const shapeIndex = hashNum % 3;
    
    const faceShapes = ['Oval', 'Round', 'Square'];
    return faceShapes[shapeIndex];
}

// Helper function to get face shape descriptions
function getShapeDescription(shape) {
    switch(shape) {
        case 'Oval':
            return 'You have an oval face shape with balanced proportions. This versatile shape works well with most hairstyles.';
        case 'Round':
            return 'You have a round face shape with soft angles and similar width and length. Hairstyles that add height and angles work best for you.';
        case 'Square':
            return 'You have a square face shape with a strong jawline. Hairstyles that soften your angles while maintaining your strong features work best.';
        default:
            return 'Your face shape has unique proportions. Try different hairstyles to see what complements your features best.';
    }
}

// Add logout functionality
function logout() {
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
    window.location.href = 'index.html';
}