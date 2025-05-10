import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/fdc-search', async (req, res) => {
  const { query } = req.body;
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=${process.env.FDC_API_KEY}&pageSize=1`;

  try {
    const fdcRes = await axios.get(url);
    const food = fdcRes.data.foods?.[0];
    res.json({ success: true, data: food });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
