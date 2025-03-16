import arena from '@/arena';
import MatchMakingService from '@/arena/MatchMakingService';
import * as actions from '@/arena/actions';
import * as magics from '@/arena/magics';
import * as passiveSkills from '@/arena/passiveSkills';
import * as skills from '@/arena/skills';
import * as weaponMastery from '@/arena/weaponMastery';

export const registerGlobals = () => {
  arena.mm = MatchMakingService;
  arena.magics = magics;
  arena.skills = skills;
  arena.actions = { ...actions, ...magics, ...skills, ...passiveSkills, ...weaponMastery };
};
