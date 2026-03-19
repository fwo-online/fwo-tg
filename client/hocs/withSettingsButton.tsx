import { settingsButton } from '@tma.js/sdk-react';
import type { ComponentType } from 'react';
import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';

export function withSettingsButton(Component: ComponentType) {
  return function WithSettingsButton() {
    const navigate = useNavigate();

    const toSettings = useCallback(() => {
      navigate('/settings');
    }, [navigate]);

    useEffect(() => {
      if (settingsButton.isSupported()) {
        settingsButton.mount();
        settingsButton.show();
        settingsButton.onClick(toSettings);

        return () => {
          settingsButton.hide();
          settingsButton.offClick(toSettings);
        };
      }
    }, [toSettings]);

    return <Component />;
  };
}
