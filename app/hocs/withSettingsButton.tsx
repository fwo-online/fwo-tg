import { settingsButton } from '@telegram-apps/sdk-react';
import type { ComponentType } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export function withSettingsButton(Component: ComponentType) {
  const navigate = useNavigate();
  const toSettings = () => navigate('/settings');

  return () => {
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
    }, []);

    return <Component />;
  };
}
