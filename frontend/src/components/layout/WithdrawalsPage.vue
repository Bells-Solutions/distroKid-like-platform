<script setup lang="ts">
import BasePage from '../BasePage.vue';
import { ref } from 'vue';
import LButton from '../button/LButton.vue';

// Mock withdrawal data (replace with API call later)
const withdrawalStats = ref({
  totalWithdrawn: 1450,
  pendingWithdrawals: 2,
  lastWithdrawal: '2025-03-01',
});

const withdrawalHistory = ref([
  {
    id: 1,
    amount: 500,
    method: 'PayPal',
    date: '2025-03-01',
    status: 'Completed',
  },
  { id: 2, amount: 300, method: 'Visa', date: '2025-02-25', status: 'Pending' },
  {
    id: 3,
    amount: 650,
    method: 'Bank Transfer',
    date: '2025-02-15',
    status: 'Completed',
  },
]);

const newWithdrawal = ref({
  amount: 0,
  method: 'PayPal',
});

const withdrawalMethods = ['PayPal', 'Visa', 'Bank Transfer'];

const submitWithdrawal = () => {
  if (newWithdrawal.value.amount > 0) {
    withdrawalHistory.value.unshift({
      id: Date.now(),
      amount: newWithdrawal.value.amount,
      method: newWithdrawal.value.method,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
    });

    withdrawalStats.value.pendingWithdrawals++;
    withdrawalStats.value.totalWithdrawn += newWithdrawal.value.amount;

    newWithdrawal.value.amount = 0;
    newWithdrawal.value.method = 'PayPal';

    alert('Withdrawal request submitted successfully!');
  } else {
    alert('Please enter a valid amount.');
  }
};
</script>

<template>
  <BasePage title="Withdrawals">
    <!-- Withdrawals Summary -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold">Withdrawals</h2>
      <p class="text-zinc-600">Track your withdrawal history and status.</p>
    </div>

    <!-- Withdrawal Statistics -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
      <div class="rounded-lg bg-white p-6 shadow-sm">
        <p class="text-sm text-zinc-500">Total Withdrawn ($)</p>
        <p class="text-2xl font-semibold">
          ${{ withdrawalStats.totalWithdrawn }}
        </p>
      </div>

      <div class="rounded-lg bg-white p-6 shadow-sm">
        <p class="text-sm text-zinc-500">Pending Withdrawals</p>
        <p class="text-2xl font-semibold">
          {{ withdrawalStats.pendingWithdrawals }}
        </p>
      </div>

      <div class="rounded-lg bg-white p-6 shadow-sm">
        <p class="text-sm text-zinc-500">Last Withdrawal</p>
        <p class="text-2xl font-semibold">
          {{ withdrawalStats.lastWithdrawal }}
        </p>
      </div>
    </div>

    <!-- Request Withdrawal -->
    <div class="rounded-lg bg-white p-6 shadow-sm mb-8">
      <h3 class="text-lg font-semibold mb-4">Request Withdrawal</h3>
      <form @submit.prevent="submitWithdrawal" class="space-y-4">
        <div>
          <label for="amount" class="block text-sm font-medium text-zinc-700"
            >Amount ($)</label
          >
          <input
            id="amount"
            type="number"
            v-model="newWithdrawal.amount"
            min="1"
            class="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label for="method" class="block text-sm font-medium text-zinc-700"
            >Method</label
          >
          <select
            id="method"
            v-model="newWithdrawal.method"
            class="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option
              v-for="method in withdrawalMethods"
              :key="method"
              :value="method"
            >
              {{ method }}
            </option>
          </select>
        </div>

        <LButton
          variant="primary"
          type="submit"
          class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Submit Withdrawal
        </LButton>
      </form>
    </div>

    <!-- Withdrawal History -->
    <div class="rounded-lg bg-white p-6 shadow-sm">
      <h3 class="text-lg font-semibold mb-4">Withdrawal History</h3>
      <ul class="space-y-3">
        <li
          v-for="item in withdrawalHistory"
          :key="item.id"
          class="flex justify-between rounded-lg bg-zinc-100 p-4"
        >
          <div>
            <p class="font-medium">${{ item.amount }} - {{ item.method }}</p>
            <p class="text-sm text-zinc-500">Date: {{ item.date }}</p>
          </div>
          <span
            :class="{
              'text-green-600': item.status === 'Completed',
              'text-yellow-600': item.status === 'Pending',
            }"
          >
            {{ item.status }}
          </span>
        </li>
      </ul>
    </div>
  </BasePage>
</template>
