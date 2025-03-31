import { type PreOrder, PreOrderModel } from '@/models/preOrder';

export const createPreOrder = async (preOrder: Partial<PreOrder>) => {
  await PreOrderModel.create(preOrder);
};
