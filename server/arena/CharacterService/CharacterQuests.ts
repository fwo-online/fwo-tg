import { type GameResult, QuestType } from '@fwo/shared';
import { isNotNil } from 'es-toolkit';
import type { CharacterService } from '@/arena/CharacterService/CharacterService';
import type { Item } from '@/models/item';

export class CharacterQuests {
  constructor(private character: CharacterService) {}

  async updateQuestProgress(result: GameResult) {
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
}
