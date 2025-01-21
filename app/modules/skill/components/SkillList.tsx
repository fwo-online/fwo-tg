import type { Skill } from '@fwo/schemas';
import { Cell, Section } from '@telegram-apps/telegram-ui';
import { type FC, use, useState } from 'react';

export const SkillList: FC<{
  skillsPromise: Promise<Skill[]>;
  after?: (skill: Skill) => React.ReactNode;
}> = ({ skillsPromise, after }) => {
  const [skills] = useState(use(skillsPromise));

  return (
    <Section>
      {skills.map((skill) => (
        <Cell key={skill.name} after={after?.(skill)}>
          {skill.displayName}
        </Cell>
      ))}
    </Section>
  );
};
