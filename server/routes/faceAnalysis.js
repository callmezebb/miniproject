const express = require('express');
const router = express.Router();
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({ storage });
const app = express();

app.use(cors({
    origin: ['http://localhost:5900', 'http://127.0.0.1:5900'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
  }));

router.post('/analyze-face', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image file provided" });
        }

        const imageBuffer = req.file.buffer.toString('base64');
        const prompt = `Analyze this person's face and suggest hairstyle and beard style suitable for their face shape.`;

        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyD7S2AVmHTDqYL3a0QcxWzEOx1wG0Dsh0o', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    { 
                        role: "user", 
                        parts: [
                            { text: prompt },
                            { inlineData: { mimeType: "image/jpeg", data: imageBuffer } }
                        ]
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`API response error: ${response.status}`);
        }

        const data = await response.json();
        const recommendation = data.candidates[0]?.content?.parts[0]?.text || "No suggestion received.";
        res.json({ success: true, recommendation });

    } catch (err) {
        console.error('Face analysis error:', err);
        res.status(500).json({ 
            success: false, 
            error: "Failed to analyze face",
            message: err.message 
        });
    }
});

module.exports = router;