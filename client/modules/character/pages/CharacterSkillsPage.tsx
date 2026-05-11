import type { Skill } from '@fwo/shared';
import { useState } from 'react';
import { useLoaderData } from 'react-router';
import { getAvailableSkillList } from '@/api/skill';
import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';
import { useMountEffect } from '@/hooks/useMountEffect';
import { SkillCard } from '@/modules/skills/components/SkillCard';
import { SkillsList } from '@/modules/skills/components/SkillsList';

const loader = async () => {
  const skills = await getAvailableSkillList();

  return {
    skills,
  };
};

const ErrorBoundary = () => {
  return <Placeholder description="Ошибка загрузки пассивных умений" />;
};

export const CharacterSkillPage = () => {
  const { skills } = useLoaderData<typeof loader>();
  const [selectedSkill, setSelectedSkill] = useState<Skill>();

  useMountEffect(() => {
    setSelectedSkill(skills[0]);
  });

  return (
    <div className="h-screen flex flex-col">
      <Card header="Пассивные умения" className="m-4 mb-1">
        <div className="max-h-[45vh] overflow-y-auto">
          <SkillsList skills={skills} selectedSkill={selectedSkill} onSelect={setSelectedSkill} />
        </div>
      </Card>
      <Card className="m-4 mt-0 flex-1 flex flex-col">
        {selectedSkill ? <SkillCard skill={selectedSkill} /> : null}
      </Card>
    </div>
  );
};

CharacterSkillPage.loader = loader;
CharacterSkillPage.ErrorBoundary = ErrorBoundary;
