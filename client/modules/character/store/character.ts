import type { Character, Clan } from '@fwo/shared';
import { createSignal, createStore } from 'solid-js';

export const [character, setCharacter] = createSignal<Character>();

// const [state, setState] = createStore<{
//   character?: Character;
// }>({});

// export const characterStore = {
//   state,

//   setCharacter(character?: Character) {
//     setState((state) => {
//       state.character = character;
//     });
//   },
//   patchCharacter(fn: (character: Character) => void) {
//     setState((state) => {
//       if (!state.character) return;
//       fn(state.character);
//     });
//   },
//   setGame(game?: string) {
//     this.patchCharacter((c) => {
//       c.game = game;
//     });
//   },
//   setTower(tower?: string) {
//     this.patchCharacter((c) => {
//       c.tower = tower;
//     });
//   },
//   setForest(forest?: string) {
//     this.patchCharacter((c) => {
//       c.forest = forest;
//     });
//   },
//   setClan(clan: Clan) {
//     this.patchCharacter((c) => {
//       c.clan = clan;
//     });
//   },
// };

export function getCharacter(): Character {
  if (!character()) {
    throw new Error('Character is not loaded');
  }

  return character();
}
