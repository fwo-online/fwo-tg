import { type Contract, ContractType, type GameResult, QuestType } from '@fwo/shared';
import { isNotNil } from 'es-toolkit';
import mongoose from 'mongoose';
import type { CharacterService } from '@/arena/CharacterService/CharacterService';
import { ContractService } from '@/arena/ContractService/ContractService';
import ValidationError from '@/arena/errors/ValidationError';
import type { Item } from '@/models/item';

export class CharacterQuests {
  constructor(private character: CharacterService) {}

  get contracts() {
    return this.character.charObj.contracts;
  }

  setContracts(contracts: Contract[], contractsGeneratedAt: Date) {
    this.character.charObj.contracts = contracts;
    this.character.charObj.contractsGeneratedAt = contractsGeneratedAt;
  }

  async updateQuestProgress(result: GameResult) {
    // --- Существующие item-квесты ---
    await this.updateItemsQuestProgress(result);
    // --- Ежедневные контракты ---
    await this.updateContractProgress(result);
  }

  private async updateItemsQuestProgress(result: GameResult) {
    const itemsToUpdate = Array.from(this.character.inventory.equipment.values())
      .map((item) => this.character.inventory.getItem(item._id.toString()))
      .filter(isNotNil);
    const updatedItems = itemsToUpdate
      .map((item) => this.updateItemQuestProgressForItem(item, result))
      .filter(isNotNil);

    await this.character.inventory.updateItems(updatedItems);
  }

  private updateItemQuestProgressForItem(
    item: Item,
    { damage = 0, heal = 0, kills = 0 }: GameResult,
  ) {
    const quest = item.passive?.quest;
    if (!item.passive || !quest) {
      return;
    }

    if (quest.progress >= quest.goal || item.passive.unlocked) {
      return;
    }

    switch (quest.type) {
      case QuestType.Kills:
        quest.progress += kills;
        break;
      case QuestType.Damage:
        quest.progress += damage;
        break;
      case QuestType.Heal:
        quest.progress += heal;
        break;
    }

    quest.progress = Math.min(quest.progress, quest.goal);

    if (quest.progress >= quest.goal) {
      item.passive.unlocked = true;
    }

    item.passive.quest = quest;

    return item;
  }

  private async updateContractProgress(result: GameResult) {
    if (!this.contracts?.length) {
      return;
    }

    const { damage = 0, kills = 0, heal = 0, abilitiesUsed = 0 } = result;
    let updated = false;

    for (const contract of this.contracts) {
      if (contract.claimed) {
        continue;
      }

      switch (contract.type) {
        case ContractType.Damage:
          contract.progress += damage;
          break;
        case ContractType.Kills:
          contract.progress += kills;
          break;
        case ContractType.Heal:
          contract.progress += heal;
          break;
        case ContractType.UseAbility:
          contract.progress += abilitiesUsed;
          break;
      }

      contract.progress = Math.min(contract.progress, contract.goal);
      updated = true;
    }

    if (updated) {
      this.character.charObj.contracts = this.contracts;
      // Явно сохраняем контракты в БД — saveToDb() уже вызван до этого
      // (в RewardService.saveRewards), а прогресс обновляется позже в game.on('end')
      await this.character.save({ contracts: this.contracts });
    }
  }

  /** Обновить прогресс лесных контрактов (вызывается при окончании леса) */
  async updateForestContractProgress(resolvedCount: number) {
    if (!resolvedCount) {
      return;
    }

    if (!this.contracts?.length) {
      return;
    }

    const forestPhase = ContractService.getForestPhase(this.character.lvl);
    let updated = false;

    for (const contract of this.contracts) {
      if (contract.claimed) {
        continue;
      }
      if (contract.type !== ContractType.ForestLocations) continue;

      const contractPhase = ContractService.getForestPhase(this.character.lvl);
      if (contractPhase !== forestPhase) continue;

      contract.progress = Math.min(contract.progress + resolvedCount, contract.goal);
      updated = true;
    }

    if (updated) {
      this.character.charObj.contracts = this.contracts;
      await this.character.save({ contracts: this.contracts });
    }
  }

  async claimContract(idx: number) {
    const contract = this.contracts?.[idx];

    if (!contract) {
      throw new ValidationError('Контракт не найден');
    }
    if (contract.claimed) {
      throw new ValidationError('Награда уже получена');
    }
    if (contract.progress < contract.goal) {
      throw new ValidationError('Контракт не выполнен');
    }

    await mongoose.connection.transaction(async () => {
      await this.character.resources.addResources({
        gold: contract.gold,
        exp: contract.exp,
        components: contract.components,
      });

      contract.claimed = true;

      await this.character.save({ contracts: this.contracts });
    });
  }
}
