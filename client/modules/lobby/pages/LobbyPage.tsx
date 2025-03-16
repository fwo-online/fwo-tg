import { characterClassNameMap } from '@/constants/character';
import { ButtonCell, List, Section, Info, Cell, Placeholder } from '@telegram-apps/telegram-ui';
import { useLobby } from '@/modules/lobby/hooks/useLobby';

export function LobbyPage() {
  const { toggleSearch, isSearching, searchers } = useLobby();

  return (
    <List>
      <Section>
        <Section.Header>Ищут игру</Section.Header>
        {searchers.length ? (
          searchers.map((searcher) => (
            <Cell key={searcher.name}>
              <Info type="text">
                {searcher.name} ({characterClassNameMap[searcher.class]} {searcher.lvl})
              </Info>
            </Cell>
          ))
        ) : (
          <Placeholder description="Никого нет" />
        )}
      </Section>

      {isSearching ? (
        <ButtonCell mode="destructive" onClick={toggleSearch}>
          Остановить поиск игры
        </ButtonCell>
      ) : (
        <ButtonCell onClick={toggleSearch}>Начать поиск игры</ButtonCell>
      )}
    </List>
  );
}
