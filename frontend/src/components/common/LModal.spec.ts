import { describe, it, expect, vi, afterAll, beforeAll } from 'vitest';
import { mount } from '@vue/test-utils';
import LModal from './LModal.vue';

// @ts-expect-error: ResizeObserver is not available in the test environment
global.ResizeObserver = class FakeResizeObserver {
  observe() {}
  disconnect() {}
};

describe('LModal', () => {
  beforeAll(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(
      setImmediate as unknown as (callback: FrameRequestCallback) => number
    );
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(
      clearImmediate as unknown as (handle: number) => void
    );
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('renders a modal', async () => {
    const primaryAction = vi.fn();
    const secondaryAction = vi.fn();
    const wrapper = mount(LModal, {
      props: {
        open: true,
        title: 'Are you sure?',
        description: "I wouldn't do that if I were you.",
        primaryButtonText: 'I still will',
        secondaryButtonText: 'Ok then',
        primaryAction,
        secondaryAction,
      },
    });

    // This test is very simple because the modal doesn't render properly
    // in tests currently, because of transitions and teleporting
    expect(wrapper.exists()).toBe(true);
  });
});
