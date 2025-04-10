const imageInput = document.getElementById('imageInput');
const uploadBox = document.getElementById('uploadBox');
const previewContainer = document.getElementById('previewContainer');
const imagePreview = document.getElementById('imagePreview');
const retakeBtn = document.getElementById('retakeBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const shapeResult = document.getElementById('shapeResult');
const shapeDescription = document.getElementById('shapeDescription');
const resultSection = document.getElementById('resultSection');

uploadBox.addEventListener('click', () => imageInput.click());

imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    if (file) {
        imagePreview.src = URL.createObjectURL(file);
        previewContainer.style.display = 'block';
        uploadBox.style.display = 'none';
        analyzeBtn.disabled = false;
        resultSection.style.display = 'none';
    }
});

retakeBtn.addEventListener('click', () => {
    imageInput.value = "";
    previewContainer.style.display = 'none';
    uploadBox.style.display = 'flex';
    analyzeBtn.disabled = true;
    resultSection.style.display = 'none';
});

analyzeBtn.addEventListener('click', async () => {
    const file = imageInput.files[0];
    if (!file) return;

    shapeResult.textContent = "Analyzing...";
    shapeDescription.innerHTML = "";
    resultSection.style.display = 'block';

    try {
        const recommendation = await analyzeFace(file);
        shapeResult.textContent = "💡 Personalized Recommendation";
        shapeDescription.innerHTML = formatRecommendation(recommendation);
    } catch (err) {
        shapeResult.textContent = "Error";
        shapeDescription.innerHTML = `<p style="color:red;">${err.message}</p>`;
    }
});

async function analyzeFace(imageFile) {
    try {
        const formData = new FormData();
        formData.append('image', imageFile);

        const response = await fetch('http://localhost:5000/api/face/analyze-face', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Face analysis failed');
        }

        return data.recommendation;
    } catch (error) {
        console.error('Error during face analysis:', error);
        throw new Error('Failed to analyze face. Please try again later.');
    }
}

function formatRecommendation(text) {
    // Automatically formats **bold** and *bullets*
    let formatted = text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")           // bold
        .replace(/\* (.*?)\n?/g, "• $1<br>")                        // bullets
        .replace(/\n/g, "<br>");                                    // new lines

    return `<div style="text-align: left; line-height: 1.8; color: #2c3e50;">${formatted}</div>`;
}
