import { settingsButton } from '@tma.js/sdk-react';
import type { ComponentType } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export function withSettingsButton(Component: ComponentType) {
  // biome-ignore lint/correctness/useHookAtTopLevel: <explanation>
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
