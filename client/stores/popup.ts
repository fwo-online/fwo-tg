import { createSignal, type JSX } from 'solid-js';

export type DialogResult<T> = { confirmed: true; value: T } | { confirmed: false };

export interface PopupProps<T> {
  close(value: T): void;
  cancel(): void;
}

type PopupComponent<T> = (props: PopupProps<T>) => JSX.Element;

type PopupState = {
  content: JSX.Element;
};

const [currentPopup, setCurrentPopup] = createSignal<PopupState | null>(null);

export const popup = {
  currentPopup,

  show<T>(render: (props: PopupProps<T>) => JSX.Element): Promise<DialogResult<T>> {
    return new Promise((resolve) => {
      const close = (value: T) => {
        setCurrentPopup(null);
        resolve({
          confirmed: true,
          value,
        });
      };

      const cancel = () => {
        setCurrentPopup(null);
        resolve({
          confirmed: false,
        });
      };

      setCurrentPopup({
        content: render({
          close,
          cancel,
        }),
      });
    });
  },
};
