import { ItemWear } from '@fwo/shared';
import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param: string): param is ItemWear => {
  return Object.values(ItemWear).some((wear) => wear === param);
}) satisfies ParamMatcher;
