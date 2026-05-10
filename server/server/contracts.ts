import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import * as v from 'valibot';
import { replaceContract, saveContracts } from '@/api/contracts';
import { ContractService } from '@/arena/ContractService/ContractService';
import { handleValidationError } from '@/server/utils/handleValidationError';
import { withValidation } from '@/server/utils/withValidation';
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
      const date = new Date();
      await saveContracts(character.id, newContracts, date);
      character.quests.setContracts(newContracts, date);
    }

    return c.json(character.charObj.contracts ?? [], 200);
  })
  .post(
    '/:idx/claim',
    vValidator(
      'param',
      v.object({ idx: v.pipe(v.any(), v.transform(Number), v.number()) }),
      handleValidationError,
    ),
    async (c) => {
      const character = c.get('character');
      const { idx } = c.req.valid('param');

      withValidation(ContractService.claimContract(character, idx));

      return c.json({}, 200);
    },
  )
  .post('/:idx/replace', async (c) => {
    const idx = parseInt(c.req.param('idx'), 10);
    try {
      await replaceContract(c.get('character').id, idx);
      return c.json({}, 200);
    } catch {
      return c.json({ error: 'Not implemented' }, 501);
    }
  });
