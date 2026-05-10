import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { claimContract, replaceContract, saveContracts } from '@/api/contracts';
import { ContractService } from '@/arena/ContractService/ContractService';
import { characterMiddleware, userMiddleware } from './middlewares';

export const contracts = new Hono()
  .use(userMiddleware)
  .use(characterMiddleware)
  .get('/', async (c) => {
    const character = c.get('character');

    // Ленивая генерация — если новый день
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const generatedAt = character.charObj.contractsGeneratedAt;

    if (!generatedAt || new Date(generatedAt) < today) {
      const newContracts = ContractService.generateContracts(character);
      await saveContracts(character.id, newContracts, new Date());
      character.charObj.contracts = newContracts;
      character.charObj.contractsGeneratedAt = new Date();
    }

    return c.json(character.charObj.contracts ?? [], 200);
  })
  .post('/:idx/claim', async (c) => {
    const character = c.get('character');
    const idx = parseInt(c.req.param('idx'), 10);

    if (Number.isNaN(idx) || idx < 0 || idx > 2) {
      throw new HTTPException(400, { message: 'Неверный индекс контракта' });
    }

    const charContracts = character.charObj.contracts;
    if (!charContracts || !charContracts[idx]) {
      throw new HTTPException(404, { message: 'Контракт не найден' });
    }

    const contract = charContracts[idx];
    if (contract.claimed) {
      throw new HTTPException(400, { message: 'Награда уже получена' });
    }
    if (contract.progress < contract.goal) {
      throw new HTTPException(400, { message: 'Контракт не выполнен' });
    }

    const updatedChar = await claimContract(
      character.id,
      idx,
      [...charContracts], // передаём копию in-memory контрактов (с актуальным прогрессом)
      {
        exp: contract.exp,
        gold: contract.gold,
        components: contract.components,
      },
    );

    // Синхронизировать состояние
    character.charObj.contracts = updatedChar.contracts;
    character.charObj.exp = updatedChar.exp;
    character.charObj.gold = updatedChar.gold;
    character.charObj.components = updatedChar.components;

    return c.json(character.toObject(), 200);
  })
  .post('/:idx/replace', async (c) => {
    const idx = parseInt(c.req.param('idx'), 10);
    try {
      await replaceContract(c.get('character').id, idx);
      return c.json({}, 200);
    } catch {
      return c.json({ error: 'Not implemented' }, 501);
    }
  });
