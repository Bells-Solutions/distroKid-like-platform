<script setup lang="ts">
import BasePage from '../BasePage.vue';
import { ref } from 'vue';

// Mock subscription data (replace with API call later)
const subscription = ref({
  currentPlan: 'Pro',
  renewalDate: '2025-04-01',
  price: 30,
  status: 'Active',
});

const availablePlans = [
  { name: 'Free', price: 0, features: ['Basic Features', 'Limited Support'] },
  { name: 'Pro', price: 30, features: ['All Features', 'Priority Support'] },
  {
    name: 'Premium',
    price: 100,
    features: ['Advanced Features', '24/7 Support'],
  },
];

const changePlan = (planName: string) => {
  const selectedPlan = availablePlans.find((plan) => plan.name === planName);
  if (selectedPlan) {
    subscription.value.currentPlan = selectedPlan.name;
    subscription.value.price = selectedPlan.price;
    subscription.value.status = 'Pending';

    alert(`Subscription changed to ${selectedPlan.name}.`);
  }
};
</script>

<template>
  <BasePage title="Subscription">
    <!-- Subscription Summary -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold">Subscription</h2>
      <p class="text-zinc-600">Manage your subscription plan and benefits.</p>
    </div>

    <!-- Current Subscription Details -->
    <div class="rounded-lg bg-white p-6 shadow-sm mb-8">
      <h3 class="text-lg font-semibold mb-4">Current Plan</h3>
      <p class="text-xl font-semibold">{{ subscription.currentPlan }}</p>
      <p class="text-zinc-600">Renewal Date: {{ subscription.renewalDate }}</p>
      <p class="text-zinc-600">Price: ${{ subscription.price }}/month</p>
      <p
        :class="{
          'text-green-600': subscription.status === 'Active',
          'text-yellow-600': subscription.status === 'Pending',
        }"
      >
        Status: {{ subscription.status }}
      </p>
    </div>

    <!-- Available Plans -->
    <div class="rounded-lg bg-white p-6 shadow-sm">
      <h3 class="text-lg font-semibold mb-4">Change Plan</h3>
      <ul class="space-y-4">
        <li
          v-for="plan in availablePlans"
          :key="plan.name"
          class="flex justify-between rounded-lg bg-zinc-100 p-4"
        >
          <div>
            <p class="font-medium">{{ plan.name }} - ${{ plan.price }}/month</p>
            <ul class="text-sm text-zinc-600">
              <li v-for="feature in plan.features" :key="feature">
                - {{ feature }}
              </li>
            </ul>
          </div>
          <button
            @click="changePlan(plan.name)"
            class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Select
          </button>
        </li>
      </ul>
    </div>
  </BasePage>
</template>
