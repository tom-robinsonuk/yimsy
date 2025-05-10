<template>
    <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/*" style="display: none;" />
    <v-container>
      <v-row justify="center" class="my-6">
        <v-col cols="12" md="6">
          <v-card class="pa-4" elevation="2">
            <h2 class="text-h6 font-weight-bold mb-4 text-center">Log Meal</h2>
  
            <!-- Grid of icon buttons -->
            <v-row dense>
                <v-col cols="6">
                    <v-btn variant="outlined" class="meal-button" style="height: 90px;" block @click="triggerFilePicker">
                        <div class="button-content">
                            <v-icon size="32" class="mb-1">mdi-camera</v-icon>
                            <span class="button-label">Photo</span>
                        </div>
                    </v-btn>
                </v-col>
                <v-col cols="6">
                    <v-btn variant="outlined" block class="pa-0" style="height: 90px;" :ripple="false">
                    <div class="button-content">
                        <v-icon size="32" class="mb-1">mdi-food</v-icon>
                        <span class="button-label">Food Item</span>
                    </div>
                    </v-btn>
                </v-col>
                <v-col cols="6">
                    <v-btn variant="outlined" block class="pa-0" style="height: 90px;" :ripple="false">
                    <div class="button-content">
                        <v-icon size="32" class="mb-1">mdi-barcode-scan</v-icon>
                        <span class="button-label">Barcode</span>
                    </div>
                    </v-btn>
                </v-col>
                <v-col cols="6">
                    <v-btn variant="outlined" block class="pa-0" style="height: 90px;" :ripple="false">
                    <div class="button-content">
                        <v-icon size="32" class="mb-1">mdi-pencil</v-icon>
                        <span class="button-label">Manual Entry</span>
                    </div>
                    </v-btn>
                </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>
  
            <!-- Meal summary -->
            <v-list density="compact">
                <v-list-item
                    v-for="(item, index) in mealItems"
                    :key="index"
                    class="pb-2"
                >
                    <v-list-item-title class="font-weight-bold">{{ item.name }} - {{ item.grams }}g</v-list-item-title>
                    <v-list-item-subtitle>
                    Protein: {{ item.protein }}g | Carbs: {{ item.carbs }}g | Fats: {{ item.fats }}g | Calories: {{ item.kcal }} kcal
                    </v-list-item-subtitle>
                </v-list-item>
                </v-list>

                <v-btn block color="primary" class="mt-4" @click="addToDailyLog">
                    Add to Daily Log
                </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useMealStore } from '../stores/useMealStore.js';
  import { useRouter } from 'vue-router';
  import axios from 'axios';

  const prediction = ref(null);

  // For file input reference
  const fileInput = ref(null);
  
  // Store the meal items
  const mealStore = useMealStore();
  const mealItems = mealStore.mealItems;
  const router = useRouter();

  // Open file picker when button clicked
  const triggerFilePicker = () => {
    fileInput.value?.click();
  };
  
  // Handle uploaded image
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('image', file);
  
    try {
      const response = await axios.post('http://localhost:3001/predict', formData);
  
      if (response.data?.success && response.data?.prediction?.label) {
        const label = response.data.prediction.label;
        const grams = Math.floor(response.data.prediction.confidence * 100); // Random data till nutritional values are added, 

        // Mock macros (replace with real data later)
        const protein = Math.round(grams * 0.2);
        const carbs = Math.round(grams * 0.5);
        const fats = Math.round(grams * 0.3);
        const kcal = Math.round(protein * 4 + carbs * 4 + fats * 9);


        mealItems.push({ name: label, grams, protein, carbs, fats, kcal });
        prediction.value = response.data.prediction;

      } else {
        alert('Prediction failed.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Something went wrong during upload.');
    }
  };

  const addToDailyLog = () => {
  // Push all local meal items to the store
  mealItems.forEach(item => {
    mealStore.addMealItem(item);
  });

  // Clear local list [Optional]
  //mealItems.splice(0);

  //Redirect to home
  router.push('/');
};
  </script>
  
  
  
  <style scoped>
  .flex-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 90px;
    font-size: 14px;
    text-transform: none;
  }

  .button-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.button-label {
  font-size: 14px;
  margin-top: 4px;
}
  </style>
  