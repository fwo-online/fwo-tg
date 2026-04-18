import { createContext } from 'svelte';
import type { Renderable } from '$lib/components/Renderable.svelte';

export type PopupOptions = {
  title?: string;
  message: Renderable;
  onConfirm?: (done: () => void) => void;
  onCancel?: () => void;
  type?: 'confirm' | 'info';
};

export type PopupContext = {
  info: (options: Omit<PopupOptions, 'type'>) => void;
  confirm: (options: Omit<PopupOptions, 'type'>) => void;
  show: (options: PopupOptions) => void;
  close: () => void;
};

export const [getPopupContext, setPopupContext] = createContext<() => PopupContext>();
