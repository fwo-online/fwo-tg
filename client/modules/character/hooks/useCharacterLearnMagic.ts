import { learnMagic } from '@/api/magic';
import { usePopup } from '@/hooks/usePopup';
import { useRequest } from '@/hooks/useRequest';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';

export const useCharacterLearnMagic = () => {
  const { syncCharacter } = useSyncCharacter();
  const [isLearning, makeRequest] = useRequest();
  const popup = usePopup();

  const handleLearn = async (lvl: number) => {
    popup.confirm({
      message: `Стоимость изучения ${lvl}💡`,
      onConfirm: () => {
        makeRequest(async () => {
          const magic = await learnMagic(lvl);
          await syncCharacter();

          popup.info({
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
