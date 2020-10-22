export default class LearnError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = 'LearnError';
  }
}
