import { createInvoice } from '@/api/invoice';
import type { CharacterService } from '@/arena/CharacterService';
import type { Resources } from '@/arena/CharacterService/CharacterResources';
import ValidationError from '@/arena/errors/ValidationError';
import { checkNick } from '@/helpers/loginHelper';
import { handleValidationError } from '@/server/utils/handleValidationError';
import { InvoiceType, nameSchema } from '@fwo/shared';
import type { User } from '@telegram-apps/init-data-node';
import { HTTPException } from 'hono/http-exception';
import { safeParse } from 'valibot';

export class ServiceShop {
  static async getResetAttributesInvoice(user: User) {
    return createInvoice(user, InvoiceType.ResetAttributes);
  }

  static async resetAttributes(character: CharacterService, cost?: Partial<Resources>) {
    if (cost) {
      await character.resources.takeResources(cost);
    }
    await character.attributes.resetAttributes();
  }

  static async validateNickName(name: string) {
    if (await checkNick(name)) {
      throw new ValidationError('Этот ник уже существует');
    }

    const result = safeParse(nameSchema, name);

    try {
      handleValidationError(result);
    } catch (e) {
      if (e instanceof HTTPException) {
        throw new ValidationError(e.message);
      }
      console.error('validate nickname error:: ', e);
    }
  }

  static async getChangeNimeInvoice(user: User, name: string) {
    await this.validateNickName(name);

    return createInvoice(user, InvoiceType.ChangeName, { payload: name });
  }

  static async changeName(character: CharacterService, name: string, cost?: Partial<Resources>) {
    await this.validateNickName(name);

    if (cost) {
      await character.resources.takeResources(cost);
    }
    await character.changeNickname(name);
  }

  static async getDonationInvoice(user: User, amount: number) {
    return createInvoice(user, InvoiceType.Donation, { amount });
  }
}
