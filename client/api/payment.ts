import { client, createRequest } from '@/api';
import type { InvoiceType } from '@fwo/shared';

export const createInvoiceLink = (type: InvoiceType) =>
  createRequest(client.payment['create-invoice'].$post)({ json: { type } });
