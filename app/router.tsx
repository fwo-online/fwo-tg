import { Navigate, Route, Routes } from 'react-router';
import { ProtectedRoute } from './components/ProtectedRoute';
import { withBackButton } from './hocs/withBackButton';
import { CharacterAttributesPage } from '@/modules/character/pages/CharacterAttributesPage';
import { CharacterPage } from '@/modules/character/pages/CharacterPage';
import { CharacterCreatePage } from '@/modules/character/pages/CharacterCreatePage';
import { CharacterMagics } from './pages/CharacterMagics/CharacterMagics';
import { AppLayout } from './components/AppLayout';
import { SettingsPage } from './pages/SettingsPage/SettingsPage';
import { LobbyPage } from './pages/LobbyPage/LobbyPage';
import { GamePage } from './pages/GamePage/GamePage';

export function Router() {
  return (
    <Routes>
      <Route index element={<CharacterCreatePage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/character">
            <Route path="" element={<CharacterPage />} />
            <Route path="attributes" Component={withBackButton(CharacterAttributesPage)} />
            <Route path="magics" Component={withBackButton(CharacterMagics)} />
          </Route>
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="/game/:gameID" element={<GamePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
