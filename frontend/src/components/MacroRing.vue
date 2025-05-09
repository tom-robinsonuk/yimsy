<template>

    <div class="ring-wrapper">
        <Doughnut :data="data" :options="options" />
        <div class="ring-center-label">PROTEIN<br />CARBS<br />FATS</div>
    </div>
  </template>
  
  <script setup>
  import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
  } from 'chart.js';
  
  import { Doughnut } from 'vue-chartjs';
  
  // Register required Chart.js components
  ChartJS.register(ArcElement, Tooltip, Legend);
  
  // Props passed in from Home.vue
  defineProps({
    data: Object,
    options: Object
  });
  </script>

<style scoped>
.ring-wrapper {
  position: relative;
  width: 220px;
  height: 220px;
  margin: 0 auto;
}

.ring-center-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: bold;
  text-align: center;
  line-height: 1.2;
}
</style>
  