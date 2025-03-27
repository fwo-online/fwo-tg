import { Navigate, Route, Routes } from 'react-router';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/AppLayout';
import { withSettingsButton } from '@/hocs/withSettingsButton';
import { withBackButton } from '@/hocs/withBackButton';
import { CharacterAttributesPage } from '@/modules/character/pages/CharacterAttributesPage';
import { CharacterPage } from '@/modules/character/pages/CharacterPage';
import { CharacterCreatePage } from '@/modules/character/pages/CharacterCreatePage';
import { CharacterSkillPage } from '@/modules/character/pages/CharacterSkillsPage';
import { CharacterInventoryPage } from '@/modules/character/pages/CharacterInventoryPage';
import { SettingsPage } from '@/modules/settings/pages/SettingsPage';
import { CharacterMagicsPage } from '@/modules/character/pages/CharacterMagicsPage';
import { ErrorPage } from '@/modules/error/pages/ErrorPage';
import { LobbyPage } from '@/modules/lobby/pages/LobbyPage';
import { GamePage } from '@/modules/game/pages/GamePage';
import { ErrorConnectionPage } from './modules/error/pages/ErrorConnectionPage';
import { PassiveSkillsPage } from './modules/passiveSkills/pages/PassiveSkillsPage';
import { ForgePage } from './modules/forge/pages/ForgePage';
import { ForgeListPage } from './modules/forge/pages/ForgeListPage';
import { ClanListPage } from '@/modules/clan/pages/ClanListPage';
import { ClanCreatePage } from '@/modules/clan/pages/ClanCreatePage';
import { ClanPage } from '@/modules/clan/pages/ClanPage';

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
            <Route path="passiveSkills" Component={withBackButton(PassiveSkillsPage)} />
            <Route path="inventory" Component={withBackButton(CharacterInventoryPage)} />
          </Route>
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/settings" Component={withBackButton(SettingsPage)} />
          <Route path="/forge">
            <Route path="" Component={withBackButton(ForgePage)} />
            <Route path=":wear" Component={withBackButton(ForgeListPage)} />
          </Route>
          <Route path="/clan">
            <Route path="" Component={withBackButton(ClanPage)} />
            <Route path="list" Component={withBackButton(ClanListPage)} />
            <Route path="create" Component={withBackButton(ClanCreatePage)} />
          </Route>
        </Route>
        <Route path="/game/:gameID" element={<GamePage />} />
      </Route>
      <Route path="/connection-error" element={<ErrorConnectionPage />} />
      <Route path="/error" element={<ErrorPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
