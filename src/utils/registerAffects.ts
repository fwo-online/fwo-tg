import arena from '@/arena';

const registerAttackAffects = () => {
  arena.actions.attack.preAffects = [
    arena.actions.protect,
    arena.skills.dodge,
    arena.skills.parry,
    arena.skills.disarm,
  ];

  arena.actions.attack.postAffects = [/** postAffects */];
};

const registerHealAffects = () => {
  arena.actions.handsHeal.preAffects = [
    arena.actions.attack,
  ];
};

const registerMagicAffects = () => {
  Object.values(arena.magics).forEach((magic) => {
    magic.preAffects = [
      arena.magics.silence,
    ];

    magic.postAffects = [/** postAffects */];
  });
};

export const registerAffects = () => {
  registerAttackAffects();
  registerHealAffects();
  registerMagicAffects();
};
