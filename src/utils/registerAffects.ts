import arena from '@/arena';

const registerAttackAffects = () => {
  arena.actions.attack.registerPreAffects([
    arena.actions.protect,
    arena.skills.dodge,
    arena.skills.parry,
    arena.skills.disarm,
    arena.magics.paralysis,
    arena.magics.eclipse,
    arena.magics.sleep,
  ]);

  arena.actions.attack.registerPostAffects([
    arena.magics.lightShield,
  ]);
};

const registerMagicAffects = () => {
  Object.values(arena.magics).forEach((magic) => {
    magic.registerPreAffects([
      arena.magics.silence,
    ]);
  });
};

const registerSkillAffects = () => {
  Object.values(arena.skills).forEach((magic) => {
    magic.registerPreAffects([
      arena.magics.sleep,
    ]);
  });
};

const registerHealAffects = () => {
  arena.actions.handsHeal.registerPreAffects([
    arena.actions.attack,
    arena.magics.sleep,
  ]);
};

const registerProtectAffects = () => {
  arena.actions.protect.registerPreAffects([
    arena.magics.sleep,
  ]);
};

export const registerAffects = () => {
  registerAttackAffects();
  registerMagicAffects();
  registerHealAffects();
  registerProtectAffects();
  registerSkillAffects();
};
