import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { createRoot } from 'react-dom/client';

import { EnvUnsupported } from './components/EnvUnsupported';
import { Root } from './components/Root';
import { init } from './init';

import './index.css';

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const root = createRoot(document.getElementById('root')!);

try {
  await init(retrieveLaunchParams().startParam === 'debug' || import.meta.env.DEV);

  root.render(<Root />);
} catch {
  root.render(<EnvUnsupported />);
}
