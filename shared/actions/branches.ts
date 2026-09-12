import type { CharacterClass } from '@/character';

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
  prof: CharacterClass | `${CharacterClass}`;
  archetype?: Archetype;
}

export type MagicBranchMeta = BranchMeta & {
  id: MagicBranchId;
  prof: 'm' | 'p';
};

export const SECOND_BRANCH_MIN_CHAR_LVL = 10;
export const MAX_MAGIC_BRANCHES = 2;
export const MAX_BRANCHES = 2;

export const ARCHER_BRANCHES: Record<ArcherBranch, BranchMeta> = {
  marksman: {
    id: 'marksman',
    name: 'Снайпер',
    description: 'Прицельные выстрелы, пробитие брони и щитов, выстрел в колено и метка охотника',
    icon: '🎯',
    prof: 'l',
    archetype: 'physical',
  },
  barrage: {
    id: 'barrage',
    name: 'Шквал',
    description: 'Залпы стрел, стихийный урон (огонь и яд), рикошеты и боевой кураж',
    icon: '🏹',
    prof: 'l',
    archetype: 'physical',
  },
  scout: {
    id: 'scout',
    name: 'Следопыт',
    description: 'Ловкость, уклонение, подножка, полевая медицина и выживаемость',
    icon: '🏃',
    prof: 'l',
    archetype: 'physical',
  },
};

export const WARRIOR_BRANCHES: Record<WarriorBranch, BranchMeta> = {
  guardian: {
    id: 'guardian',
    name: 'Оплот',
    description: 'Глухая оборона, щиты, броня и защита соратников',
    icon: '🛡️',
    prof: 'w',
    archetype: 'physical',
  },
  berserker: {
    id: 'berserker',
    name: 'Ярость',
    description: 'Сокрушительный урон, ярость, кливы и жертва здоровьем',
    icon: '🪓',
    prof: 'w',
    archetype: 'physical',
  },
  duelist: {
    id: 'duelist',
    name: 'Дуэлянт',
    description: 'Мастерское фехтование, парирование, обезоруживание и яды',
    icon: '🗡️',
    prof: 'w',
    archetype: 'physical',
  },
};

export const MAGIC_BRANCHES: Record<MagicBranchId, MagicBranchMeta> = {
  elements: {
    id: 'elements',
    name: 'Стихии',
    description: 'Прямой и массовый урон огнем, холодом и молнией',
    icon: '⚡',
    prof: 'm',
    archetype: 'magical',
  },
  darkness: {
    id: 'darkness',
    name: 'Тьма',
    description: 'Яды, кислоты, вампиризм, истощение здоровья и некромантия',
    icon: '💀',
    prof: 'm',
    archetype: 'magical',
  },
  arcana: {
    id: 'arcana',
    name: 'Искажение',
    description: 'Защитные ауры, щиты, иллюзии и контроль разума (сон, сайленс, безумие)',
    icon: '🔮',
    prof: 'm',
    archetype: 'magical',
  },
  holy: {
    id: 'holy',
    name: 'Свет',
    description: 'Прямое и групповое исцеление, регенерация и воскрешение',
    icon: '✨',
    prof: 'p',
    archetype: 'magical',
  },
  protection: {
    id: 'protection',
    name: 'Опека',
    description: 'Благословения, каменная кожа, защитные барьеры и очищение союзников',
    icon: '🛡️',
    prof: 'p',
    archetype: 'magical',
  },
  inquisition: {
    id: 'inquisition',
    name: 'Инквизиция',
    description: 'Проклятия, паралич, развеивание баффов, сжигание маны и карающий урон',
    icon: '⚖️',
    prof: 'p',
    archetype: 'magical',
  },
};

export const BRANCHES: Record<BranchKey, BranchMeta> = {
  ...WARRIOR_BRANCHES,
  ...ARCHER_BRANCHES,
  ...MAGIC_BRANCHES,
};

/**
 * Получить список всех веток для класса
 */
export function getBranchesByProf(prof: CharacterClass | string): BranchMeta[] {
  return Object.values(BRANCHES).filter((branch) => branch.prof === prof);
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
