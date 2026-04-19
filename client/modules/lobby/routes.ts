import type { RouteObject } from 'react-router';
import { withBackButton } from '@/hocs/withBackButton';
import { LadderPage } from '@/modules/ladder/pages/LadderPage';
import { LobbyArenaPage } from '@/modules/lobby/pages/LobbyArenaPage';
import { LobbyForestPage } from '@/modules/lobby/pages/LobbyForestPage';
import { LobbyPage } from '@/modules/lobby/pages/LobbyPage';
import { LobbyPracticePage } from '@/modules/lobby/pages/LobbyPracticePage';
import { LobbyTowerPage } from '@/modules/lobby/pages/LobbyTowerPage';

export default [
  { path: '', Component: LobbyPage },
  { path: 'ladder', loader: LadderPage.loader, Component: withBackButton(LadderPage) },
  {
    path: 'practice',
    Component: withBackButton(LobbyPracticePage),
  },
  { path: 'arena', Component: withBackButton(LobbyArenaPage) },
  { path: 'tower', Component: withBackButton(LobbyTowerPage) },
  { path: 'forest', Component: withBackButton(LobbyForestPage) },
] satisfies RouteObject[];
