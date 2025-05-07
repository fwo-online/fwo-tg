import type { FC, PropsWithChildren, ReactNode } from 'react';
import { type DialogProps, Drawer } from 'vaul';

import './Modal.css';

export const ModalComponent: FC<PropsWithChildren<DialogProps & { trigger: ReactNode }>> = ({
  trigger,
  children,
  ...dialogProps
}) => {
  return (
    <Drawer.Root repositionInputs={false} {...dialogProps}>
      <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Drawer.Content className="fixed -bottom-2 z-50 w-full">{children}</Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export const Modal = ModalComponent as typeof ModalComponent & {
  Handle: typeof Drawer.Handle;
};

Modal.Handle = Drawer.Handle;
