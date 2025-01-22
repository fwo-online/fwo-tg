import { Navigate, Route, Routes } from 'react-router';
import { ProtectedRoute } from './components/ProtectedRoute';
import { withBackButton } from './hocs/withBackButton';
import { CharacterAttributesPage } from '@/modules/character/pages/CharacterAttributesPage';
import { CharacterPage } from '@/modules/character/pages/CharacterPage';
import { CharacterCreatePage } from '@/modules/character/pages/CharacterCreatePage';
import { CharacterMagics } from './pages/CharacterMagics/CharacterMagics';
import { CharacterSkillPage } from '@/modules/character/pages/CharacterSkillsPage';
import { AppLayout } from './components/AppLayout';
import { SettingsPage } from './pages/SettingsPage/SettingsPage';
import { LobbyPage } from './pages/LobbyPage/LobbyPage';
import { GamePage } from './pages/GamePage/GamePage';
import { ShopPage } from '@/modules/shop/pages/ShopPage';
import { ShopTypesList } from './modules/shop/components/ShopTypesList';
import { ShopListPage } from '@/modules/shop/pages/ShopListPage';

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
            <Route path="skills" Component={withBackButton(CharacterSkillPage)} />
          </Route>
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/shop" element={<ShopPage />}>
            <Route path="" Component={withBackButton(ShopTypesList)} />
            <Route path=":wear" Component={withBackButton(ShopListPage)} />
            <Route path=":wear/:id" />
          </Route>
        </Route>
        <Route path="/game/:gameID" element={<GamePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
