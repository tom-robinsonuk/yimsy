import express from 'express';
import multer from 'multer';
import OpenAI from 'openai';
import fs from 'fs';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // env var name should be uppercase and consistent
  });

router.post('/', upload.single('image'), async (req, res) => {
    try {
        const imagePath = req.file.path;
        const label = req.body.label || 'Unknown';

        const base64 = fs.readFileSync(imagePath, { encoding: 'base64' });

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            temperature: 0, // Makes responses more deterministic (less creative)
            messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      text: `Look at this image of food. Based on what you see and the (possibly correct) Label: "${label}" provided, list the specific food ingredients in this meal.
              
                            Only include items that can be searched in a food nutrition database (like USDA FDC).
                            
                            Be as specific as possible (e.g. 'grilled chicken breast', not just 'meat' or 'protein').
                            
                            Avoid vague terms like 'green vegetables', 'sauce', or 'spices' — instead say what the most likely actual ingredient is.
                            
                            If a food has multiple names in American and British English, show both, like: Eggplant (Aubergine) or Cilantro (Coriander)

                            If a sauce is branded (e.g. "Big Mac Sauce", "Secret Sauce"), replace it with the closest common equivalent like "Special Sauce", "Mayonnaise", or "Thousand Island Dressing" if applicable.
                            
                            Return a JSON array of ingredient names as strings.
                            
                            if you cannot identify any food in the image, return this exact JSON: ["__ERROR_NO_FOOD__"]`
                    },
                    {
                      type: 'image_url',
                      image_url: {
                        url: `data:image/jpeg;base64,${base64}`,
                      },
                    },
                  ],
                },
            ],
            max_tokens: 300,
        });

        let ingredients = response.choices?.[0]?.message?.content || '';
        ingredients = ingredients.replace(/```json|```/g, '').trim(); // remove markdown code block
        try {
          ingredients = JSON.parse(ingredients); // convert to array
        } catch {
          ingredients = [ingredients]; // fallback: wrap as array
        }

        res.json({ success: true, ingredients });
    } catch (err) {
        console.error('GPT API error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;