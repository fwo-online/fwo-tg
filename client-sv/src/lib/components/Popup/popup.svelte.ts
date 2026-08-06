import type { PopupOptions } from '$lib/constext/popup';

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

export const popup = {
  info,
  confirm,
  close,
};
