import { Accordion, Section } from '@telegram-apps/telegram-ui';
import { useGameStore } from '@/modules/game/store/useGameStore';
import { Description } from '@/components/Description';
import { useState } from 'react';
import { reserverClanName } from '@fwo/schemas';

export function GameStatus() {
  const status = useGameStore((state) => state.status);
  const statusByClan = useGameStore((state) => state.statusByClan);
  const [visibleClan, setVisibleClan] = useState<string[]>([]);

  const handleChange = (clan: string) => {
    return (expanded: boolean) => {
      setVisibleClan((visibleClan) =>
        expanded ? visibleClan.concat([clan]) : visibleClan.filter((c) => c !== clan),
      );
    };
  };

  return (
    <Description>
      {status.map((status) => (
        <Description.Item
          key={status.name}
          after={
            <>
              {status.hp && <>❤️ {status.hp}</>}
              {status.mp && <>💧 {status.mp}</>}
              {status.en && <>🔋 {status.en}</>}
            </>
          }
        >
          {status.name}
        </Description.Item>
      ))}
      {Object.entries(statusByClan).map(([clan, statuses]) => (
        <Accordion key={clan} expanded={visibleClan.includes(clan)} onChange={handleChange(clan)}>
          <Accordion.Summary style={{ '--tgui--cell--middle--padding': 0 }}>
            <Section.Header>{clan === reserverClanName ? 'Без клана' : clan}</Section.Header>
          </Accordion.Summary>
          <Accordion.Content>
            {statuses?.map((status) => (
              <Description.Item key={status.id} after={<>❤️ {status.hp}</>}>
                {status.name}
              </Description.Item>
            ))}
          </Accordion.Content>
        </Accordion>
      ))}
    </Description>
  );
}
