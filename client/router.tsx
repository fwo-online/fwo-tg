import { createBrowserRouter, Navigate } from 'react-router';
import { AppLayout } from '@/components/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { withSettingsButton } from '@/hocs/withSettingsButton';
import agoraRoutes from '@/modules/agora/routes';
import { CharacterCreatePage } from '@/modules/character/pages/CharacterCreatePage';
import characterRoutes from '@/modules/character/routes';
import { ErrorPage } from '@/modules/error/pages/ErrorPage';
import { ForestPage } from '@/modules/forest/pages/ForestPage';
import { GamePage } from '@/modules/game/pages/GamePage';
import lobbyRoutes from '@/modules/lobby/routes';
import { SettingsPage } from '@/modules/settings/pages/SettingsPage';
import { TowerPage } from '@/modules/tower/pages/TowerPage';
import { ErrorConnectionPage } from './modules/error/pages/ErrorConnectionPage';

export const router = createBrowserRouter([
  {
    index: true,
    element: <Navigate to="/character" />,
  },
  {
    path: '/create',
    Component: CharacterCreatePage,
  },
  {
    Component: ProtectedRoute,
    middleware: ProtectedRoute.middleware,
    loader: ProtectedRoute.loader,
    HydrateFallback: ProtectedRoute.HydrateFallback,
    children: [
      {
        Component: withSettingsButton(AppLayout),
        children: [
          { path: '/character', children: characterRoutes },
          { path: '/lobby', children: lobbyRoutes },
          { path: '/settings', Component: SettingsPage },
          { path: '/agora', children: agoraRoutes },
        ],
      },
      {
        path: '/game/:gameID',
        Component: GamePage,
      },
      {
        path: '/tower/:towerID',
        Component: TowerPage,
      },
      {
        path: '/forest/:forestID',
        Component: ForestPage,
      },
    ],
  },
  {
    path: '/error',
    Component: ErrorPage,
  },
  {
    path: '/connection-error',
    Component: ErrorConnectionPage,
  },
  {
    path: '*',
    element: <Navigate to="/character" />,
  },
]);
