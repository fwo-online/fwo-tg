import { themeParams, useSignal } from '@telegram-apps/sdk-react';
import {
  cloneElement,
  type FC,
  isValidElement,
  type PropsWithChildren,
  type DialogHTMLAttributes,
  type Ref,
  useRef,
  type ReactElement,
} from 'react';
import classNames from 'classnames';
import './Modal.css';
import { Button } from '@/components/Button';

export type ModalOverlayProps = PropsWithChildren<
  DialogHTMLAttributes<HTMLDialogElement> & {
    ref?: Ref<HTMLDialogElement>;
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

export const ModalOverlay: FC<ModalOverlayProps> = ({ children, onClick, ref }) => {
  const isDark = useSignal(themeParams.isDark);

  return (
    <dialog
      ref={ref}
      className={classNames('nes-dialog is-rounded', {
        'is-dark': isDark,
      })}
      onClick={onClick}
    >
      {children}
    </dialog>
  );
};

export const ModalConfirmOverlay: FC<ModalConfirmProps> = ({
  onCancel,
  onConfirm,
  children,
  ...props
}) => {
  return (
    <ModalOverlay {...props}>
      <div className="flex flex-col p-4 gap-4">
        {children}
        <div className="flex gap-2">
          <Button className="flex-1" onClick={onCancel}>
            Отмена
          </Button>
          <Button className="flex-1 is-primary" onClick={onConfirm}>
            Ок
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
};

export const ModalInfoOverlay: FC<ModalInfoProps> = ({ onCancel, children, ...props }) => {
  return (
    <ModalOverlay {...props}>
      <div className="flex flex-col p-4 gap-4">
        {children}
        <div className="flex gap-2">
          <Button className="flex-1" onClick={onCancel}>
            Понятно
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
};

export const ModalComponent: FC<ModalProps> = ({ trigger, children }) => {
  const ref = useRef<HTMLDialogElement>(null);

  const handleOpen = () => {
    ref.current?.showModal();
  };

  const handleClose = () => {
    ref.current?.close();
  };

  const triggerElement = isValidElement(trigger)
    ? cloneElement(trigger, {
        onClick: handleOpen,
      })
    : trigger;

  return (
    <>
      {triggerElement}
      <ModalOverlay ref={ref} onClick={handleClose}>
        {children}
      </ModalOverlay>
    </>
  );
};

export const Modal = ModalComponent as typeof ModalComponent & {
  Overlay: typeof ModalOverlay;
};

Modal.Overlay = ModalOverlay;
