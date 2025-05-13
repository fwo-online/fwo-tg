import { useSocket } from '@/stores/socket';
import { openTelegramLink } from '@telegram-apps/sdk-react';
import { useCallback, useEffect, useState } from 'react';

export const useLobbyHelp = () => {
  const socket = useSocket();
  const [channelLinkVisible, setChannelLinkVisible] = useState(false);

  const showChannelLink = useCallback(() => {
    setChannelLinkVisible(true);
  }, []);

  const openChannelLink = useCallback(() => {
    if (openTelegramLink.isAvailable()) {
      openTelegramLink(import.meta.env.VITE_CHANNEL_URL || 'https://t.me/fwoarena');
    }
  }, []);

  useEffect(() => {
    socket.on('lobby:help', showChannelLink);

    return () => {
      socket.off('lobby:help', showChannelLink);
    };
  }, [socket, showChannelLink]);

  return {
    openChannelLink,
    channelLinkVisible,
  };
};
