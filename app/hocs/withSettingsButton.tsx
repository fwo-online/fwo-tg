import { settingsButton } from '@telegram-apps/sdk-react';
import type { ComponentType } from 'react';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';

export function withSettingsButton(Component: ComponentType) {
  return () => {
    const navigate = useNavigate();
    const settings = useCallback(() => navigate('/settings'), [navigate]);

    useEffect(() => {
      settingsButton.mount();
      settingsButton.show();
      settingsButton.onClick(settings);

      return () => {
        settingsButton.hide();
        settingsButton.offClick(settings);
      };
    }, [settings]);

    return <Component />;
  };
}
