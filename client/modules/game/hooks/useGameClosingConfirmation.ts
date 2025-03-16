import { closingBehavior } from '@telegram-apps/sdk-react';
import { useEffect } from 'react';

export const useGameClosingConfirmation = () => {
  useEffect(() => {
    if (closingBehavior.enableConfirmation.isAvailable()) {
      closingBehavior.enableConfirmation();
    }

    return () => {
      if (closingBehavior.disableConfirmation.isAvailable()) {
        closingBehavior.disableConfirmation();
      }
    };
  });
};
