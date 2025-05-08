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
import './Popup.css';
import { createPortal } from 'react-dom';

export type PopupHandle = {
  open: () => void;
  close: () => void;
};

export type PopupOverlayProps = PropsWithChildren<
  DialogHTMLAttributes<HTMLDialogElement> & {
    ref?: RefObject<PopupHandle | null>;
  }
>;

export type PopupProps = PropsWithChildren<{
  trigger: ReactElement<{ onClick?: () => void }>;
}>;

export type PopupConfirmProps = PopupOverlayProps & {
  onCancel?: () => void;
  onConfirm?: () => void;
};

export type PopupInfoProps = PopupOverlayProps & {
  onCancel?: () => void;
};

const usePopupHandle = (
  ref: RefObject<PopupHandle | null> | undefined,
  dialogRef: RefObject<HTMLDialogElement | null>,
) => {
  return useImperativeHandle<PopupHandle | null, PopupHandle>(ref, () => ({
    open: () => dialogRef.current?.showModal(),
    close: () => dialogRef.current?.close(),
  }));
};

export const PopupOverlay: FC<PopupOverlayProps> = ({ children, onClick, ref, ...restProps }) => {
  const isDark = useSignal(themeParams.isDark);
  const dialogRef = useRef<HTMLDialogElement>(null);

  usePopupHandle(ref, dialogRef);

  const handleClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      dialogRef.current.close();
    } else {
      onClick?.(e);
    }
  };

  return createPortal(
    <dialog
      ref={dialogRef}
      className={classNames('nes-dialog is-rounded', {
        'is-dark': isDark,
      })}
      onClick={handleClick}
      {...restProps}
    >
      {children}
    </dialog>,
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    document.getElementById('popup')!,
  );
};

export const PopupComponent: FC<PopupProps> = ({ trigger, children }) => {
  const popupRef = useRef<PopupHandle>(null);

  const triggerElement = isValidElement(trigger)
    ? cloneElement(trigger, {
        onClick: () => popupRef.current?.open(),
      })
    : trigger;

  return (
    <>
      {triggerElement}
      <PopupOverlay ref={popupRef} onClick={() => popupRef.current?.close()}>
        {children}
      </PopupOverlay>
    </>
  );
};

export const Popup = PopupComponent as typeof PopupComponent & {
  Overlay: typeof PopupOverlay;
};
