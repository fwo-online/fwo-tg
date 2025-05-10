import { ActionService } from '@/arena/ActionService';
import type { OrderOutput } from '@/arena/OrderService';
import type { Order } from '@fwo/shared';

export const normalizeGameOrders = (orders: OrderOutput[]): Order[] => {
  return orders.map(({ id, target, proc, action }) => ({
    id,
    action: ActionService.toObject(action),
    target,
    power: proc,
  }));
};
