import { useSocketListener } from '@/hooks/useSocketListener';
import { openTelegramLink } from '@telegram-apps/sdk-react';
import { useCallback, useState } from 'react';

export const useLobbyHelp = () => {
  const [channelLinkVisible, setChannelLinkVisible] = useState(false);

  const showChannelLink = useCallback(() => {
    setChannelLinkVisible(true);
  }, []);

  const openChannelLink = useCallback(() => {
    if (openTelegramLink.isAvailable()) {
      openTelegramLink(import.meta.env.VITE_CHANNEL_URL || 'https://t.me/fwoarena');
    }
  }, []);

  useSocketListener('lobby:help', showChannelLink);

  return {
    openChannelLink,
    channelLinkVisible,
  };
};
