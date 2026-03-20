import { backButton } from '@tma.js/sdk-react';
import type { ComponentType } from 'react';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';

export function withBackButton(Component: ComponentType) {
  function WithBackButton() {
    const navigate = useNavigate();

    const back = useCallback(() => navigate(-1), [navigate]);

    useEffect(() => {
      if (backButton.isSupported()) {
        backButton.show();
        backButton.onClick(back);

        return () => {
          backButton.hide();
          backButton.offClick(back);
        };
      }
    }, [back]);

    return <Component />;
  }

  return WithBackButton;
}
