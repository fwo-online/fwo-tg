import {
  CharacterClass,
  type Contract,
  type ContractTier,
  ContractType,
  ForestPhase,
} from '@fwo/shared';
import { claimContract } from '@/api/contracts';
import type { CharacterService } from '@/arena/CharacterService/CharacterService';
import ValidationError from '@/arena/errors/ValidationError';

export class ContractService {
  /** Pool типов контрактов, доступных классу */
  static getAvailableTypes(character: CharacterService): ContractType[] {
    const types: ContractType[] = [ContractType.Damage, ContractType.Kills];

    // Heal для кастеров
    if (character.class === CharacterClass.Mage || character.class === CharacterClass.Priest) {
      types.push(ContractType.Heal);
    }

    // UseAbility если есть магии или скиллы
    if (Object.keys(character.magics).length > 0 || Object.keys(character.skills).length > 0) {
      types.push(ContractType.UseAbility);
    }

    // ForestLocations для уровней ≤ 8
    if (character.lvl <= 3) {
      types.push(ContractType.ForestLocations);
    }

    return types;
  }

  /** Фаза леса на основе уровня */
  static getForestPhase(lvl: number): ForestPhase {
    if (lvl <= 4) return ForestPhase.Edge;
    if (lvl <= 8) return ForestPhase.Wilds;
    return ForestPhase.Deep;
  }

  /** Название фазы леса для UI */
  static getForestPhaseName(phase: ForestPhase): string {
    switch (phase) {
      case ForestPhase.Edge:
        return 'Опушке';
      case ForestPhase.Wilds:
        return 'Чаще';
      case ForestPhase.Deep:
        return 'Глуши';
    }
  }

  /** Рассчитать цель контракта */
  static calculateGoal(type: ContractType, lvl: number, tier: ContractTier): number {
    switch (type) {
      case ContractType.Damage:
        return lvl * 50 * tier;
      case ContractType.Kills:
        return Math.max(1, Math.floor(lvl / 3) * tier);
      case ContractType.Heal:
        return lvl * 40 * tier;
      case ContractType.UseAbility:
        return 3 + tier;
      case ContractType.ForestLocations:
        return 2 + tier;
    }
  }

  /** Рассчитать награду */
  static calculateReward(
    lvl: number,
    tier: ContractTier,
  ): Pick<Contract, 'exp' | 'gold' | 'components'> {
    const reward: Pick<Contract, 'exp' | 'gold' | 'components'> = {
      exp: lvl * 250 * tier,
      gold: lvl * 10 * tier,
      components: {},
    };

    // Компоненты на tier 2+
    if (tier >= 2) {
      const compCount = tier - 1;
      if (lvl <= 3) {
        reward.components = { fabric: compCount, wood: compCount };
      } else if (lvl <= 6) {
        reward.components = { leather: compCount, iron: compCount };
      } else {
        reward.components = { steel: compCount, arcanite: compCount };
      }
    }

    return reward;
  }

  /** Сгенерировать 3 контракта для персонажа */
  static generateContracts(character: CharacterService): Contract[] {
    const availableTypes = this.getAvailableTypes(character);
    const contracts: Contract[] = [];

    // Выбрать 3 случайных типа (без повторов если возможно)
    const shuffled = [...availableTypes].sort(() => Math.random() - 0.5);
    const selectedTypes = shuffled.slice(0, 3);

    // Если не хватило — дополнить Damage
    while (selectedTypes.length < 3) {
      selectedTypes.push(ContractType.Damage);
    }

    for (let i = 0; i < 3; i++) {
      const tier = (i + 1) as ContractTier;
      const type = selectedTypes[i];
      const goal = this.calculateGoal(type, character.lvl, tier);
      const reward = this.calculateReward(character.lvl, tier);

      contracts.push({
        type,
        tier,
        goal,
        progress: 0,
        claimed: false,
        ...reward,
      });
    }

    return contracts;
  }

  static async claimContract(character: CharacterService, idx: number) {
    const charContracts = character.quests.contracts;
    const contract = charContracts?.[idx];

    if (!contract) {
      throw new ValidationError('Контракт не найден');
    }
    if (contract.claimed) {
      throw new ValidationError('Награда уже получена');
    }
    if (contract.progress < contract.goal) {
      throw new ValidationError('Контракт не выполнен');
    }

    await claimContract(
      character.id,
      idx,
      [...charContracts], // передаём копию in-memory контрактов (с актуальным прогрессом)
      {
        exp: contract.exp,
        gold: contract.gold,
        components: contract.components,
      },
    );
  }
}
