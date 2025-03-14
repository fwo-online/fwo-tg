import { Tabbar } from '@telegram-apps/telegram-ui';
import { Outlet, useLocation, useNavigate } from 'react-router';

const tabs = [
  {
    path: '/character',
    text: 'Персонаж',
  },
  {
    path: '/lobby',
    text: 'Лобби',
  },
  {
    path: '/shop',
    text: 'Магазин',
  },
];

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <Outlet />
      <Tabbar style={{ height: '64px' }}>
        {tabs.map(({ path, icon, text }) => (
          <Tabbar.Item
            key={path}
            text={text}
            selected={location.pathname.startsWith(path)}
            onClick={() => navigate(path)}
          />
        ))}
      </Tabbar>
    </>
  );
}
