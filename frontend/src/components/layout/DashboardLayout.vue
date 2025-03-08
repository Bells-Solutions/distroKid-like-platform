<script setup lang="ts">
import BasePage from '../BasePage.vue';
import { ref } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import LBadge from '../common/LBadge.vue';
import LCard from '../common/LCard.vue';
import LButton from '../button/LButton.vue';

const { user } = useAuth0();

// Mock user data (replace with API call later)
const earnings = ref({
  total: 1250,
  pending: 150,
  available: 1100,
});
const subscription = ref('Paid ($30/month)');

const recentTransactions = ref([
  { id: 1, type: 'Withdrawal', amount: 200, status: 'Completed' },
  { id: 2, type: 'Referral Bonus', amount: 50, status: 'Pending' },
  { id: 3, type: 'Subscription Payment', amount: 30, status: 'Completed' },
  { id: 4, type: 'Withdrawal', amount: 100, status: 'Failed' },
]);

const getReferralStatus = (status: string) => {
  if (status === 'Completed') {
    return 'success';
  }
  if (status === 'Pending') {
    return 'warning';
  }
  if (status === 'Failed') {
    return 'error';
  }
  return 'default';
};
</script>

<template>
  <BasePage title="Dashboard">
    <template #actions>
      <div class="flex gap-2">
        <div class="flex gap-1">
          <LButton
            type="button"
            data-test="revert-changes-button"
            variant="secondary"
            title=" View Referrals"
            @click="$router.push('/referrals')"
            class="cursor-pointer"
          >
            View referrals
          </LButton>
          <LButton
            type="button"
            data-test="save-button"
            variant="primary"
            @click="$router.push('/withdrawals')"
          >
            Request Withdrawal
          </LButton>
        </div>
      </div>
    </template>

    <!-- User Greeting -->
    <LCard class="mb-6">
      <h2 class="text-2xl font-bold">Welcome back, {{ user?.name }} 👋</h2>
      <p class="text-zinc-600">Here’s an overview of your account.</p>
    </LCard>

    <!-- Earnings Summary -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-4 mb-8">
      <LCard>
        <p class="text-sm text-zinc-500">Total Earnings</p>
        <p class="text-2xl font-semibold">${{ earnings.total }}</p>
      </LCard>
      <LCard class="rounded-lg bg-white shadow-sm">
        <p class="text-sm text-zinc-500">Pending Withdrawals</p>
        <p class="text-2xl font-semibold">${{ earnings.pending }}</p>
      </LCard>
      <LCard class="rounded-lg bg-white shadow-sm">
        <p class="text-sm text-zinc-500">Available Balance</p>
        <p class="text-2xl font-semibold">${{ earnings.available }}</p>
      </LCard>
      <LCard class="rounded-lg bg-white shadow-sm">
        <p class="text-sm text-zinc-500">Subscription</p>
        <p class="text-2xl font-semibold">{{ subscription }}</p>
      </LCard>
    </div>

    <!-- Quick Actions -->
    <!-- <div class="flex gap-4 mb-8">
      <RouterLink
        to="/withdrawals"
        class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Request Withdrawal
      </RouterLink>
      <RouterLink
        to="/referrals"
        class="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      >
        View Referrals
      </RouterLink>
    </div> -->

    <!-- Recent Transactions -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4">Recent Transactions</h3>
      <ul class="space-y-3">
        <li
          v-for="transaction in recentTransactions"
          :key="transaction.id"
          class="flex justify-between rounded-lg bg-white p-4 shadow-sm"
        >
          <span>{{ transaction.type }}</span>
          <span>${{ transaction.amount }}</span>
          <LBadge
            :variant="getReferralStatus(transaction.status)"
            type="language"
          >
            {{ transaction.status }}
          </LBadge>
        </li>
      </ul>
    </div>

    <!-- Subscription Status -->
    <div class="rounded-lg bg-white p-4 shadow-sm">
      <h3 class="text-lg font-semibold">Subscription</h3>
      <p class="text-zinc-600">Current Plan: {{ subscription }}</p>
    </div>
  </BasePage>
</template>
