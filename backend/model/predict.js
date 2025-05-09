import * as ort from 'onnxruntime-node';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

// Placeholder class labels — we’ll update with real Food101 labels later
const LABELS = [
    "apple_pie", "baby_back_ribs", "baklava", "beef_carpaccio", "beef_tartare",
    "beet_salad", "beignets", "bibimbap", "bread_pudding", "breakfast_burrito",
    "bruschetta", "caesar_salad", "cannoli", "caprese_salad", "carrot_cake",
    "ceviche", "cheesecake", "cheese_plate", "chicken_curry", "chicken_quesadilla",
    "chicken_wings", "chocolate_cake", "chocolate_mousse", "churros", "clam_chowder",
    "club_sandwich", "crab_cakes", "creme_brulee", "croque_madame", "cup_cakes",
    "deviled_eggs", "donuts", "dumplings", "edamame", "eggs_benedict",
    "escargots", "falafel", "filet_mignon", "fish_and_chips", "foie_gras",
    "french_fries", "french_onion_soup", "french_toast", "fried_calamari", "fried_rice",
    "frozen_yogurt", "garlic_bread", "gnocchi", "greek_salad", "grilled_cheese_sandwich",
    "grilled_salmon", "guacamole", "gyoza", "hamburger", "hot_and_sour_soup",
    "hot_dog", "huevos_rancheros", "hummus", "ice_cream", "lasagna",
    "lobster_bisque", "lobster_roll_sandwich", "macaroni_and_cheese", "macarons", "miso_soup",
    "mussels", "nachos", "omelette", "onion_rings", "oysters",
    "pad_thai", "paella", "pancakes", "panna_cotta", "peking_duck",
    "pho", "pizza", "pork_chop", "poutine", "prime_rib",
    "pulled_pork_sandwich", "ramen", "ravioli", "red_velvet_cake", "risotto",
    "samosa", "sashimi", "scallops", "seaweed_salad", "shrimp_and_grits",
    "spaghetti_bolognese", "spaghetti_carbonara", "spring_rolls", "steak", "strawberry_shortcake",
    "sushi", "tacos", "takoyaki", "tiramisu", "tuna_tartare",
    "waffles"
  ];
  

export async function predictImage(filePath) {
    // Load and preprocess the image
    const imageBuffer = await sharp(filePath)
    .resize(224, 224)
    .removeAlpha()
    .raw()
    .toBuffer();

    //Converts interleaved RGB to channel-first Float32 normalized array
    const [H, W, C] = [224, 224, 3];
    const floatArray = new Float32Array(C * H * W);
    
    for (let h = 0; h < H; ++h) {
      for (let w = 0; w < W; ++w) {
        const baseIdx = (h * W + w) * 3;
        const r = imageBuffer[baseIdx] / 255;
        const g = imageBuffer[baseIdx + 1] / 255;
        const b = imageBuffer[baseIdx + 2] / 255;
    
        // normalize with mean/std = 0.5/0.5
        const rn = (r - 0.5) / 0.5;
        const gn = (g - 0.5) / 0.5;
        const bn = (b - 0.5) / 0.5;
    
        // write into floatArray in [C,H,W] order:
        floatArray[0 * H * W + h * W + w] = rn; // channel 0 (R)
        floatArray[1 * H * W + h * W + w] = gn; // channel 1 (G)
        floatArray[2 * H * W + h * W + w] = bn; // channel 2 (B)
      }
    }

    // Create tensor
    const inputTensor = new ort.Tensor('float32', floatArray, [1, 3, 224, 224]);

    // Load model
    const modelPath = path.join(process.cwd(), 'backend', 'model', 'food101.onnx');
    const session = await ort.InferenceSession.create(modelPath);
    const output = await session.run({ input: inputTensor });

    // Extract prediction
    const outputTensor = output.output.data;

    const softmax = (arr) => {
        const exp = arr.map(Math.exp);
        const sum = exp.reduce((a, b) => a + b, 0);
        return exp.map(v => v / sum);
    };
    
    const probs = softmax(outputTensor);
    const top5 = [...probs]
        .map((p, i) => ({ index: i, label: LABELS[i], prob: p }))
        .sort((a, b) => b.prob - a.prob)
        .slice(0, 5);
    
    console.table(top5);
      
    const maxIdx = outputTensor.indexOf(Math.max(...outputTensor));

    return {
    classIndex: maxIdx,
    label: LABELS[maxIdx] || `Unknown (${maxIdx})`,
    confidence: outputTensor[maxIdx]
};
}
