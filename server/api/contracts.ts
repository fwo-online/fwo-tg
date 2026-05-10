import type { Contract } from '@fwo/shared';
import { CharModel } from '@/models/character';

export async function getContracts(characterId: string): Promise<Contract[]> {
  const character = await CharModel.findById(characterId)
    .select('contracts contractsGeneratedAt')
    .orFail(new Error('Персонаж не найден'));

  return character.contracts ?? [];
}

export async function saveContracts(
  characterId: string,
  contracts: Contract[],
  generatedAt: Date,
) {
  return CharModel.findByIdAndUpdate(characterId, {
    contracts,
    contractsGeneratedAt: generatedAt,
  });
}

/**
 * Атомарно пометить контракт как полученный и выдать награду.
 * Принимает актуальный массив контрактов (из in-memory CharacterService) —
 * чтобы избежать расхождения с БД (прогресс обновляется в памяти и может
 * ещё не быть сохранён в MongoDB на момент claim).
 */
export async function claimContract(
  characterId: string,
  contractIndex: number,
  contracts: Contract[],
  reward: { exp: number; gold: number; components: Record<string, number> },
) {
  // Помечаем контракт полученным в переданной копии
  contracts[contractIndex].claimed = true;

  // Атомарный запрос: проверяем что контракт ещё не получен в БД,
  // и одновременно обновляем contracts + награды
  const character = await CharModel.findOneAndUpdate(
    {
      _id: characterId,
      [`contracts.${contractIndex}.claimed`]: false,
    },
    {
      $set: { contracts },
      $inc: {
        exp: reward.exp,
        gold: reward.gold,
      },
    },
    { returnDocument: 'after' },
  ).orFail(new Error('Награда уже получена или персонаж не найден'));

  // Слияние компонентов (Map не поддерживает $inc через dotted path)
  if (Object.keys(reward.components).length > 0) {
    const existingComponents = (
      character.components instanceof Map
        ? Object.fromEntries(character.components)
        : (character.components ?? {})
    ) as Record<string, number>;

    for (const [key, value] of Object.entries(reward.components)) {
      existingComponents[key] = (existingComponents[key] ?? 0) + value;
    }

    await CharModel.findByIdAndUpdate(characterId, { components: existingComponents });
    character.components = existingComponents as any;
  }

  return character;
}

export async function replaceContract(_characterId: string, _contractIndex: number) {
  // Заглушка для будущей реализации
  throw new Error('Not implemented');
}

export async function resetAllContracts() {
  return CharModel.updateMany(
    { deleted: false },
    { contracts: [], contractsGeneratedAt: null },
  );
}
