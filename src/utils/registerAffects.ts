import arena from '@/arena';

const registerAttackAffects = () => {
  arena.actions.attack.registerPreAffects([
    arena.actions.protect,
    arena.skills.dodge,
    arena.skills.parry,
    arena.skills.disarm,
    arena.magics.paralysis,
    arena.magics.eclipse,
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

const registerHealAffects = () => {
  arena.actions.handsHeal.registerPreAffects([arena.actions.attack]);
};

export const registerAffects = () => {
  registerAttackAffects();
  registerMagicAffects();
  registerHealAffects();
};
