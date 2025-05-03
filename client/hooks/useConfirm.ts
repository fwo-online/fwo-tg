import { popup } from '@telegram-apps/sdk-react';

type ConfirmProps = {
  title?: string;
  message: string;
  onConfirm: () => void;
};

export const useConfirm = () => {
  const confirm = async ({ title, message, onConfirm }: ConfirmProps) => {
    if (!popup.isSupported()) {
      return;
    }

    const id = await popup.show({
      title,
      message,
      buttons: [
        {
          id: 'close',
          type: 'close',
        },
        {
          id: 'ok',
          type: 'ok',
        },
      ],
    });

    if (id === 'ok') {
      onConfirm();
    }
  };

  return { confirm };
};
