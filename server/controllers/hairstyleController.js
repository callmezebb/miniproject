const multer = require('multer');

// Middleware for handling image uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// Placeholder function for face analysis
const analyzeFace = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file uploaded',
            });
        }

        // Simulate face analysis logic
        const faceShapes = ['Oval', 'Round', 'Square', 'Heart', 'Diamond', 'Triangle'];
        const hairstyles = ['Buzz Cut', 'Pompadour', 'Crew Cut', 'Undercut', 'Quiff'];
        const beardStyles = ['Full Beard', 'Goatee', 'Stubble', 'Clean Shaven'];

        const analyzedFaceShape = faceShapes[Math.floor(Math.random() * faceShapes.length)];
        const analyzedHairstyle = hairstyles[Math.floor(Math.random() * hairstyles.length)];
        const analyzedBeardStyle = beardStyles[Math.floor(Math.random() * beardStyles.length)];

        res.status(200).json({
            success: true,
            faceShape: analyzedFaceShape,
            hairstyle: analyzedHairstyle,
            beardstyle: analyzedBeardStyle,
        });
    } catch (error) {
        console.error('Error analyzing face:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during face analysis',
        });
    }
};

module.exports = {
    upload,
    analyzeFace,
};
