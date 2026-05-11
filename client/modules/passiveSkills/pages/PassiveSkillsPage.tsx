import type { PassiveSkill } from '@fwo/shared';
import { useState } from 'react';
import { useLoaderData } from 'react-router';
import { getPassiveSkillsList } from '@/api/passiveSkills';
import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';
import { useMountEffect } from '@/hooks/useMountEffect';
import { PassiveSkillCard } from '@/modules/passiveSkills/components/PassiveSkillCard';
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
  const [selectedSkill, setSelectedSkill] = useState<PassiveSkill>();

  useMountEffect(() => {
    setSelectedSkill(passiveSkills[0]);
  });

  return (
    <div className="h-screen flex flex-col">
      <Card header="Пассивные умения" className="m-4 mb-1">
        <div className="max-h-[45vh] overflow-y-auto">
          <PassiveSkillsList
            skills={passiveSkills}
            selectedSkill={selectedSkill}
            onSelect={setSelectedSkill}
          />
        </div>
      </Card>
      <Card className="m-4 mt-0 flex-1 flex flex-col">
        {selectedSkill ? <PassiveSkillCard passiveSkill={selectedSkill} /> : null}
      </Card>
    </div>
  );
};

PassiveSkillsPage.loader = loader;
PassiveSkillsPage.ErrorBoundary = ErrorBoundary;
PassiveSkillsPage.handle = handle;
