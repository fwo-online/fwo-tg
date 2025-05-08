import { Button } from '@/components/Button';
import { type PopupHandle, PopupOverlay } from '@/components/Popup';
import {
  createContext,
  type FC,
  type PropsWithChildren,
  type ReactNode,
  useCallback,
  useDeferredValue,
  useRef,
  useState,
} from 'react';

type PopupOptions = {
  title?: string;
  message: ReactNode;
  onConfirm?: (done: () => void) => void;
  onCancel?: () => void;
  type?: 'confirm' | 'info';
};

type PopupContextType = {
  info: (options: Omit<PopupOptions, 'type'>) => void;
  confirm: (options: Omit<PopupOptions, 'type'>) => void;
  show: (options: PopupOptions) => void;
  close: () => void;
  visible: boolean;
};

export const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const PopupProvider: FC<PropsWithChildren> = ({ children }) => {
  const popupRef = useRef<PopupHandle>(null);
  const [popupState, setPopupState] = useState<{
    type: 'confirm' | 'info';
    options: PopupOptions;
  } | null>(null);
  const visible = useDeferredValue(!!popupState?.type, false);

  const show = (options: PopupOptions) => {
    setPopupState({ type: options.type ?? 'info', options });
    popupRef.current?.open();
  };

  const info = (options: Omit<PopupOptions, 'type'>) => show({ ...options, type: 'info' });
  const confirm = (options: Omit<PopupOptions, 'type'>) => show({ ...options, type: 'confirm' });

  const closePopup = useCallback(() => {
    popupRef.current?.close();
    setPopupState(null);
  }, []);

  const handleConfirm = async () => {
    if (popupState?.options.onConfirm) {
      closePopup();
      await popupState?.options.onConfirm(closePopup);
    } else {
      closePopup();
    }
  };

  return (
    <PopupContext.Provider value={{ show, close, info, confirm, visible }}>
      {children}

      <PopupOverlay ref={popupRef} onClose={closePopup}>
        <div className="flex flex-col p-4 gap-4">
          {popupState?.options.title ? (
            <span className="font-semibold">{popupState.options.title}</span>
          ) : null}
          {popupState?.options.message}
          {popupState?.type === 'confirm' ? (
            <div className="flex gap-2">
              <Button className="flex-1" onClick={closePopup}>
                Отмена
              </Button>
              <Button className="flex-1 is-primary" onClick={handleConfirm}>
                Ок
              </Button>
            </div>
          ) : null}
          {popupState?.type === 'info' ? (
            <div className="flex gap-2">
              <Button className="flex-1 is-primary" onClick={handleConfirm}>
                Ок
              </Button>
            </div>
          ) : null}
        </div>
      </PopupOverlay>
    </PopupContext.Provider>
  );
};
