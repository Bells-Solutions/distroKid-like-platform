<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import { ChevronDownIcon, UserIcon } from '@heroicons/vue/20/solid';
import { useAuth0 } from '@auth0/auth0-vue';
// import { isDevMode } from "@/globalConfig";
import { useRouter } from 'vue-router';

const { user, logout } = useAuth0();
const router = useRouter();

const userNavigation: {
  name: string;
  action: () => void;
}[] = [
  { name: 'Settings', action: () => router.push({ name: 'account' }) },
  {
    name: 'Sign out',
    action: () =>
      logout({ logoutParams: { returnTo: window.location.origin } }),
  },
];

// if (isDevMode) {
//     userNavigation.push({ name: "Sandbox", action: () => router.push({ name: "sandbox" }) });
// }
</script>

<template>
  <Menu as="div" class="relative">
    <MenuButton class="-m-1.5 flex items-center p-1.5">
      <span class="sr-only">Open user menu</span>
      <img
        class="h-8 w-8 rounded-full bg-zinc-50"
        :src="user.picture"
        v-if="user?.picture"
        alt=""
      />
      <div
        class="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-300"
        v-else
      >
        <UserIcon class="h-6 w-6 text-zinc-600" />
      </div>
      <span class="hidden lg:flex lg:items-center">
        <span
          class="ml-4 text-sm font-semibold leading-6 text-zinc-900"
          aria-hidden="true"
          >{{ user?.name }}</span
        >
        <ChevronDownIcon
          class="ml-2 h-5 w-5 text-zinc-400"
          aria-hidden="true"
        />
      </span>
    </MenuButton>
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <MenuItems
        class="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-zinc-900/5 focus:outline-none"
      >
        <MenuItem
          v-for="item in userNavigation"
          :key="item.name"
          v-slot="{ active }"
        >
          <button
            :class="[
              active ? 'bg-zinc-50' : '',
              'block w-full cursor-pointer px-3 py-1 text-left text-sm leading-6 text-zinc-900 ',
            ]"
            @click="item.action"
          >
            {{ item.name }}
          </button>
        </MenuItem>
      </MenuItems>
    </transition>
  </Menu>
</template>
