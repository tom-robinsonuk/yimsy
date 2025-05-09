import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ort from 'onnxruntime-node';

const router = express.Router();

// Multer setup
const upload = multer({ dest: 'uploads/' });

// POST /predict
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const imagePath = req.file.path;

        // Load and run the model

        // Temp Mock
        res.json({ prediction: 'pizza', confidence: 0.93 });

        // clean up the uploaded file after testing
        fs.unlinkSync(imagePath);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Prediction failed' });
    }
});

export default router;