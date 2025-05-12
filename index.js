import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import 'dotenv/config';
import predictRoute from './backend/routes/predict.js';
import { ensureOnnxModel } from './backend/scripts/prepare_model.js';
import analyzeImageRoute from './backend/routes/analyzeImage.js';
import fdcSearchRoute from './backend/routes/fdcSearch.js';
import manualIngredientCheckRoute from './backend/routes/manualIngredientCheck.js';
import fdcRefineRoute from './backend/routes/fdcRefine.js';

// Call before starting server
await ensureOnnxModel();

const app = express();
const PORT = 3001; 

app.use(cors());
app.use(express.json());

// GPT
app.use('/analyze-image', analyzeImageRoute);
app.use('/manual-check', manualIngredientCheckRoute);
app.use('/', fdcRefineRoute);

// Database
app.use('/', fdcSearchRoute);

// --- Cleanup temp uploads folder on start ---
const cleanupUploads = async () => {
    const dir = path.join(process.cwd(), './uploads');
    try {
      const files = await fs.readdir(dir);
      for (const file of files) {
        await fs.unlink(path.join(dir, file));
      }
      console.log('🧹 Cleaned up old upload files.');
    } catch (err) {
      console.warn('⚠️ Upload cleanup failed:', err.message);
    }
  };
  cleanupUploads();

// mount the predict route
app.use('/predict', predictRoute);

app.listen(PORT, () => {
    console.log(`Yimsy backend running at http://localhost:${PORT}`);
});
