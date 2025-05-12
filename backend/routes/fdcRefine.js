import express from 'express';
import axios from 'axios';
import OpenAI from 'openai';

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/fdc-refine', async (req, res) => {
  const { label, suggestions } = req.body;

  if (!label || !Array.isArray(suggestions)) {
    return res.status(400).json({ success: false, error: 'Invalid input' });
  }

  const prompt = `
                The user inputted this food ingredient: "${label}"

                This label may be too vague or too specific to match a nutrition database like USDA FDC.

                You are given this list of similar ingredients from the database:
                ${suggestions.join('\n')}

                Pick the best, most accurate match from the list above that represents what the user most likely meant.
                Prioritize general but realistic food ingredients (e.g., "Fish, tuna, canned" is better than "Tuna salad").

                Only respond with the best match string. No explanations.
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });

    const bestMatch = response.choices[0].message?.content?.trim();
    res.json({ success: true, best: bestMatch || label });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
