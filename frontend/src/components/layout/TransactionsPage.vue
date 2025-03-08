<script setup lang="ts">
import BasePage from '../BasePage.vue';
import { ref } from 'vue';

// Mock transactions (replace with API call later)
const transactions = ref([
  {
    id: 1,
    type: 'Withdrawal',
    amount: 150,
    status: 'Completed',
    date: '2025-03-03',
  },
  {
    id: 2,
    type: 'Deposit',
    amount: 200,
    status: 'Pending',
    date: '2025-03-01',
  },
  {
    id: 3,
    type: 'Referral Bonus',
    amount: 50,
    status: 'Completed',
    date: '2025-02-28',
  },
]);

const filters = ref({ type: '', status: '' });

const filteredTransactions = () => {
  return transactions.value.filter((tx) => {
    return (
      (!filters.value.type || tx.type === filters.value.type) &&
      (!filters.value.status || tx.status === filters.value.status)
    );
  });
};
</script>

<template>
  <BasePage title="Transactions">
    <!-- Transactions Page Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold">Transactions</h2>
      <p class="text-zinc-600">View your transaction history.</p>
    </div>

    <!-- Filters -->
    <div class="mb-6 flex gap-4">
      <div>
        <label class="block text-sm font-medium text-zinc-700">Type</label>
        <select
          v-model="filters.type"
          class="mt-1 w-full rounded-md border-zinc-300 shadow-sm"
        >
          <option value="">All</option>
          <option value="Withdrawal">Withdrawal</option>
          <option value="Deposit">Deposit</option>
          <option value="Referral Bonus">Referral Bonus</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-zinc-700">Status</label>
        <select
          v-model="filters.status"
          class="mt-1 w-full rounded-md border-zinc-300 shadow-sm"
        >
          <option value="">All</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
    </div>

    <!-- Transactions List -->
    <div class="rounded-lg bg-white p-6 shadow-sm">
      <h3 class="text-lg font-semibold mb-4">Your Transactions</h3>
      <ul class="space-y-4" v-if="filteredTransactions().length">
        <li
          v-for="tx in filteredTransactions()"
          :key="tx.id"
          class="flex justify-between rounded-lg bg-zinc-100 p-4"
        >
          <div>
            <p class="font-medium">{{ tx.type }}</p>
            <p class="text-sm text-zinc-600">
              Amount: ${{ tx.amount }} | Date: {{ tx.date }}
            </p>
          </div>
          <span
            :class="
              tx.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'
            "
          >
            {{ tx.status }}
          </span>
        </li>
      </ul>
      <p v-else class="text-zinc-600">No transactions found.</p>
    </div>
  </BasePage>
</template>
