import { type Component, createSignal } from 'solid-js';

export interface DialogProps<T = void> {
  close(value: T): void;
  cancel(): void;
}

export type DialogResult<T> =
  | {
      confirmed: true;
      value: T;
    }
  | {
      confirmed: false;
    };

export type DialogComponent<P = {}, T = void> = Component<P & DialogProps<T>>;

export interface DialogState {
  component: Component<any>;
  props: Record<string, unknown>;
  close: (value: unknown) => void;
  cancel: () => void;
}

const [dialogState, setDialogState] = createSignal<DialogState | null>(null);

function close() {
  dialogState()?.cancel();
}

async function show<P extends object, T>(
  component: DialogComponent<P, T>,
  props: P,
): Promise<DialogResult<T>> {
  return new Promise((resolve) => {
    const finish = (result: DialogResult<T>) => {
      setDialogState(null);
      resolve(result);
    };

    setDialogState({
      component,

      props,

      close(value) {
        finish({
          confirmed: true,
          value: value as T,
        });
      },

      cancel() {
        finish({
          confirmed: false,
        });
      },
    });
  });
}

export const dialog = {
  show,
  close,
};

export { dialogState };
