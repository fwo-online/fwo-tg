export default class OrderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderError';
    this.message = message;
  }
}
