import type { FC, PropsWithChildren, ReactElement } from 'react';
import { Drawer, type DrawerRootProps } from '@base-ui/react';

import styles from './Modal.module.css';

export const Modal: FC<PropsWithChildren<DrawerRootProps & { trigger: ReactElement }>> = ({
  trigger,
  children,
  ...dialogProps
}) => {
  return (
    <Drawer.Root swipeDirection="down" {...dialogProps}>
      <Drawer.Trigger className={styles.button} render={trigger}></Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop className={styles.backdrop} />
        <Drawer.Viewport className={styles.viewport}>
          <Drawer.Popup className={styles.popup}>
            <Drawer.Content className={styles.content}>{children}</Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
