import arena from '@/arena';

const registerAttackAffects = () => {
  arena.actions.attack.preAffects = [
    arena.actions.protect,
    arena.skills.dodge,
    arena.skills.parry,
    arena.skills.disarm,
  ];
};

export const registerAffects = () => {
  registerAttackAffects();
};
