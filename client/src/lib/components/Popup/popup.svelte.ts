import type { Renderable } from '$lib/components/Renderable.svelte';

export type PopupOptions = {
  title?: string;
  message: Renderable;
  onConfirm?: (done: () => void) => void;
  onCancel?: () => void;
  type?: 'confirm' | 'info';
};

const createState = (): PopupOptions => ({
  message: '',
  type: undefined,
  title: undefined,
  onCancel: undefined,
  onConfirm: undefined,
});

export let dialog: HTMLDialogElement;
export const state = $state(createState());

export const show = (options: PopupOptions) => {
  Object.assign(state, createState(), options);
  dialog?.showModal();
};

export const close = () => {
  dialog?.close();
  Object.assign(state, createState());
};

export const setDialog = (value: HTMLDialogElement) => {
  dialog = value;
};

const info = (options: Omit<PopupOptions, 'type'>) => show({ type: 'info', ...options });

const confirm = (options: Omit<PopupOptions, 'type'>) => show({ type: 'confirm', ...options });

const confirmAsync = (
  options: Omit<PopupOptions, 'type' | 'onConfirm' | 'onCancel'>,
): Promise<boolean> => {
  return new Promise((resolve) => {
    popup.confirm({
      ...options,
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
};

export const popup = {
  info,
  confirm,
  confirmAsync,
  close,
};
