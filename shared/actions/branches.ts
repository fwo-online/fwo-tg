import type { CharacterClass } from '@/character';

export type MageBranch = 'elements' | 'darkness' | 'arcana';
export type PriestBranch = 'holy' | 'protection' | 'inquisition';
export type MagicBranchId = MageBranch | PriestBranch;

export interface MagicBranchMeta {
  id: MagicBranchId;
  name: string;
  description: string;
  icon: string;
  prof: 'm' | 'p';
}

export const SECOND_BRANCH_MIN_CHAR_LVL = 10;
export const MAX_MAGIC_BRANCHES = 2;

export const MAGIC_BRANCHES: Record<MagicBranchId, MagicBranchMeta> = {
  elements: {
    id: 'elements',
    name: 'Стихии',
    description: 'Прямой и массовый урон огнем, холодом и молнией',
    icon: '⚡',
    prof: 'm',
  },
  darkness: {
    id: 'darkness',
    name: 'Тьма',
    description: 'Яды, кислоты, вампиризм, истощение здоровья и некромантия',
    icon: '💀',
    prof: 'm',
  },
  arcana: {
    id: 'arcana',
    name: 'Искажение',
    description: 'Защитные ауры, щиты, иллюзии и контроль разума (сон, сайленс, безумие)',
    icon: '🔮',
    prof: 'm',
  },
  holy: {
    id: 'holy',
    name: 'Свет',
    description: 'Прямое и групповое исцеление, регенерация и воскрешение',
    icon: '✨',
    prof: 'p',
  },
  protection: {
    id: 'protection',
    name: 'Опека',
    description: 'Благословения, каменная кожа, защитные барьеры и очищение союзников',
    icon: '🛡️',
    prof: 'p',
  },
  inquisition: {
    id: 'inquisition',
    name: 'Инквизиция',
    description: 'Проклятия, паралич, развеивание баффов, сжигание маны и карающий урон',
    icon: '⚖️',
    prof: 'p',
  },
};

/**
 * Получить список всех веток для класса
 */
export function getBranchesByProf(prof: CharacterClass | string): MagicBranchMeta[] {
  return Object.values(MAGIC_BRANCHES).filter((branch) => branch.prof === prof);
}
