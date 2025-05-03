import { getCharacterList } from '@/api/character';
import useSWR from 'swr';

export const useClanPlayers = (players: string[]) => {
  const { data } = useSWR(['clanPlayers', players], ([_, players]) => getCharacterList(players), {
    suspense: true,
  });

  return data;
};
