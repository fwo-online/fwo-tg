import { ModalConfirmOverlay, ModalInfoOverlay } from '@/components/Modal';
import {
  createContext,
  type FC,
  type MouseEvent,
  type PropsWithChildren,
  type ReactNode,
  use,
  useEffect,
  useRef,
  useState,
} from 'react';

type ModalOptions = {
  message: ReactNode;
  type?: 'confirm' | 'info' | undefined;
  onConfirm?: () => void;
  onCancel?: () => void;
};

type ModalContextType = {
  showConfirmModal: (options: Omit<ModalOptions, 'type'>) => void;
  showInfoModal: (options: Omit<ModalOptions, 'type' | 'onConfirm'>) => void;
  closeModal: () => void;
};

export const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: FC<PropsWithChildren> = ({ children }) => {
  const confirm = useRef<HTMLDialogElement>(null);
  const info = useRef<HTMLDialogElement>(null);
  const [options, setOptions] = useState<ModalOptions | null>(null);

  const showConfirmModal = (options: Omit<ModalOptions, 'type'>) => {
    setOptions({ ...options, type: 'confirm' });
  };

  const showInfoModal = (options: Omit<ModalOptions, 'type' | 'onConfirm'>) => {
    setOptions({ ...options, type: 'info' });
  };

  const handleClose = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === info.current || e.target === confirm.current) {
      closeModal();
    }
  };

  const closeModal = () => {
    setOptions(null);
  };

  useEffect(() => {
    if (!options) {
      info.current?.close();
      confirm.current?.close();
      return;
    }

    if (options.type === 'confirm') {
      confirm.current?.showModal();
    }
    if (options.type === 'info') {
      info.current?.showModal();
    }
  }, [options]);

  return (
    <ModalContext value={{ showConfirmModal, showInfoModal, closeModal }}>
      <ModalConfirmOverlay
        ref={confirm}
        onClick={handleClose}
        onConfirm={options?.onConfirm}
        onCancel={closeModal}
      >
        {options?.message}
      </ModalConfirmOverlay>

      <ModalInfoOverlay ref={info} onClick={handleClose} onCancel={closeModal}>
        {options?.message}
      </ModalInfoOverlay>

      {children}
    </ModalContext>
  );
};

export const useModal = () => {
  const context = use(ModalContext);

  if (!context) {
    throw new Error('Modal must be within ModalContext');
  }

  return context;
};
