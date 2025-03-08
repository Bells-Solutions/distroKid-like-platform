import { createRouter, createWebHistory } from 'vue-router';
import { authGuard } from '@auth0/auth0-vue';
import { nextTick } from 'vue';
import { appName } from '@/globalConfig';

declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
    requiresAuth?: boolean;
  }
}

const routes = [
  {
    path: '/',
    redirect: { name: 'dashboard' },
    beforeEnter: authGuard,
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/components/layout/DashboardLayout.vue'),
        meta: { title: 'Dashboard', requiresAuth: true },
      },
      {
        path: 'withdrawals',
        name: 'withdrawals',
        component: () => import('@/components/layout/WithdrawalsPage.vue'),
        meta: { title: 'Withdrawals', requiresAuth: true },
      },
      {
        path: 'referrals',
        name: 'referrals',
        component: () => import('@/components/layout/ReferralsPage.vue'),
        meta: { title: 'Referrals', requiresAuth: true },
      },
      {
        path: 'account',
        name: 'account',
        component: () => import('@/components/layout/AccountSettingsPage.vue'),
        meta: { title: 'Account Settings' },
      },
      {
        path: 'transactions',
        name: 'transactions',
        component: () => import('@/components/layout/TransactionsPage.vue'),
        meta: { title: 'Transactions' },
      },
      {
        path: 'stats',
        name: 'stats',
        component: () => import('@/components/layout/StatsPage.vue'),
        meta: { title: 'Statistics' },
      },
      {
        path: 'subscription',
        name: 'subscription',
        component: () => import('@/components/layout/SubscriptionPage.vue'),
        meta: { title: 'Subscription' },
      },
      {
        path: 'support',
        name: 'support',
        component: () => import('@/components/layout/SupportPage.vue'),
        meta: { title: 'Priority Support', requiresAuth: true },
      },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  // @ts-expect-error - to, from, and savedPosition are not available in the test environment
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
  routes,
});

// @ts-expect-error - nextTick is not available in the test environment
router.afterEach((to, from, failure) => {
  if (failure) return;

  nextTick(() => {
    document.title = to.meta.title ? `${to.meta.title} - ${appName}` : appName;
  });
});
