import { Navigate, Route, Routes } from 'react-router';
import { AppLayout } from '@/components/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { withBackButton } from '@/hocs/withBackButton';
import { withSettingsButton } from '@/hocs/withSettingsButton';
import { AgoraPage } from '@/modules/agora/pages/AgoraPage';
import { CharacterAttributesPage } from '@/modules/character/pages/CharacterAttributesPage';
import { CharacterCreatePage } from '@/modules/character/pages/CharacterCreatePage';
import { CharacterInventoryPage } from '@/modules/character/pages/CharacterInventoryPage';
import { CharacterMagicsPage } from '@/modules/character/pages/CharacterMagicsPage';
import { CharacterPage } from '@/modules/character/pages/CharacterPage';
import { CharacterSkillPage } from '@/modules/character/pages/CharacterSkillsPage';
import { ClanCreatePage } from '@/modules/clan/pages/ClanCreatePage';
import { ClanForgeListPage } from '@/modules/clan/pages/ClanForgeListPage';
import { ClanForgePage } from '@/modules/clan/pages/ClanForgePage';
import { ClanListPage } from '@/modules/clan/pages/ClanListPage';
import { ClanPage } from '@/modules/clan/pages/ClanPage';
import { ErrorPage } from '@/modules/error/pages/ErrorPage';
import { GamePage } from '@/modules/game/pages/GamePage';
import { LadderPage } from '@/modules/ladder/pages/LadderPage';
import { LobbyArenaPage } from '@/modules/lobby/pages/LobbyArenaPage';
import { LobbyPage } from '@/modules/lobby/pages/LobbyPage';
import { LobbyPracticePage } from '@/modules/lobby/pages/LobbyPracticePage';
import { LobbyTowerPage } from '@/modules/lobby/pages/LobbyTowerPage';
import { MarketCreatePage } from '@/modules/market/pages/MarketCreatePage';
import { MarketPage } from '@/modules/market/pages/MarketPage';
import { ServiceShopPage } from '@/modules/serviceShop/pages/ServiceShopPage';
import { SettingsPage } from '@/modules/settings/pages/SettingsPage';
import { TowerPage } from '@/modules/tower/pages/TowerPage';
import { ErrorConnectionPage } from './modules/error/pages/ErrorConnectionPage';
import { ForgeListPage } from './modules/forge/pages/ForgeListPage';
import { ForgePage } from './modules/forge/pages/ForgePage';
import { PassiveSkillsPage } from './modules/passiveSkills/pages/PassiveSkillsPage';

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
            <Route path="clan">
              <Route path="" Component={withBackButton(ClanPage)} />
              <Route path="list" Component={withBackButton(ClanListPage)} />
              <Route path="create" Component={withBackButton(ClanCreatePage)} />
              <Route path="forge">
                <Route path="" Component={withBackButton(ClanForgePage)} />
                <Route path=":wear" Component={withBackButton(ClanForgeListPage)} />
              </Route>
            </Route>
          </Route>
          <Route path="/lobby">
            <Route path="" element={<LobbyPage />} />
            <Route path="ladder" Component={withBackButton(LadderPage)} />
            <Route path="practice" Component={withBackButton(LobbyPracticePage)} />
            <Route path="arena" Component={withBackButton(LobbyArenaPage)} />
            <Route path="tower" Component={withBackButton(LobbyTowerPage)} />
          </Route>
          <Route path="/settings" Component={withBackButton(SettingsPage)} />
          <Route path="/agora">
            <Route path="" element={<AgoraPage />} />
            <Route path="market">
              <Route path="" Component={withBackButton(MarketPage)} />
              <Route path="create" Component={withBackButton(MarketCreatePage)} />
            </Route>
            <Route path="service" Component={withBackButton(ServiceShopPage)} />
            <Route path="forge">
              <Route path="" Component={withBackButton(ForgePage)} />
              <Route path=":wear" Component={withBackButton(ForgeListPage)} />
            </Route>
          </Route>
        </Route>
        <Route path="/game/:gameID" element={<GamePage />} />
        <Route path="/tower/:towerID" element={<TowerPage />} />
      </Route>
      <Route path="/connection-error" element={<ErrorConnectionPage />} />
      <Route path="/error" element={<ErrorPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
