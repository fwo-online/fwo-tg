import {
  retrieveLaunchParams,
  isColorDark,
  isRGB,
  themeParams,
  useSignal,
} from '@telegram-apps/sdk-react';
import { Placeholder, AppRoot } from '@telegram-apps/telegram-ui';
import { useMemo } from 'react';

export function EnvUnsupported() {
  const bgColor = useSignal(themeParams.backgroundColor);
  const { tgWebAppPlatform } = retrieveLaunchParams();

  const [platform, isDark] = useMemo(() => {
    let platform = 'base';
    let isDark = false;
    try {
      platform = tgWebAppPlatform;
      isDark = bgColor && isRGB(bgColor) ? isColorDark(bgColor) : false;
    } catch {
      /* empty */
    }

    return [platform, isDark];
  }, [bgColor, tgWebAppPlatform]);

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(platform) ? 'ios' : 'base'}
    >
      <Placeholder
        header="Oops"
        description="You are using too old Telegram client to run this application"
      >
        <img
          alt="Telegram sticker"
          src="https://xelene.me/telegram.gif"
          style={{ display: 'block', width: '144px', height: '144px' }}
        />
      </Placeholder>
    </AppRoot>
  );
}
