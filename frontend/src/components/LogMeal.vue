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
          <v-card class="mt-4 pa-3" outlined shaped>
            <div v-if="awaitingUserLabel">
              <h3 class="text-subtitle-1 font-weight-medium">We detected: {{ prediction.label }}</h3>
              <p>Is this correct?</p>
              <v-btn color="primary" @click="confirmLabel(true)">Yes</v-btn>
              <v-btn color="error" class="ml-2" @click="confirmLabel(false)">No</v-btn>
            </div>

            <div v-if="customLabelPrompt" class="mt-2">
              <v-text-field v-model="customLabel" label="Enter correct label" />
              <v-btn color="primary" class="mt-2" @click="submitCustomLabel" :disabled="loading">Continue</v-btn>
            </div>

            <div v-if="gptIngredients.length" class="mt-4">
              <h3 class="text-subtitle-1 font-weight-medium">Select the ingredients you actually ate:</h3>
              <v-list>
                <v-list-item v-for="(ingredient, index) in gptIngredients" :key="index">
                  <v-card class="pa-3 mb-2" outlined>
                    <v-row align="center">
                      <v-col cols="9">
                        <v-checkbox
                          v-model="selectedIngredients"
                          :label="editingIndex === index ? '' : ingredient"
                          :value="ingredient"
                          hide-details
                        />
                        <v-text-field
                          v-if="editingIndex === index"
                          v-model="editedName"
                          label="Edit ingredient"
                          @keydown.enter="saveIngredient(index)"
                          hide-details
                          density="compact"
                          append-inner-icon="mdi-check"
                          @click:append-inner="saveIngredient(index)"
                        />
                      </v-col>
                      <v-col cols="3" class="text-right">
                        <v-btn icon @click="editIngredient(index)">
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-list-item>
              </v-list>
              <!-- Manual Add Section -->
              <v-divider class="my-4" />
              <div>
                <div class="text-subtitle-2 font-weight-medium mb-2">Missing something?</div>
                <v-text-field
                  v-model="manualIngredient"
                  label="Add another ingredient"
                  density="compact"
                  @keydown.enter="addManualIngredient"
                />
                <v-btn size="small" color="primary" @click="addManualIngredient">Add Ingredient</v-btn>
              </div>
              <v-btn class="mt-2" color="primary" @click="updateSelectedIngredients">CONFIRM SELECTED INGREDIENTS</v-btn>
            </div>
            <div v-if="nutritionResults.length" class="mt-4">
              <h3 class="text-subtitle-1 font-weight-medium">Nutrition Overview (per 100g):</h3>
              <v-list>
                <v-list-item v-for="(item, index) in nutritionResults" :key="index">
                  <v-list-item-title class="font-weight-bold">
                    {{ item.label }} ({{ item.grams }}g)
                  </v-list-item-title>
                  <div style="white-space: normal; line-height: 1.5; font-size: 14px; padding-right: 8px;">
                    Protein: {{ item.protein }}g |
                    Carbs: {{ item.carbs }}g |
                    Fats: {{ item.fats }}g |
                    Kcal: {{ item.kcal }}
                  </div>
                </v-list-item>
              </v-list>
            </div>
            <v-progress-circular v-if="fetchingNutrition" indeterminate color="primary" class="mt-2" />
          </v-card>
          <v-row justify="center" v-if="loading">
            <v-col cols="auto">
              <v-progress-circular indeterminate color="primary" size="36" />
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

const router = useRouter();
const mealStore = useMealStore();
const mealItems = mealStore.mealItems;

const prediction = ref(null);
const gptIngredients = ref([]);
const fileInput = ref(null);
const uploadedFile = ref(null);
const awaitingUserLabel = ref(false);

const customLabelPrompt = ref(false);
const customLabel = ref('');
const loading = ref(false);

const gptSelected = ref([]); // bound to checkboxes
const manualIngredient = ref('');

const selectedIngredients = ref([]); // confirmed after checkboxes
const nutritionResults = ref([]);    // final nutrition info for each
const fetchingNutrition = ref(false);

const editingIndex = ref(null);
const editedName = ref('');

const editIngredient = (index) => {
  editingIndex.value = index;
  editedName.value = gptIngredients.value[index];
};

const saveIngredient = (index) => {
  if (!editedName.value.trim()) return;
  const original = gptIngredients.value[index];
  gptIngredients.value[index] = editedName.value.trim();

  const selectedIdx = selectedIngredients.value.indexOf(original);
  if (selectedIdx !== -1) {
    selectedIngredients.value[selectedIdx] = editedName.value.trim();
  }

  editingIndex.value = null;
};

const triggerFilePicker = () => {
  fileInput.value?.click();
};

const addManualIngredient = async () => {
  const item = manualIngredient.value.trim();
  if (!item) return;

  const results = await tryManualBreakdown(item);

  results.forEach((ingredient) => {
    if (!gptIngredients.value.includes(ingredient)) {
      gptIngredients.value.push(ingredient);
      selectedIngredients.value.push(ingredient);
    }
  });

  manualIngredient.value = '';
};


const tryManualBreakdown = async (label) => {
  try {
    const res = await axios.post('http://localhost:3001/manual-check', { label });
    if (res.data?.success && Array.isArray(res.data.ingredients)) {
      return res.data.ingredients;
    }
  } catch (err) {
    console.warn('Manual breakdown failed:', err.message);
  }
  return [label]; // fallback: treat as normal
};

const updateSelectedIngredients = async () => {
  fetchingNutrition.value = true;
  nutritionResults.value = [];

  
  // Clean up: remove any unchecked ingredients
  selectedIngredients.value = selectedIngredients.value.filter(item =>
    gptIngredients.value.includes(item)
  );

  for (const ingredient of selectedIngredients.value) {
    try {
      const res = await axios.post('http://localhost:3001/fdc-search', {
        query: ingredient
      });

      if (res.data?.success && res.data.data) {
        const food = res.data.data;
        nutritionResults.value.push({
          label: ingredient,
          grams: Number(food.grams).toFixed(1),
          protein: Number(food.protein).toFixed(1),
          carbs: Number(food.carbs).toFixed(1),
          fats: Number(food.fats).toFixed(1),
          kcal: Number(food.kcal).toFixed(0)
        });
      }
    } catch (err) {
      console.warn(`Failed to get nutrition for ${ingredient}`, err.message);
    }
  }

  fetchingNutrition.value = false;
};

const confirmLabel = async (isCorrect) => {
  if (isCorrect) {
    awaitingUserLabel.value = false;
    customLabelPrompt.value = false;
    loading.value = true;
    await runGptIngredientDetection(prediction.value.label);
    loading.value = false;
  } else {
    awaitingUserLabel.value = false;
    customLabelPrompt.value = true;
  }
};

const submitCustomLabel = async () => {
  const label = customLabel.value.trim();
  if (!label) return alert('Please enter a label');

  loading.value = true;
  await runGptIngredientDetection(label);
  loading.value = false;

  customLabelPrompt.value = false;
};

const runGptIngredientDetection = async (label) => {
  const gptForm = new FormData();
  gptForm.append('image', uploadedFile.value);
  gptForm.append('label', label);

  try {
    const gptResponse = await axios.post('http://localhost:3001/analyze-image', gptForm);
    let parsed = gptResponse.data?.ingredients;

    if (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        parsed = [parsed];
      }
    }

    if (
      parsed.length === 1 &&
      parsed[0] === '__ERROR_NO_FOOD__'
      ) {
        alert("We couldn’t detect any food in this photo. Try again with a clearer image.");
        return;
    }

    gptIngredients.value = Array.isArray(parsed) ? parsed : [];
    selectedIngredients.value = [...gptIngredients.value];
  } catch (err) {
    console.error('GPT Ingredient fetch error:', err);
    gptIngredients.value = [];
  }
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  uploadedFile.value = file;

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await axios.post('http://localhost:3001/predict', formData);

    if (response.data?.success && response.data?.prediction?.label) {
      prediction.value = response.data.prediction;
      awaitingUserLabel.value = true;
      customLabelPrompt.value = false;
      gptIngredients.value = [];
    } else {
      alert('Prediction failed.');
    }
  } catch (err) {
    console.error('Prediction error:', err);
    alert('Something went wrong.');
  }
};

const addToDailyLog = () => {
  mealItems.forEach(item => {
    mealStore.addMealItem(item);
  });
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
