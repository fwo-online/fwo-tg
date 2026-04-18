import { createContext } from 'svelte';
import type { GameState } from '$lib/game/utils/state';

export const [getGameContext, setGameContext] = createContext<GameState>();
