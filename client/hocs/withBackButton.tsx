import { useNavigate } from '@solidjs/router';
import { backButton } from '@tma.js/sdk-react';
import { type Component, onSettled } from 'solid-js';

export function withBackButton(Component: Component) {
  return () => {
    const navigate = useNavigate();

    const back = () => navigate(-1);

    onSettled(() => {
      if (backButton.isSupported()) {
        backButton.show();
        backButton.onClick(back);

        return () => {
          backButton.hide();
          backButton.offClick(back);
        };
      }
    });

    return <Component />;
  };
}
