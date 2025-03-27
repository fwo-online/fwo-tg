import { themeParams, useSignal } from '@telegram-apps/sdk-react';
import {
  cloneElement,
  type FC,
  isValidElement,
  type PropsWithChildren,
  type DialogHTMLAttributes,
  useRef,
  type ReactElement,
  useImperativeHandle,
  type RefObject,
  type MouseEvent,
} from 'react';
import classNames from 'classnames';
import './Modal.css';

export type ModalHandle = {
  open: () => void;
  close: () => void;
};

export type ModalOverlayProps = PropsWithChildren<
  DialogHTMLAttributes<HTMLDialogElement> & {
    ref?: RefObject<ModalHandle | null>;
  }
>;

export type ModalProps = PropsWithChildren<{
  trigger: ReactElement<{ onClick?: () => void }>;
}>;

export type ModalConfirmProps = ModalOverlayProps & {
  onCancel?: () => void;
  onConfirm?: () => void;
};

export type ModalInfoProps = ModalOverlayProps & {
  onCancel?: () => void;
};

const useModalHandle = (
  ref: RefObject<ModalHandle | null> | undefined,
  dialogRef: RefObject<HTMLDialogElement | null>,
) => {
  return useImperativeHandle<ModalHandle | null, ModalHandle>(ref, () => ({
    open: () => dialogRef.current?.showModal(),
    close: () => dialogRef.current?.close(),
  }));
};

export const ModalOverlay: FC<ModalOverlayProps> = ({ children, onClick, ref, ...restProps }) => {
  const isDark = useSignal(themeParams.isDark);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useModalHandle(ref, dialogRef);

  const handleClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      dialogRef.current.close();
    } else {
      onClick?.(e);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={classNames('nes-dialog is-rounded', {
        'is-dark': isDark,
      })}
      onClick={handleClick}
      {...restProps}
    >
      {children}
    </dialog>
  );
};

export const ModalComponent: FC<ModalProps> = ({ trigger, children }) => {
  const modalRef = useRef<ModalHandle>(null);

  const triggerElement = isValidElement(trigger)
    ? cloneElement(trigger, {
        onClick: () => modalRef.current?.open(),
      })
    : trigger;

  return (
    <>
      {triggerElement}
      <ModalOverlay ref={modalRef} onClick={() => modalRef.current?.close()}>
        {children}
      </ModalOverlay>
    </>
  );
};

export const Modal = ModalComponent as typeof ModalComponent & {
  Overlay: typeof ModalOverlay;
};
