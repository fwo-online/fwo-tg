import RoundEmitter from 'node:events';
import config from '@/arena/config';

export enum RoundStatus {
  INIT = 'INIT',
  START_ROUND = 'START_ROUND',
  START_ORDERS = 'START_ORDERS',
  END_ORDERS = 'END_ORDERS',
  END_ROUND = 'END_ROUND',
}

interface Round {
  state: RoundStatus;
  round: number;
}

export type RoundTimeouts = Record<RoundStatus, number>;

export type RoundOptions = {
  timeouts?: Partial<RoundTimeouts>;
};

const defaultTimeoutsMap: RoundTimeouts = {
  [RoundStatus.INIT]: config.roundTimeout,
  [RoundStatus.START_ROUND]: config.roundTimeout / 2,
  [RoundStatus.START_ORDERS]: config.ordersTime,
  [RoundStatus.END_ORDERS]: config.roundTimeout / 2,
  [RoundStatus.END_ROUND]: config.roundTimeout / 2,
};

const ROUND_SERVICE_EVENT = 'Round';

/**
 * RoundService
 *
 * Конструктор раунда
 * @description Обработка раунда
 * @module Service/Round
 */
export class RoundService {
  private emitter = new RoundEmitter();
  count = 0;
  status = RoundStatus.INIT;
  timer?: Timer;
  timestamp = Date.now();
  timeouts: RoundTimeouts;

  constructor(options?: RoundOptions) {
    this.timeouts = Object.assign(structuredClone(defaultTimeoutsMap), options?.timeouts ?? {});
  }

  setTimeouts(timeouts: Partial<RoundTimeouts>) {
    this.timeouts = Object.assign(this.timeouts, timeouts);
  }

  /**
   * @description Возвращает объект с текущим состоянием раунда
   * @return объект последнего состояния рануда
   */
  get lastRound(): Round {
    return {
      state: this.status,
      round: this.count,
    };
  }

  private write(): void {
    this.emitter.emit(ROUND_SERVICE_EVENT, this.lastRound);
  }

  subscribe(listener: (data: Round) => void): void {
    this.emitter.on(ROUND_SERVICE_EVENT, listener);
  }

  unsubscribe() {
    this.emitter.removeAllListeners();
  }

  /**
   * @description Функция изменения состояний объекта
   * @param state строка нового состояния
   */
  private onNextState(status: RoundStatus = RoundStatus.INIT): void {
    console.debug('Round State:', status);

    this.timestamp = Date.now();
    this.status = status;
    clearTimeout(this.timer);

    switch (status) {
      case RoundStatus.INIT:
        this.nextState(RoundStatus.START_ROUND);
        break;
      case RoundStatus.START_ROUND:
        this.count += 1;
        this.nextState(RoundStatus.START_ORDERS);
        break;
      case RoundStatus.START_ORDERS:
        this.nextState(RoundStatus.END_ORDERS);
        break;
      case RoundStatus.END_ORDERS:
        this.nextState(RoundStatus.END_ROUND);
        break;
      case RoundStatus.END_ROUND:
        break;
      default:
        console.error('Unknown Round State', status);
    }

    this.write();
  }

  /**
   * goNext
   *
   * @description Функция изменения с одного состояния в другое
   * @param newState строка нового состояния перевод состояния
   * @param timeout число в мс, через которое следует выполнить
   */
  private nextState(newState: RoundStatus, timeout = this.timeouts[this.status]): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.onNextState(newState), timeout);
  }

  endOrders(): void {
    if (this.status === RoundStatus.START_ORDERS) {
      this.onNextState(RoundStatus.END_ORDERS);
    }
  }

  initRound(): void {
    this.nextState(RoundStatus.INIT);
  }

  nextRound(): void {
    this.nextState(RoundStatus.START_ROUND);
  }
}
