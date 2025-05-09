# YimsyAI – Food Image Classifier API

Yimsy is an AI-powered API that classifies food photos into 101 categories using an ONNX-exported ViT model trained on the [Food-101 dataset](https://data.vision.ee.ethz.ch/cvl/datasets_extra/food-101/). Built for nutritional analysis and health app integrations.

---

## 🔧 How It Works

- Upload a food image (JPG/PNG)
- It’s resized, normalized, and fed into a ViT model
- The top prediction and confidence score are returned

---

## 🧠 Model

- Model: [eslamxm/vit-base-food101](https://huggingface.co/eslamxm/vit-base-food101)
- License: [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- Converted to ONNX using `torch.onnx.export`

---

## 🛠 API Usage

**POST** `/predict`

- `Content-Type: multipart/form-data`
- Key: `image` → Upload your file

**Example Response:**
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

---

## 🚀 Running Locally
cd backend
npm install
node index.js

---

## 🧹 Dev Notes
- Automatically clears /uploads folder on startup
- Model input shape: [1, 3, 224, 224]
- Normalised with mean=0.5, std=0.5 per channel

---

## 📦 Todo / Roadmap
- Add confidence thresholds for rejecting non-food inputs
- Implement feedback system (“Is this correct?”)
- Frontend for image upload and results display

---

