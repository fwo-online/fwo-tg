import type { FC, PropsWithChildren, ReactNode } from 'react';
import { Drawer } from 'vaul';

export const Modal: FC<PropsWithChildren<{ trigger: ReactNode }>> = ({ trigger, children }) => {
  return (
    <Drawer.Root repositionInputs={false}>
      <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Drawer.Content
          className="fixed bottom-0 z-50 w-full"
          style={{ fontFamily: '"Pixeloid", sans-serif' }}
        >
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
