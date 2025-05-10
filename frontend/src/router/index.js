import { createRouter, createWebHistory } from "vue-router";
import Home from '../components/Home.vue';
import LogMeal from '../components/LogMeal.vue';

const routes = [
    { path: '/', name: 'Home', component: Home },
    { path: '/log', name: 'LogMeal', component: LogMeal }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;