<script setup lang="ts">
import BasePage from '../BasePage.vue';
import { ref } from 'vue';

// Mock support tickets (replace with API call later)
const supportTickets = ref([
  { id: 1, subject: 'Payment Issue', status: 'Open', date: '2025-03-01' },
  {
    id: 2,
    subject: 'Subscription Upgrade',
    status: 'Closed',
    date: '2025-02-15',
  },
]);

const newTicket = ref({ subject: '', message: '' });

const submitTicket = () => {
  if (!newTicket.value.subject || !newTicket.value.message) {
    alert('Please fill in all fields.');
    return;
  }

  supportTickets.value.unshift({
    id: Date.now(),
    subject: newTicket.value.subject,
    status: 'Open',
    date: new Date().toISOString().split('T')[0],
  });

  alert('Support ticket submitted successfully.');
  newTicket.value = { subject: '', message: '' };
};
</script>

<template>
  <BasePage title="Support">
    <!-- Support Page Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold">Support</h2>
      <p class="text-zinc-600">Need help? Contact us below.</p>
    </div>

    <!-- Submit New Support Ticket -->
    <div class="rounded-lg bg-white p-6 shadow-sm mb-8">
      <h3 class="text-lg font-semibold mb-4">Submit a Support Request</h3>
      <form @submit.prevent="submitTicket" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-zinc-700">Subject</label>
          <input
            v-model="newTicket.subject"
            type="text"
            class="mt-1 w-full rounded-md border-zinc-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter subject"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-zinc-700">Message</label>
          <textarea
            v-model="newTicket.message"
            rows="4"
            class="mt-1 w-full rounded-md border-zinc-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Describe your issue"
            required
          ></textarea>
        </div>
        <button
          type="submit"
          class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>

    <!-- Support Ticket History -->
    <div class="rounded-lg bg-white p-6 shadow-sm">
      <h3 class="text-lg font-semibold mb-4">Your Support Tickets</h3>
      <ul class="space-y-4" v-if="supportTickets.length">
        <li
          v-for="ticket in supportTickets"
          :key="ticket.id"
          class="flex justify-between rounded-lg bg-zinc-100 p-4"
        >
          <div>
            <p class="font-medium">{{ ticket.subject }}</p>
            <p class="text-sm text-zinc-600">Submitted on: {{ ticket.date }}</p>
          </div>
          <span
            :class="
              ticket.status === 'Open' ? 'text-green-600' : 'text-zinc-600'
            "
          >
            {{ ticket.status }}
          </span>
        </li>
      </ul>
      <p v-else class="text-zinc-600">No support tickets found.</p>
    </div>
  </BasePage>
</template>
