import { getClans } from '@/api/clan';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ClanList } from '@/modules/clan/components/ClanList';
import { Suspense, type FC } from 'react';
import { useNavigate } from 'react-router';
import { suspend } from 'suspend-react';

const ClanListLoader = () => {
  const clans = suspend(() => getClans(), []);

  return <ClanList clans={clans} />;
};

export const ClanListPage: FC = () => {
  const navigate = useNavigate();

  return (
    <Card header="Кланы" className="m-4">
      <Button onClick={() => navigate('/clan/create')}>Создать клан</Button>
      <Suspense fallback={'test'}>
        <ClanListLoader />
      </Suspense>
    </Card>
  );
};
