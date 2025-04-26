import { popup } from '@telegram-apps/sdk-react';

export const useConfirm = () => {
  const confirm = async (message: string, onConfirm: () => void) => {
    if (!popup.isSupported()) {
      return;
    }

    const id = await popup.open({
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
