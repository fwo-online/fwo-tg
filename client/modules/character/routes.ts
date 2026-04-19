import type { RouteObject } from 'react-router';
import { withBackButton } from '@/hocs/withBackButton';
import { CharacterAttributesPage } from '@/modules/character/pages/CharacterAttributesPage';
import { CharacterInventoryPage } from '@/modules/character/pages/CharacterInventoryPage';
import { CharacterMagicsPage } from '@/modules/character/pages/CharacterMagicsPage';
import { CharacterPage } from '@/modules/character/pages/CharacterPage';
import { CharacterSkillPage } from '@/modules/character/pages/CharacterSkillsPage';
import { ClanCreatePage } from '@/modules/clan/pages/ClanCreatePage';
import { ClanForgeListPage } from '@/modules/clan/pages/ClanForgeListPage';
import { ClanForgePage } from '@/modules/clan/pages/ClanForgePage';
import { ClanListPage } from '@/modules/clan/pages/ClanListPage';
import { ClanPage } from '@/modules/clan/pages/ClanPage';
import { PassiveSkillsPage } from '@/modules/passiveSkills/pages/PassiveSkillsPage';

export default [
  { path: '', Component: CharacterPage },
  { path: 'attributes', Component: withBackButton(CharacterAttributesPage) },
  {
    path: 'magics',
    loader: CharacterMagicsPage.loader,
    Component: withBackButton(CharacterMagicsPage),
  },
  {
    path: 'skills',
    loader: CharacterSkillPage.loader,
    Component: withBackButton(CharacterSkillPage),
  },
  {
    path: 'passive-skills',
    loader: PassiveSkillsPage.loader,
    handle: PassiveSkillsPage.handle,
    ErrorBoundary: PassiveSkillsPage.ErrorBoundary,
    Component: withBackButton(PassiveSkillsPage),
  },
  { path: 'inventory', Component: withBackButton(CharacterInventoryPage) },
  {
    path: 'clan',
    children: [
      { path: '', loader: ClanPage.loader, Component: withBackButton(ClanPage) },
      { path: 'list', loader: ClanListPage.loader, Component: withBackButton(ClanListPage) },
      { path: 'create', Component: withBackButton(ClanCreatePage) },
      {
        path: 'forge',
        children: [
          { path: '', Component: withBackButton(ClanForgePage) },
          {
            path: ':wear',
            loader: ClanForgeListPage.loader,
            Component: withBackButton(ClanForgeListPage),
          },
        ],
      },
    ],
  },
] satisfies RouteObject[];
