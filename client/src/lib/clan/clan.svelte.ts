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
});

export const upgradeClanLvl = createRequestRunner(async (lvl: number) => {
  await new Promise((resolve, reject) => {
    popup.confirm({
      message: `Стоимость следующего уровня ${clanLvlCost[lvl]}💰`,
      onConfirm: async () => {
        try {
          await createRequest(client.clan['upgrade-lvl'].$post)({});
          resolve(true);
        } catch (e) {
          reject(e);
        }
      },
      onCancel: () => {
        reject();
      },
    });
  }).then(async () => {
    await invalidate('app:clan');
  });
});

export const openClanForge = createRequestRunner(async (clanLvl: number) => {
  await new Promise((resolve, reject) => {
    popup.confirm({
      title: 'Открыть кузницу?',
      message: `Стоимость открытия ${clanLvlCost[clanLvl - 1] * clanForgeCostMultiplier}💰. Кузница закроется через месяц`,
      onConfirm: async () => {
        try {
          await createRequest(client.clan.forge.open.$post)({});
          resolve(true);
        } catch (e) {
          reject(e);
        }
      },
      onCancel: () => {
        reject();
      },
    });
  }).then(async () => {
    await invalidate('app:clan');
  });
});

export const acceptClanRequest = createRequestRunner(async (requester: CharacterPublic) => {
  await new Promise((resolve, reject) => {
    popup.confirm({
      message: `Стоимость принятия заявки ${requester.lvl * clanAcceptCostPerLvl}💰`,
      onConfirm: async () => {
        try {
          createRequest(client.clan.accept[':id'].$post)({ param: { id: requester.id } });
          resolve(true);
        } catch (e) {
          reject(e);
        }
      },
      onCancel: () => {
        reject();
      },
    });
  })
    .then(async () => {
      await invalidate('app:clan');
    })
    .catch(() => {});
});

export const rejectClanRequest = createRequestRunner(async (requester: CharacterPublic) => {
  await createRequest(client.clan.reject[':id'].$post)({ param: { id: requester.id } });
  await invalidate('app:clan');
});
