import { Suspense } from 'react';
import { useLoaderData } from 'react-router';
import { getAvailableSkillList } from '@/api/skill';
import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';
import { CharacterSkillList } from '@/modules/character/components/CharacterSkillList';

const loader = async () => {
  const skills = await getAvailableSkillList();

  return {
    skills,
  };
};

export const CharacterSkillPage = () => {
  const { skills } = useLoaderData<typeof loader>();

  return (
    <Card header="Умения" className="m-4!">
      <Suspense fallback={<Placeholder description="Ищем умения..." />}>
        <CharacterSkillList skills={skills} />
      </Suspense>
    </Card>
  );
};

CharacterSkillPage.loader = loader;
