import type { CharacterClass } from '@/character';

export type WarriorBranch = 'guardian' | 'berserker' | 'duelist';
export type ArcherBranch = 'marksman' | 'barrage' | 'scout';
export type MageBranch = 'elements' | 'darkness' | 'arcana';
export type PriestBranch = 'holy' | 'protection' | 'inquisition';

export type BranchKey = WarriorBranch | ArcherBranch | MageBranch | PriestBranch;

export type Archetype = 'physical' | 'magical';

export interface BranchMeta {
  id: BranchKey;
  name: string;
  description: string;
  icon: string;
  prof: CharacterClass | `${CharacterClass}`;
  archetype: Archetype;
}

export const SECOND_BRANCH_MIN_CHAR_LVL = 10;
export const MAX_BRANCHES = 2;

export const BRANCHES: Record<BranchKey, BranchMeta> = {
  // Воин (w)
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

  // Лучник (l)
  marksman: {
    id: 'marksman',
    name: 'Снайпер',
    description: 'Прицельные смертоносные выстрелы, метка цели и игнорирование брони',
    icon: '🎯',
    prof: 'l',
    archetype: 'physical',
  },
  barrage: {
    id: 'barrage',
    name: 'Шквал',
    description: 'Залпы стрел, поражение нескольких врагов и рикошеты',
    icon: '🏹',
    prof: 'l',
    archetype: 'physical',
  },
  scout: {
    id: 'scout',
    name: 'Следопыт',
    description: 'Ловкость, уклонение от атак и магии, скрытность и выживаемость',
    icon: '🏃',
    prof: 'l',
    archetype: 'physical',
  },

  // Маг (m)
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

  // Жрец (p)
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

export type SubclassDef = readonly [BranchKey, BranchKey, string];

export const SUBCLASSES: readonly SubclassDef[] = [
  // Моно-классы (12)
  ['guardian', 'guardian', 'Паладин-страж'],
  ['berserker', 'berserker', 'Берсерк'],
  ['duelist', 'duelist', 'Мастер клинка'],
  ['marksman', 'marksman', 'Снайпер'],
  ['barrage', 'barrage', 'Канонир'],
  ['scout', 'scout', 'Ловчий'],
  ['elements', 'elements', 'Архимаг стихий'],
  ['darkness', 'darkness', 'Некромант'],
  ['arcana', 'arcana', 'Магистр Арканы'],
  ['holy', 'holy', 'Первосвященник'],
  ['protection', 'protection', 'Хранитель веры'],
  ['inquisition', 'inquisition', 'Великий инквизитор'],

  // Гибридные подклассы (66)
  ['arcana', 'barrage', 'Иллюзорный стрелок'],
  ['arcana', 'berserker', 'Берсерк хаоса'],
  ['arcana', 'darkness', 'Чернокнижник'],
  ['arcana', 'duelist', 'Спеллблейд'],
  ['arcana', 'elements', 'Архимаг'],
  ['arcana', 'guardian', 'Тамплиер'],
  ['arcana', 'holy', 'Мистик'],
  ['arcana', 'inquisition', 'Инквизитор разума'],
  ['arcana', 'marksman', 'Чародей-стрелок'],
  ['arcana', 'protection', 'Отшельник'],
  ['arcana', 'scout', 'Рейнджер'],

  ['barrage', 'berserker', 'Опустошитель'],
  ['barrage', 'darkness', 'Чумной стрелок'],
  ['barrage', 'duelist', 'Сорвиголова'],
  ['barrage', 'elements', 'Канонир стихий'],
  ['barrage', 'guardian', 'Рыцарь'],
  ['barrage', 'holy', 'Ангельский стрелок'],
  ['barrage', 'inquisition', 'Карающий шквал'],
  ['barrage', 'marksman', 'Мастер лука'],
  ['barrage', 'protection', 'Авангард'],
  ['barrage', 'scout', 'Егерь'],

  ['berserker', 'darkness', 'Жнец'],
  ['berserker', 'duelist', 'Гладиатор'],
  ['berserker', 'elements', 'Элементалист'],
  ['berserker', 'guardian', 'Варвар'],
  ['berserker', 'holy', 'Боевой капеллан'],
  ['berserker', 'inquisition', 'Фанатик'],
  ['berserker', 'marksman', 'Охотник за головами'],
  ['berserker', 'protection', 'Берсерк-защитник'],
  ['berserker', 'scout', 'Мародёр'],

  ['darkness', 'duelist', 'Тёмный рыцарь'],
  ['darkness', 'elements', 'Маг хаоса'],
  ['darkness', 'guardian', 'Рыцарь смерти'],
  ['darkness', 'holy', 'Некроприст'],
  ['darkness', 'inquisition', 'Хаотик'],
  ['darkness', 'marksman', 'Стрелок теней'],
  ['darkness', 'protection', 'Тёмный опекун'],
  ['darkness', 'scout', 'Ловчий скверны'],

  ['duelist', 'elements', 'Магический дуэлянт'],
  ['duelist', 'guardian', 'Защитник'],
  ['duelist', 'holy', 'Рыцарь Света'],
  ['duelist', 'inquisition', 'Инквизитор'],
  ['duelist', 'marksman', 'Ассасин'],
  ['duelist', 'protection', 'Защитник веры'],
  ['duelist', 'scout', 'Тень'],

  ['elements', 'guardian', 'Оплот титанов'],
  ['elements', 'holy', 'Иерофант'],
  ['elements', 'inquisition', 'Инквизитор пламени'],
  ['elements', 'marksman', 'Стрелок стихий'],
  ['elements', 'protection', 'Стихийный страж'],
  ['elements', 'scout', 'Друид'],

  ['guardian', 'holy', 'Аббат'],
  ['guardian', 'inquisition', 'Судия'],
  ['guardian', 'marksman', 'Осадный арбалетчик'],
  ['guardian', 'protection', 'Крестоносец'],
  ['guardian', 'scout', 'Страж границ'],

  ['holy', 'inquisition', 'Экзорцист'],
  ['holy', 'marksman', 'Стрелок Света'],
  ['holy', 'protection', 'Епископ'],
  ['holy', 'scout', 'Монах'],

  ['inquisition', 'marksman', 'Назгул'],
  ['inquisition', 'protection', 'Каратель'],
  ['inquisition', 'scout', 'Охотник на ведьм'],

  ['marksman', 'protection', 'Снайпер-хранитель'],
  ['marksman', 'scout', 'Следопыт'],

  ['protection', 'scout', 'Хранитель рощи'],
];

export const SUBCLASS_MAP = new Map<string, string>(
  SUBCLASSES.flatMap(([a, b, name]) => [
    [`${a}+${b}`, name],
    [`${b}+${a}`, name],
  ]),
);

/**
 * Получить название подкласса по двум веткам
 */
export function getSubclass(b1: BranchKey, b2: BranchKey): string | undefined {
  return SUBCLASS_MAP.get(`${b1}+${b2}`);
}

/**
 * Симметричная матрица 66 подклассов: branch1 -> { branch2: name }
 * Автоматически генерируется из SUBCLASS_MAP
 */
export const SUBCLASS_MATRIX: Record<BranchKey, Record<BranchKey, string>> = (() => {
  const matrix = {} as Record<BranchKey, Record<BranchKey, string>>;
  const keys = Object.keys(BRANCHES) as BranchKey[];
  for (const b1 of keys) {
    matrix[b1] = {} as Record<BranchKey, string>;
    for (const b2 of keys) {
      const sub = getSubclass(b1, b2);
      if (sub) matrix[b1][b2] = sub;
    }
  }
  return matrix;
})();

/**
 * Проверка, является ли ветка чужой для архетипа персонажа
 */
export function isCrossArchetype(prof: CharacterClass | string, branchKey: BranchKey): boolean {
  const branch = BRANCHES[branchKey];
  if (!branch) return false;
  const isPhysicalProf = prof === 'w' || prof === 'l';
  const isPhysicalBranch = branch.archetype === 'physical';
  return isPhysicalProf !== isPhysicalBranch;
}

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
