import { themeParams, useSignal } from '@tma.js/sdk-solid';
import { createEffect, omit } from 'solid-js';

import './Popup.css';
import { type ComponentProps, Portal } from '@solidjs/web';

type PopupOverlayProps = ComponentProps<'dialog'> & {
  open: boolean;
  onClose?: () => void;
};

export function PopupOverlay(props: PopupOverlayProps) {
  const rest = omit(props, 'children', 'open', 'onClose', 'class');

  const isDark = useSignal(themeParams.isDark);

  let dialog!: HTMLDialogElement;

  createEffect(
    () => props.open,
    (open) => {
      if (open) {
        if (!dialog.open) {
          dialog.showModal();
        }
      } else if (dialog.open) {
        dialog.close();
      }
    },
  );

  const handleClick = (e: MouseEvent) => {
    if (e.target === dialog) {
      dialog.close();
    }
  };

  const handleClose = () => {
    props.onClose?.();
  };

  const container = document.getElementById('popup');

  if (!container) {
    throw new Error('Popup container not found');
  }

  return (
    <Portal mount={container}>
      <dialog
        {...rest}
        ref={dialog}
        class={[
          'nes-dialog is-rounded',
          props.class,
          {
            'is-dark': isDark(),
          },
        ]}
        onClick={handleClick}
        onClose={handleClose}
      >
        {props.children}
      </dialog>
    </Portal>
  );
}
