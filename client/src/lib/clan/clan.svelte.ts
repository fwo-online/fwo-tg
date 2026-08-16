import type { CharacterPublic } from '@fwo/shared';
import { clanAcceptCostPerLvl, clanForgeCostMultiplier, clanLvlCost } from '@fwo/shared';
import { invalidate } from '$app/navigation';
import { client, createRequest } from '$lib/api';
import { popup } from '$lib/components/Popup/popup.svelte';
import { createRequestRunner } from '$lib/utils/create-request.svelte';

export const createClan = createRequestRunner(async (name: string) => {
  const clan = await createRequest(client.clan.$post)({ json: { name } });
  if (clan) {
    popup.info({ message: 'Клан создан' });
    await invalidate('app:clans');
    await invalidate('app:character');
  }
});

export const createClanRequest = createRequestRunner(async (id: string) => {
  await createRequest(client.clan[':id']['create-request'].$post)({ param: { id } });
  await invalidate('app:clans');

  popup.info({ message: 'Заявка успешно отправлена' });
});

export const cancelClanRequest = createRequestRunner(async (id: string) => {
  await createRequest(client.clan[':id']['cancel-request'].$post)({ param: { id } });

  await invalidate('app:clans');

  popup.info({ message: 'Заявка успешно отменена' });
});

export const addClanGold = createRequestRunner(async (gold: number) => {
  await createRequest(client.clan['add-gold'].$post)({ json: { gold } });

  await invalidate('app:clan');
  await invalidate('app:character');

  popup.info({ message: `Добавлено ${gold}💰` });
});

export const upgradeClanLvl = createRequestRunner(async () => {
  await createRequest(client.clan['upgrade-lvl'].$post)({});
  await invalidate('app:clan');

  popup.info({ message: 'Уровень клана повышен' });
});

export const openClanForge = createRequestRunner(async () => {
  await createRequest(client.clan.forge.open.$post)({});
  await invalidate('app:clan');

  popup.info({ message: 'Кузница открыта' });
});

export const acceptClanRequest = createRequestRunner(async (requester: CharacterPublic) => {
  await createRequest(client.clan.accept[':id'].$post)({ param: { id: requester.id } });
  await invalidate('app:clan');

  popup.info({ message: `${requester.name} принят в клан` });
});

export const rejectClanRequest = createRequestRunner(async (requester: CharacterPublic) => {
  await createRequest(client.clan.reject[':id'].$post)({ param: { id: requester.id } });
  await invalidate('app:clan');

  popup.info({ message: `${requester.name} не принят в клан` });
});
