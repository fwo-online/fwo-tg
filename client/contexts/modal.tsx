import { Button } from '@/components/Button';
import type { ModalHandle } from '@/components/Modal';
import { ModalOverlay } from '@/components/Modal/Modal';
import {
  createContext,
  type FC,
  type PropsWithChildren,
  type ReactNode,
  use,
  useCallback,
  useDeferredValue,
  useRef,
  useState,
} from 'react';

type ModalOptions = {
  message: ReactNode;
  onConfirm?: (done: () => void) => void;
  onCancel?: () => void;
  type?: 'confirm' | 'info';
};

type ModalContextType = {
  info: (options: Omit<ModalOptions, 'type'>) => void;
  confirm: (options: Omit<ModalOptions, 'type'>) => void;
  show: (options: ModalOptions) => void;
  close: () => void;
  visible: boolean;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: FC<PropsWithChildren> = ({ children }) => {
  const modalRef = useRef<ModalHandle>(null);
  const [modalState, setModalState] = useState<{
    type: 'confirm' | 'info';
    options: ModalOptions;
  } | null>(null);
  const visible = useDeferredValue(!!modalState?.type, false);

  const show = (options: ModalOptions) => {
    setModalState({ type: options.type ?? 'info', options });
    modalRef.current?.open();
  };

  const info = (options: Omit<ModalOptions, 'type'>) => show({ ...options, type: 'info' });
  const confirm = (options: Omit<ModalOptions, 'type'>) => show({ ...options, type: 'confirm' });

  const closeModal = useCallback(() => {
    modalRef.current?.close();
    setModalState(null);
  }, []);

  const handleConfirm = async () => {
    if (modalState?.options.onConfirm) {
      await modalState?.options.onConfirm(closeModal);
    } else {
      closeModal();
    }
  };

  return (
    <ModalContext.Provider value={{ show, close, info, confirm, visible }}>
      {children}

      <ModalOverlay ref={modalRef} onClose={closeModal}>
        <div className="flex flex-col p-4 gap-4">
          {modalState?.options.message}
          {modalState?.type === 'confirm' ? (
            <div className="flex gap-2">
              <Button className="flex-1" onClick={closeModal}>
                Отмена
              </Button>
              <Button className="flex-1 is-primary" onClick={handleConfirm}>
                Ок
              </Button>
            </div>
          ) : null}
          {modalState?.type === 'info' ? (
            <div className="flex gap-2">
              <Button className="flex-1 is-primary" onClick={handleConfirm}>
                Ок
              </Button>
            </div>
          ) : null}
        </div>
      </ModalOverlay>
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = use(ModalContext);

  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }

  return context;
};
