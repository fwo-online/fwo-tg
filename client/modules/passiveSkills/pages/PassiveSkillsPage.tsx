import { useLoaderData } from 'react-router';
import { getPassiveSkillsList } from '@/api/passiveSkills';
import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';
import { PassiveSkillsList } from '@/modules/passiveSkills/components/PassiveSkillsList';

const loader = async () => {
  const passiveSkills = await getPassiveSkillsList();

  return {
    passiveSkills,
  };
};

const handle = {
  title: 'Пассивные умения',
};

const ErrorBoundary = () => {
  return <Placeholder description="Ошибка загрузки пассивных умений" />;
};

export const PassiveSkillsPage = () => {
  const { passiveSkills } = useLoaderData<typeof loader>();

  return (
    <Card header="Пассивные умения" className="m-4!">
      <PassiveSkillsList skills={passiveSkills} />
    </Card>
  );
};

PassiveSkillsPage.loader = loader;
PassiveSkillsPage.ErrorBoundary = ErrorBoundary;
PassiveSkillsPage.handle = handle;
