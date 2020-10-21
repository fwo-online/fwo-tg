import type { Order } from '../OrderService';

export default class OrderError extends Error {
  constructor(public message: string, public order?: Order) {
    super(message);
    this.name = 'OrderError';
  }
}
