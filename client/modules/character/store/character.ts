import type { Character, Clan } from '@fwo/shared';
import { createStore } from 'solid-js';

// import { createStore } from 'solid-js/store';

const [state, setState] = createStore<{
  character?: Character;
}>({});

export const characterStore = {
  state,

  setCharacter(character?: Character) {
    setState(() => {
      character;
    });
  },

  setGame(game?: string) {
    if (!state.character) return;

    setState((state) => {
      state.character!.game = game;
    });
  },

  setTower(tower?: string) {
    if (!state.character) return;

    setState((state) => {
      state.character!.tower = tower;
    });
  },

  setForest(forest?: string) {
    if (!state.character) return;

    setState((state) => {
      state.character!.forest = forest;
    });
  },

  setClan(clan: Clan) {
    if (!state.character) return;

    setState((state) => {
      state.character!.clan = clan;
    });
  },
};

export function useCharacter(): Character {
  if (!state.character) {
    throw new Error('Character is not loaded');
  }

  return state.character;
}
