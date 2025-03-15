import { learnMagic } from '@/client/magic';
import { useRequest } from '@/hooks/useRequest';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';
import { popup } from '@telegram-apps/sdk-react';

export const useCharacterLearnMagic = () => {
  const { updateCharacter } = useUpdateCharacter();
  const [isLearning, makeRequest] = useRequest();

  const handleLearn = async (lvl: number) => {
    if (!popup.isSupported()) {
      return;
    }

    const id = await popup.open({
      message: `Стоимость изучения ${lvl}💡`,
      buttons: [
        {
          id: 'close',
          type: 'close',
        },
        {
          id: 'ok',
          type: 'ok',
        },
      ],
    });

    if (id === 'ok') {
      makeRequest(async () => {
        const magic = await learnMagic(lvl);
        await updateCharacter();

        await popup.open({
          title: 'Успешное изучение',
          message: `${magic.displayName}`,
        });
      });
    }
  };

  return {
    isLearning,
    handleLearn,
  };
};
