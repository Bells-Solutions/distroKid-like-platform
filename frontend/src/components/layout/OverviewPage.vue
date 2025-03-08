<template>
  <div>
    <h2 class="text-3xl font-bold mb-8">Overview</h2>

    <!-- Stats Section -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div class="bg-white p-6 rounded-2xl shadow">
        <h3 class="text-xl font-semibold mb-2">Total Earnings</h3>
        <p class="text-3xl font-bold">${{ earnings }}</p>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow">
        <h3 class="text-xl font-semibold mb-2">Pending Withdrawals</h3>
        <p class="text-3xl font-bold">${{ pendingWithdrawals }}</p>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow">
        <h3 class="text-xl font-semibold mb-2">Referrals</h3>
        <p class="text-3xl font-bold">{{ referralCount }}</p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="flex space-x-4">
      <router-link
        to="/withdrawals"
        class="px-6 py-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600"
      >
        Request Withdrawal
      </router-link>
      <router-link
        to="/referrals"
        class="px-6 py-3 bg-green-500 text-white rounded-2xl hover:bg-green-600"
      >
        View Referrals
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Sample data (replace with API calls)
const earnings = ref(1250.5);
const pendingWithdrawals = ref(300.0);
const referralCount = ref(12);
</script>
