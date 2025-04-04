class FaceAnalyzer {
    constructor() {
        this.setupUI();
        this.setupEventListeners();
    }

    setupUI() {
        const container = document.getElementById('face-analysis') || document.body;
        container.innerHTML = `
            <div class="face-analysis-container">
                <div class="analysis-header">
                    <h2>Face Shape Analysis</h2>
                    <p>Upload your photo to find the perfect hairstyle for your face shape</p>
                </div>

                <div class="upload-section">
                    <div class="upload-box" id="uploadBox">
                        <input type="file" id="imageInput" accept="image/*" hidden>
                        <div class="upload-content">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>Click to upload your photo</p>
                            <span class="upload-hint">
                                For best results:
                                <ul>
                                    <li>Use a front-facing photo</li>
                                    <li>Ensure good lighting</li>
                                    <li>Keep hair away from face</li>
                                </ul>
                            </span>
                        </div>
                    </div>
                    
                    <div class="preview-container" id="previewContainer" style="display: none;">
                        <img id="imagePreview" alt="Face preview">
                        <button id="retakeBtn" class="secondary-button">
                            <i class="fas fa-redo"></i> Retake Photo
                        </button>
                    </div>
                </div>

                <div class="analysis-controls">
                    <button id="analyzeBtn" class="primary-button" disabled>
                        <i class="fas fa-search"></i> Analyze Face Shape
                    </button>
                </div>

                <div id="resultSection" class="result-section" style="display: none;">
                    <div class="result-content">
                        <h3>Your Face Shape:</h3>
                        <div id="shapeResult" class="shape-result"></div>
                        <div class="shape-description" id="shapeDescription"></div>
                        <button id="viewStylesBtn" class="primary-button">
                            <i class="fas fa-cut"></i> View Recommended Hairstyles
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const uploadBox = document.getElementById('uploadBox');
        const imageInput = document.getElementById('imageInput');
        const retakeBtn = document.getElementById('retakeBtn');
        const analyzeBtn = document.getElementById('analyzeBtn');
        const viewStylesBtn = document.getElementById('viewStylesBtn');

        uploadBox.addEventListener('click', () => imageInput.click());
        imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        retakeBtn.addEventListener('click', () => this.resetAnalysis());
        analyzeBtn.addEventListener('click', () => this.analyzeFaceShape());
        viewStylesBtn.addEventListener('click', () => this.redirectToHairstyles());

        // Drag and drop functionality
        uploadBox.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadBox.classList.add('dragover');
        });

        uploadBox.addEventListener('dragleave', () => {
            uploadBox.classList.remove('dragover');
        });

        uploadBox.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadBox.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                imageInput.files = e.dataTransfer.files;
                this.handleImageUpload({ target: imageInput });
            }
        });
    }
    
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.getElementById('imagePreview');
            img.src = e.target.result;
            
            document.getElementById('uploadBox').style.display = 'none';
            document.getElementById('previewContainer').style.display = 'block';
            document.getElementById('analyzeBtn').disabled = false;
            document.getElementById('resultSection').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    resetAnalysis() {
        document.getElementById('imageInput').value = '';
        document.getElementById('uploadBox').style.display = 'block';
        document.getElementById('previewContainer').style.display = 'none';
        document.getElementById('analyzeBtn').disabled = true;
        document.getElementById('resultSection').style.display = 'none';
    }

    analyzeFaceShape() {
        const analyzeBtn = document.getElementById('analyzeBtn');
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';

        // Simulate analysis (replace with actual face shape detection logic)
        setTimeout(() => {
            const faceShapes = ['oval', 'round', 'square'];
            const randomShape = faceShapes[Math.floor(Math.random() * faceShapes.length)];
            this.showResults(randomShape);
            analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze Face Shape';
            analyzeBtn.disabled = false;
        }, 2000);
    }

    showResults(faceShape) {
        const descriptions = {
            oval: "Oval face shapes are well-balanced and considered ideal for most hairstyles. Your face length is about 1.5 times the width, with gentle curves and no sharp angles.",
            round: "Round face shapes have similar length and width, with soft curves and full cheeks. The best hairstyles for you add length and create angles.",
            square: "Square face shapes have strong angular features with similar measurements for width at forehead, cheekbones, and jaw. Ideal styles soften these angles."
        };

        const shapeResult = document.getElementById('shapeResult');
        const shapeDescription = document.getElementById('shapeDescription');
        
        shapeResult.innerHTML = `
            <div class="shape-icon">
                <i class="fas fa-user"></i>
                        </div>
            <h4>${faceShape.charAt(0).toUpperCase() + faceShape.slice(1)} Face</h4>
        `;
        
        shapeDescription.textContent = descriptions[faceShape];
        document.getElementById('resultSection').style.display = 'block';
        
        // Store the face shape for hairstyles page
        localStorage.setItem('analyzedFaceShape', faceShape);
    }

    redirectToHairstyles() {
        const faceShape = localStorage.getItem('analyzedFaceShape');
        if (faceShape) {
            // Store that we're coming from face analysis
            sessionStorage.setItem('fromFaceAnalysis', 'true');
            // Store the analyzed face shape
            sessionStorage.setItem('analyzedFaceShape', faceShape);
            // Redirect to hairstyles page with face shape parameter
            window.location.href = `hairstyles.html?faceShape=${faceShape}#hairstyles`;
        }
    }
}

// Add styles
const styles = `
    .face-analysis-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
    }

    .analysis-header {
        text-align: center;
        margin-bottom: 2rem;
    }

    .upload-box {
        border: 2px dashed #3498db;
        border-radius: 10px;
        padding: 2rem;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .upload-box.dragover {
        background-color: #f0f9ff;
        border-color: #2980b9;
    }

    .upload-content i {
        font-size: 3rem;
        color: #3498db;
        margin-bottom: 1rem;
    }

    .upload-hint {
        color: #666;
        font-size: 0.9rem;
        margin-top: 1rem;
        display: block;
    }

    .upload-hint ul {
        list-style-type: none;
        padding: 0;
        margin: 0.5rem 0;
    }

    .preview-container {
        text-align: center;
        margin: 2rem 0;
    }

    #imagePreview {
        max-width: 100%;
        max-height: 400px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .analysis-controls {
        text-align: center;
        margin: 2rem 0;
    }

    .primary-button {
        background-color: #3498db;
        color: white;
        border: none;
        padding: 0.8rem 1.5rem;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.3s;
    }

    .primary-button:disabled {
        background-color: #bdc3c7;
        cursor: not-allowed;
    }

    .secondary-button {
        background-color: #95a5a6;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.9rem;
        margin-top: 1rem;
        transition: background-color 0.3s;
    }

    .result-section {
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 2rem;
        margin-top: 2rem;
        text-align: center;
    }

    .shape-result {
        margin: 1.5rem 0;
    }

    .shape-icon i {
        font-size: 3rem;
        color: #3498db;
        margin-bottom: 1rem;
    }

    .shape-description {
        color: #666;
        margin: 1rem 0 2rem;
        line-height: 1.6;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .result-section {
        animation: fadeIn 0.5s ease;
    }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Initialize face analyzer
document.addEventListener('DOMContentLoaded', () => {
    new FaceAnalyzer();
}); 