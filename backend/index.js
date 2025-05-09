import express from 'express';
import cors from 'cors';
import predictRoute from './routes/predict.js';

const app = express();
const PORT = 3001; 

app.use(cors());
app.use(express.json());

// mount the predict route
app.use('/predict', predictRoute);

app.listen(PORT, () => {
    console.log(`Yimsy backend running at http://localhost:${PORT}`);
});
