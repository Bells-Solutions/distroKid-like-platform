<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue';
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline';
import LButton from '../button/LButton.vue';

type Props = {
  open?: boolean;
  title: string;
  description?: string;
  primaryAction: Function;
  secondaryAction?: Function;
  primaryButtonText: string;
  secondaryButtonText?: string;
  context?: 'default' | 'danger';
};

withDefaults(defineProps<Props>(), {
  open: false,
  context: 'default',
});

const emit = defineEmits(['update:open']);

const close = () => {
  emit('update:open', false);
};
</script>

<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" class="relative z-50" @close="close">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div
          class="fixed inset-0 bg-zinc-500 bg-opacity-75 transition-opacity"
        />
      </TransitionChild>

      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div
          class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
        >
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
            >
              <div class="sm:flex sm:items-start">
                <div
                  class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
                  v-if="context == 'danger'"
                >
                  <ExclamationTriangleIcon
                    class="h-6 w-6 text-red-600"
                    aria-hidden="true"
                  />
                </div>
                <div
                  :class="[
                    'mt-3 text-center sm:mt-0 sm:text-left',
                    { 'sm:ml-4': context != 'default' },
                  ]"
                >
                  <DialogTitle
                    as="h3"
                    class="text-base font-semibold leading-6 text-zinc-900"
                  >
                    {{ title }}
                  </DialogTitle>

                  <div class="mt-2" v-if="description">
                    <p class="text-sm text-zinc-500">
                      {{ description }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <span class="block sm:ml-3">
                  <LButton
                    @click="() => primaryAction"
                    variant="primary"
                    class="inline-flex w-full sm:w-auto"
                    :context="context"
                  >
                    {{ primaryButtonText }}
                  </LButton>
                </span>
                <LButton
                  @click="() => secondaryAction"
                  class="inline-flex w-full sm:w-auto"
                  v-if="secondaryAction && secondaryButtonText"
                >
                  {{ secondaryButtonText }}
                </LButton>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
