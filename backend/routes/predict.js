import express from 'express';
import multer from 'multer';
import path from 'path';
import { predictImage } from '../model/predict.js';
import fs from 'fs/promises';
import ort from 'onnxruntime-node';

const router = express.Router();

// Multer setup
const upload = multer({ dest: 'uploads/' });

// POST /predict
router.post('/', upload.single('image'), async (req, res) => {
    const imagePath = req.file.path;
  
    try {
      const result = await predictImage(imagePath);
  
      res.json({
        success: true,
        prediction: result,
      });
    } catch (error) {
      console.error('Prediction error:', error.message, error.stack);
      res.status(500).json({ success: false, message: 'Prediction failed' });
    } finally {
      // Attempt to clean up file safely
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        console.warn('⚠️ Failed to delete temp file:', err.message);
      }
    }
  });

export default router;