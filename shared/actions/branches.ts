import { CharacterClass } from '@/character/characterClassSchema';

export type WarriorBranch = 'guardian' | 'berserker' | 'duelist';
export type ArcherBranch = 'marksman' | 'barrage' | 'scout';
export type MageBranch = 'elements' | 'darkness' | 'arcana';
export type PriestBranch = 'holy' | 'protection' | 'inquisition';

export type PhysicalBranchId = WarriorBranch | ArcherBranch;
export type MagicBranchId = MageBranch | PriestBranch;
export type BranchKey = MagicBranchId | PhysicalBranchId;

export type Archetype = 'physical' | 'magical';

export interface BranchMeta {
  id: BranchKey;
  name: string;
  description: string;
  icon: string;
  class: CharacterClass;
}

export const SECOND_BRANCH_MIN_CHAR_LVL = 10;
export const MAX_BRANCHES = 2;

export const ARCHER_BRANCHES: Record<ArcherBranch, BranchMeta> = Object.freeze({
  marksman: {
    id: 'marksman',
    name: 'Снайпер',
    description: 'Прицельные выстрелы, пробитие брони и щитов, выстрел в колено и метка охотника',
    icon: '🎯',
    class: CharacterClass.Archer,
  },
  barrage: {
    id: 'barrage',
    name: 'Шквал',
    description: 'Залпы стрел, стихийный урон (огонь и яд), рикошеты и боевой кураж',
    icon: '🏹',
    class: CharacterClass.Archer,
  },
  scout: {
    id: 'scout',
    name: 'Следопыт',
    description: 'Ловкость, уклонение, подножка, полевая медицина и выживаемость',
    icon: '🏃',
    class: CharacterClass.Archer,
  },
});

export const WARRIOR_BRANCHES: Record<WarriorBranch, BranchMeta> = Object.freeze({
  guardian: {
    id: 'guardian',
    name: 'Оплот',
    description: 'Глухая оборона, щиты, броня и защита соратников',
    icon: '🛡️',
    class: CharacterClass.Warrior,
  },
  berserker: {
    id: 'berserker',
    name: 'Ярость',
    description: 'Сокрушительный урон, ярость, кливы и жертва здоровьем',
    icon: '🪓',
    class: CharacterClass.Warrior,
  },
  duelist: {
    id: 'duelist',
    name: 'Дуэлянт',
    description: 'Мастерское фехтование, парирование, обезоруживание и яды',
    icon: '🗡️',
    class: CharacterClass.Warrior,
  },
});

export const MAGE_BRANCHES: Record<MageBranch, BranchMeta> = Object.freeze({
  elements: {
    id: 'elements',
    name: 'Стихии',
    description: 'Прямой и массовый урон огнем, холодом и молнией',
    icon: '⚡',
    class: CharacterClass.Mage,
  },
  darkness: {
    id: 'darkness',
    name: 'Тьма',
    description: 'Яды, кислоты, вампиризм, истощение здоровья и некромантия',
    icon: '💀',
    class: CharacterClass.Mage,
  },
  arcana: {
    id: 'arcana',
    name: 'Искажение',
    description: 'Защитные ауры, щиты, иллюзии и контроль разума (сон, сайленс, безумие)',
    icon: '🔮',
    class: CharacterClass.Mage,
  },
});

export const PRIEST_BRANCHES: Record<PriestBranch, BranchMeta> = Object.freeze({
  holy: {
    id: 'holy',
    name: 'Свет',
    description: 'Прямое и групповое исцеление, регенерация и воскрешение',
    icon: '✨',
    class: CharacterClass.Priest,
  },
  protection: {
    id: 'protection',
    name: 'Опека',
    description: 'Благословения, каменная кожа, защитные барьеры и очищение союзников',
    icon: '🛡️',
    class: CharacterClass.Priest,
  },
  inquisition: {
    id: 'inquisition',
    name: 'Инквизиция',
    description: 'Проклятия, паралич, развеивание баффов, сжигание маны и карающий урон',
    icon: '⚖️',
    class: CharacterClass.Priest,
  },
});

export const MAGIC_BRANCHES: Record<MagicBranchId, BranchMeta> = Object.freeze({
  ...MAGE_BRANCHES,
  ...PRIEST_BRANCHES,
});

export const PHYSICAL_BRANCHES: Record<PhysicalBranchId, BranchMeta> = Object.freeze({
  ...WARRIOR_BRANCHES,
  ...ARCHER_BRANCHES,
});

export const BRANCHES: Record<BranchKey, BranchMeta> = Object.freeze({
  ...WARRIOR_BRANCHES,
  ...ARCHER_BRANCHES,
  ...MAGE_BRANCHES,
  ...PRIEST_BRANCHES,
});

/**
 * Получить список всех веток для класса
 */
export function getBranchesByProf(prof: CharacterClass | string): BranchMeta[] {
  return Object.values(BRANCHES).filter((branch) => branch.class === prof);
}

/**
 * Проверка, принадлежит ли действие ветке
 */
export function isInBranch(
  action: { branch?: BranchKey; branches?: readonly BranchKey[] | BranchKey[] },
  branch: BranchKey,
): boolean {
  if (action.branch === branch) return true;
  if (action.branches?.includes(branch)) return true;
  return false;
}

/**
 * Получить нормализованный массив веток способности
 */
export function getAbilityBranches(action: {
  branch?: BranchKey;
  branches?: readonly BranchKey[] | BranchKey[];
}): BranchKey[] {
  if (action.branches?.length) return [...action.branches];
  return action.branch ? [action.branch] : [];
}

/**
 * Проверка, есть ли у персонажа выбранная ветка своего класса для данной способности
 */
export function hasSelectedBranchForProf(
  prof: CharacterClass | string,
  selectedBranches: readonly BranchKey[],
  action: { branch?: BranchKey; branches?: readonly BranchKey[] | BranchKey[] },
): boolean {
  const branches = getAbilityBranches(action);
  return (
    branches.length === 0 ||
    branches.some((branch) => BRANCHES[branch].class === prof && selectedBranches.includes(branch))
  );
}
