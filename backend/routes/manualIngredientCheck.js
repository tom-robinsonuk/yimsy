import express from 'express';
import OpenAI from 'openai';

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/', async (req, res) => {
  const { label } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: `The user entered: "${label}".
                    Your task is to break this into actual food ingredients that could be matched in a food nutrition database (like USDA FDC).
                    
                    If it's a full product (e.g. Big Mac, Tesco Tuna Melt, Chicken Biryani), break it down into specific ingredients like:
                    ["Beef Patty", "Cheddar Cheese", "Lettuce", "Bun", "Pickles"]
                    
                    Be specific and avoid vague terms like "meat", "sauce", "green vegetables", or "cheese". Instead  as an example say:
                    - "Grilled Chicken Breast" instead of "meat"
                    - "Mayonnaise" instead of "sauce"
                    - "Spinach" instead of "green vegetables"
                    - "Cheddar Cheese" instead of "cheese"

                    If a sauce is branded (e.g. "Big Mac Sauce", "Secret Sauce"), replace it with the closest common equivalent like "Special Sauce", "Mayonnaise", or "Thousand Island Dressing" if applicable.

                    If you can include both UK and US terms, format like this: Eggplant (Aubergine), Cilantro (Coriander)
                    
                    Only return a clean JSON array of food ingredients.
                    If it’s already a valid single ingredient, return just: ["${label}"]
                    If it’s clearly not a food item, return this exact JSON: ["__ERROR_NO_FOOD__"]`
        }
      ],
      max_tokens: 300
    });

    let content = response.choices[0]?.message?.content || '[]';

    // Clean out markdown and newlines
    content = content.replace(/```json|```/g, '').trim();
    
    // Extract just the JSON array if GPT adds extra text
    const arrayStart = content.indexOf('[');
    if (arrayStart !== -1) {
      content = content.slice(arrayStart);
    }
    
    let parsed;
    try {
      parsed = JSON.parse(content);
      res.json({ success: true, ingredients: parsed });
    } catch (err) {
      console.error('❌ Could not parse GPT response:', content);
      res.status(400).json({
        success: false,
        error: 'Invalid GPT format, could not parse ingredients.',
        raw: content
      });
    }
    
  } catch (err) {
    console.error('Manual check GPT error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
