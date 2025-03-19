import {
  backButton,
  viewport,
  themeParams,
  miniApp,
  initData,
  setDebug,
  init as initSDK,
  closingBehavior,
} from '@telegram-apps/sdk-react';

/**
 * Initializes the application and configures its dependencies.
 */
export async function init(debug: boolean) {
  // Set @telegram-apps/sdk-react debug mode.
  setDebug(debug);

  // Initialize special event handlers for Telegram Desktop, Android, iOS, etc.
  // Also, configure the package.
  initSDK();

  // Check if all required components are supported.
  if (!backButton.isSupported() || !miniApp.isSupported()) {
    throw new Error('ERR_NOT_SUPPORTED');
  }

  // Mount all components used in the project.

  miniApp.mount().then(() => {
    // Define components-related CSS variables.
    miniApp.bindCssVars();
    themeParams.bindCssVars();
  });

  backButton.mount();
  initData.restore();

  if (closingBehavior.mount.isAvailable()) {
    closingBehavior.mount();
  }

  viewport.mount().then(() => {
    viewport.bindCssVars();
  });
}
