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
    text: 'Мир',
  },
  {
    path: '/agora',
    text: 'Рынок',
  },
];

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="h-full overflow-hidden flex flex-col flex-1">
      <div className="overflow-auto flex-1">
        <Outlet />
      </div>
      <div className="gap-2 px-2 h-16 w-full flex">
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
    </div>
  );
}
