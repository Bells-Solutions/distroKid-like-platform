<script setup lang="ts">
import BasePage from '../BasePage.vue';
import { ref } from 'vue';
import LBadge from '../common/LBadge.vue';
import LButton from '../button/LButton.vue';

// Mock referral data (replace with API call later)
const referralStats = ref({
  totalReferrals: 25,
  successfulReferrals: 18,
  earnedRevenue: 540,
});

const referralHistory = ref([
  { id: 1, name: 'Alice Johnson', date: '2025-02-20', status: 'Successful' },
  { id: 2, name: 'Bob Smith', date: '2025-02-18', status: 'Pending' },
  { id: 3, name: 'Charlie Davis', date: '2025-02-10', status: 'Successful' },
  { id: 4, name: 'Johan Bell', date: '2025-02-6', status: 'Failed' },
]);

const getReferralStatus = (status: string) => {
  if (status === 'Successful') {
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

const referralLink = ref('https://yourapp.com/referral?code=ABCD1234');

const copyReferralLink = async () => {
  try {
    await navigator.clipboard.writeText(referralLink.value);
    alert('Referral link copied to clipboard!');
  } catch (error) {
    console.log('Failed to copy referral link.', error);
  }
};
</script>

<template>
  <BasePage title="Referrals">
    <!-- Referrals Summary -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold">Referrals</h2>
      <p class="text-zinc-600">Track your referral statistics and history.</p>
    </div>

    <!-- Referral Statistics -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
      <div class="rounded-lg bg-white p-6 shadow-sm">
        <p class="text-sm text-zinc-500">Total Referrals</p>
        <p class="text-2xl font-semibold">{{ referralStats.totalReferrals }}</p>
      </div>

      <div class="rounded-lg bg-white p-6 shadow-sm">
        <p class="text-sm text-zinc-500">Successful Referrals</p>
        <p class="text-2xl font-semibold">
          {{ referralStats.successfulReferrals }}
        </p>
      </div>

      <div class="rounded-lg bg-white p-6 shadow-sm">
        <p class="text-sm text-zinc-500">Earned Revenue ($)</p>
        <p class="text-2xl font-semibold">${{ referralStats.earnedRevenue }}</p>
      </div>
    </div>

    <!-- Share Referral Link -->
    <div class="rounded-lg bg-white p-6 shadow-sm mb-8">
      <h3 class="text-lg font-semibold mb-4">Share Your Referral Link</h3>
      <div class="flex items-center gap-4">
        <input
          type="text"
          :value="referralLink"
          readonly
          class="flex-1 rounded-md border-zinc-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <LButton
          @click="copyReferralLink"
          class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Copy Link
        </LButton>
      </div>
    </div>

    <!-- Referral History -->
    <div class="rounded-lg bg-white p-6 shadow-sm">
      <h3 class="text-lg font-semibold mb-4">Referral History</h3>
      <ul class="space-y-3">
        <li
          v-for="item in referralHistory"
          :key="item.id"
          class="flex justify-between rounded-lg bg-zinc-100 p-4"
        >
          <div>
            <p class="font-medium">{{ item.name }}</p>
            <p class="text-sm text-zinc-500">Date: {{ item.date }}</p>
          </div>
          <LBadge
            :variant="getReferralStatus(item.status)"
            type="language"
            withIcon
          >
            {{ item.status }}
          </LBadge>
        </li>
      </ul>
    </div>
  </BasePage>
</template>
