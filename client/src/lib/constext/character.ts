import type { Character } from '@fwo/shared';
import { createContext } from 'svelte';

export const [getCharacterContext, setCharactertContext] = createContext<() => Character>();
