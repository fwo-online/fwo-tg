import { Dynamic } from '@solidjs/web';
import { Show } from 'solid-js';
import { PopupOverlay } from '@/components/Popup/Overlay';
import { dialog, dialogState } from './dialog';

export function DialogHost() {
  return (
    <PopupOverlay open={dialogState() !== null} onClose={dialog.close}>
      <Show when={dialogState()}>
        {(state) => (
          <Dynamic
            component={state().component}
            {...state().props}
            close={state().close}
            cancel={state().cancel}
          />
        )}
      </Show>
    </PopupOverlay>
  );
}
