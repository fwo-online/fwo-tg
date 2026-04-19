import type { RouteObject } from 'react-router';
import { withBackButton } from '@/hocs/withBackButton';
import { AgoraPage } from '@/modules/agora/pages/AgoraPage';
import { ForgeListPage } from '@/modules/forge/pages/ForgeListPage';
import { ForgePage } from '@/modules/forge/pages/ForgePage';
import { MarketCreatePage } from '@/modules/market/pages/MarketCreatePage';
import { MarketPage } from '@/modules/market/pages/MarketPage';
import { ServiceShopPage } from '@/modules/serviceShop/pages/ServiceShopPage';

export default [
  { path: '', Component: AgoraPage },
  {
    path: 'market',
    children: [
      { path: '', loader: MarketPage.loader, Component: withBackButton(MarketPage) },
      {
        path: 'create',
        Component: withBackButton(MarketCreatePage),
      },
    ],
  },
  { path: 'service', Component: withBackButton(ServiceShopPage) },
  {
    path: 'forge',
    children: [
      { path: '', Component: withBackButton(ForgePage) },
      { path: ':wear', loader: ForgeListPage.loader, Component: withBackButton(ForgeListPage) },
    ],
  },
] satisfies RouteObject[];
