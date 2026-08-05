import { hydrate, render } from '@solidjs/web';
import { retrieveLaunchParams } from '@tma.js/sdk-react';
import { createRoot } from 'react-dom/client';

import { EnvUnsupported } from './components/EnvUnsupported';
import { Root } from './components/Root';
import { init } from './init';

import './index.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container not found');
}

// const root = createRoot(container);
try {
  init(retrieveLaunchParams().startParam === 'debug' || import.meta.env.DEV);

  render(() => <Root />, container);
} catch {
  render(() => <EnvUnsupported />, container);
}
