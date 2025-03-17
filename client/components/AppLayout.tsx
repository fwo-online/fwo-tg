import { Outlet, useLocation, useNavigate } from 'react-router';
import { Button } from './Button';
import cn from 'classnames';

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
      <div className="fixed gap-2 px-2 h-16 bottom-4 w-full flex">
        {tabs.map(({ path, text }) => (
          <Button
            className={cn('flex-1', {
              'is-primary': location.pathname.startsWith(path),
            })}
            key={path}
            onClick={() => navigate(path)}
          >
            {text}
          </Button>
        ))}
      </div>
    </>
  );
}
