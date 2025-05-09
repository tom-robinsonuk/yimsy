<template>
    <div style="color: black">Home</div>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="6">
          <MacroRing :data="chartData" :options="chartOptions" />
        </v-col>
      </v-row>
    </v-container>
    <v-card class="mx-auto my-4 pa-4" max-width="320" elevation="2">
        <v-card-title class="text-h6">Total Intake</v-card-title>
        <v-card-text>
            <div><strong>Total:</strong> 58g – 22 kcal</div>
            <div class="mt-2">
            <strong>Macros:</strong>
            <ul style="margin: 0; padding-left: 1rem;">
                <li>55g Protein</li>
                <li>47g Carbs</li>
                <li>32g Fats</li>
            </ul>
            </div>
        </v-card-text>
    </v-card>
    <!-- AI Suggestion -->
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
        <v-btn color="primary" large>
        Log New Meal
        </v-btn>
    </v-col>
    </v-row>
  </template>
  
  <script setup>
  import MacroRing from './MacroRing.vue';
  
  const chartData = {
    labels: ['Protein', 'Carbs', 'Fats'],
    datasets: [
      {
        data: [55, 47, 32],
        backgroundColor: ['#4caf50', '#2196f3', '#ff9800'],
        borderWidth: 1
      }
    ]
  };
  
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
  </script>
  