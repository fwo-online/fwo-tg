import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { createRoot } from 'react-dom/client';

import { EnvUnsupported } from './components/EnvUnsupported';
import { Root } from './components/Root';
import { init } from './init';

import './index.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);
try {
  await init(retrieveLaunchParams().startParam === 'debug' || import.meta.env.DEV);

  root.render(<Root />);
} catch {
  root.render(<EnvUnsupported />);
}
