import type { Clan } from '@fwo/shared';
import { clanAcceptCostPerLvl, clanForgeCostMultiplier, clanLvlCost } from '@fwo/shared';
import { client, createRequest } from '$lib/api';
import { makeRequest } from '$lib/utils/make-request.svelte';
import { invalidate } from '$app/navigation';
import { getPopupContext } from '$lib/constext/popup';
import { getCharacterContext } from '$lib/constext/character';

let clanState = $state<Clan | undefined>(undefined);

export const clanStore = {
  get clan(): Clan {
    if (!clanState) throw new Error('Clan is not loaded');
    return clanState;
  },
  set clan(value: Clan | undefined) {
    clanState = value;
  },
};

export const useSyncClan = () => {
  const syncClan = async (newClan?: Clan) => {
    if (newClan) {
      clanState = newClan;
      return;
    }
    const clan = await createRequest(client.clan.$get)({});
    clanState = clan;
  };

  return { syncClan };
};

export const useClanOwner = () => {
  const characterCtx = getCharacterContext();
  const isOwner = $derived(
    characterCtx().id === clanState?.owner,
  );

  return { get isOwner() { return isOwner; } };
};

export const useClanCreate = () => {
  const popup = getPopupContext()();

  const create = async (name: string) => {
    await makeRequest(async () => {
      const clan = await createRequest(client.clan.$post)({ json: { name } });
      if (clan) {
        popup.info({ message: 'Клан создан' });
        await invalidate('app:character');
      }
    });
  };

  return { createClan: create };
};

export const useClans = () => {
  const popup = getPopupContext()();
  let isLoading = $state(false);

  const createRequestAction = async (id: string) => {
    isLoading = true;
    await makeRequest(() =>
      createRequest(client.clan[':id']['create-request'].$post)({ param: { id } }),
    );
    isLoading = false;
    popup.info({ message: 'Заявка успешно отправлена' });
  };

  const cancelRequestAction = async (id: string) => {
    isLoading = true;
    await makeRequest(() =>
      createRequest(client.clan[':id']['cancel-request'].$post)({ param: { id } }),
    );
    isLoading = false;
    popup.info({ message: 'Заявка успешно отменена' });
  };

  return {
    get isLoading() {
      return isLoading;
    },
    createRequest: createRequestAction,
    cancelRequest: cancelRequestAction,
  };
};

export const useClanGold = () => {
  const { syncClan } = useSyncClan();

  const addGold = async (gold: number) => {
    const updated = await makeRequest(() =>
      createRequest(client.clan['add-gold'].$post)({ json: { gold } }),
    );
    if (updated) syncClan(updated);
    await invalidate('app:character');
  };

  return { addGold };
};

export const useClanLvl = () => {
  const { syncClan } = useSyncClan();
  const popup = getPopupContext()();

  const upgradeLvl = (lvl: number) => {
    popup.confirm({
      message: `Стоимость следующего уровня ${clanLvlCost[lvl]}💰`,
      onConfirm: async () => {
        const updated = await makeRequest(() =>
          createRequest(client.clan['upgrade-lvl'].$post)({}),
        );
        if (updated) syncClan(updated);
      },
    });
  };

  return { upgradeLvl };
};

export const useClanForgeOpen = () => {
  const { syncClan } = useSyncClan();
  const popup = getPopupContext()();

  const openForge = () => {
    const c = clanState;
    if (!c) return;
    popup.confirm({
      title: 'Открыть кузницу?',
      message: `Стоимость открытия ${clanLvlCost[c.lvl - 1] * clanForgeCostMultiplier}💰. Кузница закроется через месяц`,
      onConfirm: async () => {
        const updated = await makeRequest(() =>
          createRequest(client.clan.forge.open.$post)({}),
        );
        if (updated) syncClan(updated);
      },
    });
  };

  return { openForge };
};

export const useClanRequest = () => {
  const { syncClan } = useSyncClan();
  const popup = getPopupContext()();

  const acceptRequest = (requester: { id: string; lvl: number }) => {
    popup.confirm({
      message: `Стоимость принятия заявки ${requester.lvl * clanAcceptCostPerLvl}💰`,
      onConfirm: async () => {
        const updated = await makeRequest(() =>
          createRequest(client.clan.accept[':id'].$post)({ param: { id: requester.id } }),
        );
        if (updated) syncClan(updated);
      },
    });
  };

  const rejectRequest = async (requester: { id: string }) => {
    const updated = await makeRequest(() =>
      createRequest(client.clan.reject[':id'].$post)({ param: { id: requester.id } }),
    );
    if (updated) syncClan(updated);
  };

  return { acceptRequest, rejectRequest };
};
