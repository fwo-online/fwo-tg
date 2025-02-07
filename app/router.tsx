import { Navigate, Route, Routes } from 'react-router';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/AppLayout';
import { withSettingsButton } from '@/hocs/withSettingsButton';
import { withBackButton } from '@/hocs/withBackButton';
import { CharacterAttributesPage } from '@/modules/character/pages/CharacterAttributesPage';
import { CharacterPage } from '@/modules/character/pages/CharacterPage';
import { CharacterCreatePage } from '@/modules/character/pages/CharacterCreatePage';
import { CharacterSkillPage } from '@/modules/character/pages/CharacterSkillsPage';
import { GamePage } from '@/modules/game/pages/GamePage';
import { ShopPage } from '@/modules/shop/pages/ShopPage';
import { ShopListPage } from '@/modules/shop/pages/ShopListPage';
import { CharacterInventoryPage } from '@/modules/character/pages/CharacterInventoryPage';
import { SettingsPage } from '@/modules/settings/pages/SettingsPage';
import { CharacterInventoryWearList } from '@/modules/character/components/CharacterInventoryWearList';
import { CharacterInventoryList } from '@/modules/character/components/CharacterInventoryList';
import { CharacterMagicsPage } from '@/modules/character/pages/CharacterMagicsPage';
import { ErrorPage } from '@/modules/error/pages/ErrorPage';
import { LobbyPage } from '@/modules/lobby/pages/LobbyPage';

export function Router() {
  return (
    <Routes>
      <Route index element={<CharacterCreatePage />} />
      <Route element={<ProtectedRoute />}>
        <Route Component={withSettingsButton(AppLayout)}>
          <Route path="/character">
            <Route path="" element={<CharacterPage />} />
            <Route path="attributes" Component={withBackButton(CharacterAttributesPage)} />
            <Route path="magics" Component={withBackButton(CharacterMagicsPage)} />
            <Route path="skills" Component={withBackButton(CharacterSkillPage)} />
            <Route path="inventory" Component={withBackButton(CharacterInventoryPage)}>
              <Route path="" Component={withBackButton(CharacterInventoryWearList)} />
              <Route path=":wear" Component={withBackButton(CharacterInventoryList)} />
            </Route>
          </Route>
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/settings" Component={withBackButton(SettingsPage)} />
          <Route path="/shop">
            <Route path="" Component={withBackButton(ShopPage)} />
            <Route path=":wear" Component={withBackButton(ShopListPage)} />
          </Route>
        </Route>
        <Route path="/game/:gameID" element={<GamePage />} />
      </Route>
      <Route path="/error" element={<ErrorPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
