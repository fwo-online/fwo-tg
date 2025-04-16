import { learnMagic } from '@/api/magic';
import { useModal } from '@/contexts/modal';
import { useRequest } from '@/hooks/useRequest';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';

export const useCharacterLearnMagic = () => {
  const { updateCharacter } = useUpdateCharacter();
  const [isLearning, makeRequest] = useRequest();
  const modal = useModal();

  const handleLearn = async (lvl: number) => {
    modal.confirm({
      message: `Стоимость изучения ${lvl}💡`,
      onConfirm: (done) => {
        makeRequest(async () => {
          await learnMagic(lvl)
            .then((magic) => {
              done();
              if (magic) {
                modal.info({
                  message: `Ты выучил ${magic.displayName}`,
                });
              }
            })
            .finally(updateCharacter);
        });
      },
    });
  };

  return {
    isLearning,
    handleLearn,
  };
};
