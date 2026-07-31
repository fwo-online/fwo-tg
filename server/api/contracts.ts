import type { Contract } from '@fwo/shared';
import { CharModel } from '@/models/character';

export async function getContracts(characterId: string): Promise<Contract[]> {
  const character = await CharModel.findById(characterId)
    .select('contracts contractsGeneratedAt')
    .orFail(new Error('Персонаж не найден'));

  return character.contracts ?? [];
}

export async function saveContracts(characterId: string, contracts: Contract[], generatedAt: Date) {
  return CharModel.findByIdAndUpdate(
    characterId,
    {
      contracts,
      contractsGeneratedAt: generatedAt,
    },
    { returnDocument: 'after' },
  );
}

export async function replaceContract(_characterId: string, _contractIndex: number) {
  // Заглушка для будущей реализации
  throw new Error('Not implemented');
}

export async function resetAllContracts() {
  return CharModel.updateMany({ deleted: false }, { contracts: [], contractsGeneratedAt: null });
}
