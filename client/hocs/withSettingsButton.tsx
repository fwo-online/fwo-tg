import { useNavigate } from '@solidjs/router';
import { settingsButton } from '@tma.js/sdk-react';
import { type Component, onSettled } from 'solid-js';

export function withSettingsButton(Component: Component) {
  return () => {
    const navigate = useNavigate();
    const toSettings = () => navigate('/settings');

    onSettled(() => {
      if (settingsButton.isSupported()) {
        settingsButton.mount();
        settingsButton.show();
        settingsButton.onClick(toSettings);

        return () => {
          settingsButton.hide();
          settingsButton.offClick(toSettings);
        };
      }
    });

    return <Component />;
  };
}
