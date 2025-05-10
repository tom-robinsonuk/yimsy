# 🍽️ YimsyAI – Smart Food Detection with Ingredient Breakdown

Yimsy is an AI-powered meal logging system that combines Food101 classification and GPT-4o vision analysis to break down meals from images into real ingredients for future nutritional tracking.

---

## 🚀 Features

- 🔍 **Food Classifier (Food-101 + ViT ONNX)**  
  Detects the most likely food category from a photo

- 🧠 **GPT-4o Ingredient Detection**  
  After confirmation or correction, Yimsy uses GPT to identify individual ingredients from the meal image

- ✅ **User Feedback Flow**  
  Users can confirm or correct detected food before ingredient breakdown

- 📊 **Frontend Meal Logging (Vue 3 + Vuetify)**  
  Clean UI for uploading, reviewing, and adding meals to your log

---

## 🧠 Model Info

- **Classifier Model:** [`eslamxm/vit-base-food101`](https://huggingface.co/eslamxm/vit-base-food101)  
- **Exported To:** ONNX  
- **Image Preprocessing:**  
  - Resize to `224x224`  
  - Normalize to `mean=0.5`, `std=0.5`  
- **Ingredient Detection:** OpenAI GPT-4o (vision)

---

## 🛠 Backend API

### **POST** `/predict`  
Use Food101 model to predict food category  
- **Body:** `multipart/form-data` with `image`

```json
{
  "success": true,
  "prediction": {
    "classIndex": 72,
    "label": "pizza",
    "confidence": 0.945
  }
}
```

### **POST** `/analyze-image`  
Detect ingredients from image with GPT  
- **Body:** `multipart/form-data`  
- **Fields:**  
  - `image` – the file  
  - `label` – optional hint from Food101 (e.g. `"pizza"`)

```json
{
  "success": true,
  "ingredients": ["Cheese", "Tomato Sauce", "Dough"]
}
```

---

## 🧪 Running Locally

```bash
# From project root
npm install
node index.js
```

- Visit frontend at: `http://localhost:5173/`
- Backend runs on: `http://localhost:3001/`

---

## 🧹 Dev Notes

- Clears `/uploads/` on every backend start
- Uses [Multer](https://github.com/expressjs/multer) for file handling
- Uses `openai.chat.completions.create` with GPT-4o (vision) to analyze base64 image

---

## 🧭 Roadmap

- 🧮 Ingredient → Nutrition mapping using FDC/USDA  
- 📦 Caching past results for API optimization  
- 🔐 Add user authentication and meal history  
- 📈 Nutrition ring UI to track macros  
- 📢 Credit usage notifications for GPT

---

## 🔒 Licensing Notice

YimsyAI is a proprietary application. All rights reserved.  
Not licensed for redistribution, resale, or open-source use.
