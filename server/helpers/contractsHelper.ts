import { resetAllContracts } from '@/api/contracts';
import arena from '@/arena';

export const scheduleResetContracts = async () => {
  await Bun.cron('@daily', async () => {
    await resetAllContracts();

    // Сброс кеша арены
    Object.values(arena.characters).forEach((c) => {
      c.charObj.contracts = [];
      c.charObj.contractsGeneratedAt = null;
    });
  });
};
