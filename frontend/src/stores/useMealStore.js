import { defineStore } from 'pinia';

export const useMealStore = defineStore('mealStore', {
    state: () => ({
        mealItems: []
    }),
    actions: {
        addMealItem(item) {
            this.mealItems.push(item);
        },
        clearMeals() {
            this.mealItems = [];
        }
    }
});