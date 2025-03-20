import { learnMagic } from '@/api/magic';
import { useModal } from '@/contexts/modal';
import { useRequest } from '@/hooks/useRequest';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';

export const useCharacterLearnMagic = () => {
  const { updateCharacter } = useUpdateCharacter();
  const [isLearning, makeRequest] = useRequest();
  const { showConfirmModal, showInfoModal, closeModal } = useModal();

  const handleLearn = async (lvl: number) => {
    showConfirmModal({
      message: `Стоимость изучения ${lvl}💡`,
      onConfirm: () => {
        makeRequest(async () => {
          const magic = await learnMagic(lvl);
          await updateCharacter();

          closeModal();

          showInfoModal({
            message: `Ты выучил ${magic.displayName}`,
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
