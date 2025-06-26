import arena from '@/arena';

const registerAttackAffects = () => {
  arena.actions.attack.registerPreAffects([
    arena.magics.glitch,
    arena.magics.madness,
    arena.magics.paralysis,
    arena.magics.eclipse,
    arena.magics.sleep,
    arena.magics.magicWall,
    arena.skills.dodge,
    arena.skills.parry,
    arena.skills.disarm,
    arena.actions.staticProtect,
    arena.actions.protect,
    arena.actions.chopWeapon,
    arena.actions.healingWeapon,
    arena.actions.fatesMiss,
  ]);

  arena.actions.attack.registerPostAffects([arena.magics.lightShield, arena.actions.lacerate]);

  arena.actions.attack.registerAffectHandlers([
    arena.actions.cutWeapon,
    arena.actions.stunWeapon,
    arena.actions.rangeWeapon,
    arena.actions.thrustWeapon,
  ]);
};

const registerMagicAffects = () => {
  arena.magics.sleep.registerPreAffects([arena.actions.nightcall]);

  Object.values(arena.magics).forEach((magic) => {
    if (magic.name === 'bleeding') {
      return;
    }

    magic.registerPreAffects([
      arena.actions.silence,
      arena.actions.paralysis,
      arena.actions.glitch,
      arena.actions.divineWill,
    ]);
    magic.registerAffectHandlers([arena.actions.divineWill]);
  });
};

const registerSkillAffects = () => {
  Object.values(arena.skills).forEach((magic) => {
    magic.registerPreAffects([arena.magics.sleep, arena.actions.paralysis]);
  });
};

const registerHealAffects = () => {
  arena.actions.handsHeal.registerPreAffects([
    arena.magics.sleep,
    arena.actions.paralysis,
    arena.actions.attack,
  ]);
};

const registerProtectAffects = () => {
  arena.actions.protect.registerPreAffects([arena.magics.sleep, arena.actions.paralysis]);
};

export const registerAffects = () => {
  registerAttackAffects();
  registerMagicAffects();
  registerHealAffects();
  registerProtectAffects();
  registerSkillAffects();
};
