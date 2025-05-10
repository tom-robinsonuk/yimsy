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
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: `This is a photo of a meal (possibly ${label}). What individual ingredients do you detect? Response with a clean array like: ["Chicken", "Carrots", "Broccoli"]`},
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