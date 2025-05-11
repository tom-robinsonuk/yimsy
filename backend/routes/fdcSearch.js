// backend/routes/fdcSearch.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/fdc-search', async (req, res) => {
  const { query } = req.body;
  const apiKey = process.env.FDC_API_KEY;

  const searchFdc = async (query, exact = false) => {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=${apiKey}&pageSize=5&exact=${exact}`;
    const response = await axios.get(url);
    return response.data.foods || [];
  };

  try {
    // Step 1: Exact match first
    let foods = await searchFdc(query, true);

    // Step 2: If none found, fallback to fuzzy match
    if (foods.length === 0) {
      foods = await searchFdc(query, false);
    }

    // Step 3: Try to find best match
    const match = foods.find(food =>
      food.description.toLowerCase().includes(query.toLowerCase())
    ) || foods[0];

    if (!match) {
      return res.status(404).json({ success: false, error: 'No match found' });
    }

    // Extract nutrients from match
    const nutrients = match.foodNutrients || [];

    //console.log('🔍 Nutrients:', nutrients.map(n => `${n.nutrientName} (${n.unitName})`));

    const get = (name) => {
    if (name === 'energy') {
        const kcalEntry = nutrients.find(n =>
        n.nutrientName.toLowerCase() === 'energy' &&
        n.unitName.toLowerCase() === 'kcal'
        );
        return kcalEntry?.value ?? 0;
    }

    return nutrients.find(n =>
        n.nutrientName.toLowerCase().includes(name.toLowerCase())
    )?.value ?? 0;
    };


    const result = {
      label: match.description,
      grams: 100, //Math.round(match.servingSize || 100), // fallback --> Hardcoded to 100g at the moment, due to FDC bug, where it gave lower than 100 for grams but 100g serving for everything else
      protein: get('protein'),
      carbs: get('carbohydrate'),
      fats: get('fat'),
      kcal: get('energy')
    };

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('FDC search error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
