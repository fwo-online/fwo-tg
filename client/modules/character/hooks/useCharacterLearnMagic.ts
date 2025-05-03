import { learnMagic } from '@/api/magic';
import { useConfirm } from '@/hooks/useConfirm';
import { useRequest } from '@/hooks/useRequest';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { popup } from '@telegram-apps/sdk-react';

export const useCharacterLearnMagic = () => {
  const { syncCharacter } = useSyncCharacter();
  const [isLearning, makeRequest] = useRequest();
  const { confirm } = useConfirm();

  const handleLearn = async (lvl: number) => {
    confirm({
      message: `Стоимость изучения ${lvl}💡`,
      onConfirm: () => {
        makeRequest(async () => {
          const magic = await learnMagic(lvl);
          await syncCharacter();

          await popup.open({
            title: 'Успешное изучение',
            message: `${magic.displayName}`,
          });
        });
      },
    });
  };

  return {
    isLearning,
    handleLearn,
  };
};
