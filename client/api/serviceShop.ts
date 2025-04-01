import { client, createRequest } from '@/api';
import { InvoiceType } from '@fwo/shared';

export const resetAttributes = () =>
  createRequest(client.serviceShop.purchase[':type'].$post)({
    param: { type: InvoiceType.ResetAttributes },
  });
