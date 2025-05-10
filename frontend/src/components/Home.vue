<template>
    <v-row justify="center" class="mt-8">
        <v-col cols="auto">
            <h1 class="text-h5 font-weight-bold text-center">Home</h1>
        </v-col>
    </v-row>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="6">
          <MacroRing :data="chartData" :options="chartOptions" />
        </v-col>
      </v-row>
    </v-container>
    <v-card class="mx-auto my-4 pa-4" max-width="320" elevation="2">
        <v-card class="pa-4 mb-4" elevation="2">
            <div class="text-h6 font-weight-bold mb-2 text-center">Total Intake</div>
            <div class="text-subtitle-1">Grams: {{ totalSummary.grams }}g</div>
            <div class="text-subtitle-1">Protein: {{ totalSummary.protein }}g</div>
            <div class="text-subtitle-1">Carbs: {{ totalSummary.carbs }}g</div>
            <div class="text-subtitle-1">Fats: {{ totalSummary.fats }}g</div>
            <div class="text-subtitle-1">Calories: {{ totalSummary.kcal }} kcal</div>
        </v-card>
    </v-card>
    <!-- AI Suggestion tbc -->
    <v-row justify="center" class="mt-6">
    <v-col cols="12" md="6">
        <v-card class="pa-4 elevation-2">
        <v-card-title class="text-subtitle-1 font-weight-bold">AI Suggestion</v-card-title>
        <v-card-text>
            Consider adding <strong>25g protein</strong> to reach your goal.
        </v-card-text>
        </v-card>
    </v-col>
    </v-row>

    <!-- Log New Meal Button -->
    <v-row justify="center" class="mt-4 mb-10">
    <v-col cols="auto">
        <v-btn block color="primary" class="mt-4" @click="$router.push('/log')">
            Log New Meal
        </v-btn>
    </v-col>
    </v-row>
  </template>
  
  <script setup>
    import MacroRing from './MacroRing.vue';
    import { useMealStore } from '../stores/useMealStore.js';
    import { computed } from 'vue';

    const mealStore = useMealStore();

    const chartData = computed(() => ({
    labels: ['Protein', 'Carbs', 'Fats'],
    datasets: [
    {
        data: [
        totalSummary.value.protein,
        totalSummary.value.carbs,
        totalSummary.value.fats
        ],
        backgroundColor: ['#4caf50', '#2196f3', '#ff9800'],
        borderWidth: 1
    }
    ]
    }));
  
    const chartOptions = {
        cutout: '70%',
        plugins: {
        legend: {
            display: false
        },
        tooltip: {
            enabled: false
        }
        }
    };

    const totalSummary = computed(() => {
        return mealStore.mealItems.reduce(
            (acc, item) => {
                acc.grams += item.grams;
                acc.protein += item.protein;
                acc.carbs += item.carbs;
                acc.fats += item.fats;
                acc.kcal += item.kcal;
                return acc;
            },
            { grams: 0, protein: 0, carbs: 0, fats: 0, kcal: 0 }
        );
    });

  </script>
  