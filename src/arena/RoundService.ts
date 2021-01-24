import ee from 'events';
import config from './config';

export type RoundStatus = 'init' | 'starting' | 'orders' | 'ending' | 'engine' | 'waiting' | 'timeout';

export type RoundEvent = 'startRound' | 'endRound' | 'engine' | 'orders' | 'endOrders'

export interface GlobalFlags {
  isEclipsed?: boolean;
}

export interface Round {
  state?: RoundStatus;
  round?: number;
  event: RoundEvent;
}

export type LastRound = Omit<Round, 'event'>;

type RoundServiceEvent = 'Round';

export interface RoundService {
  on(event: RoundServiceEvent, listener: (data: Round) => void): this;
  emit(event: RoundServiceEvent, data: Round): boolean;
}
/**
 * RoundService
 *
 * Конструктор раунда
 * @description Обработка раунда
 * @module Service/Round
 */
export class RoundService extends ee {
  count = 0;
  status: RoundStatus = 'init';
  flags: {
    noDamageRound: number;
    global: GlobalFlags;
  }
  /**
   * Конструктор
   */
  constructor() {
    super();
    this.flags = {
      noDamageRound: 0,
      global: {},
    };
  }

  /**
   * @description Возвращает обьект с текущим состоянием раунда
   * @return обьект последнего состояния рануда
   */
  get lastRound(): LastRound {
    return {
      state: this.status, round: this.count,
    };
  }

  /**
   * @param data
   */
  write(data: Round): void {
    this.emit('Round', data);
  }

  /**
   * Иницилизируем начало раунда
   */
  start(): void {
    this.status = 'starting';
    this.count += 1;
    this.write({
      event: 'startRound',
      round: this.count,
      state: this.status,
    });
    console.debug('RC debug:: start round:', this.count);
  }

  /**
   * Фаза заказов
   */
  orders(): void {
    this.status = 'orders';
    // Рассылаем всем состояние HP отправляем сервисное о старте раунда
    console.debug('Round State: orders');
    this.write({
      event: 'orders',
      round: this.count,
      state: this.status,
    });
    this.goNext('waiting', config.ordersTime);
  }

  /**
   * Инициация окончания игры
   */
  end(): void {
    // Запускаем завершение раунда, и переход к следующему
    // сюда нужны таймауты проверки на end и т.п
    console.debug('RC debug:: end');
    this.status = 'ending';
    this.write({ event: 'endRound' });
  }

  /**
   * Расстылаем состояние об окончание order phase, приступаем к выполнению
   * engine function
   */
  engine(): void {
    this.status = 'engine';
    console.debug('Round State: waiting');
    this.write({ event: 'endOrders', round: this.count, state: this.status });
    this.write({ event: 'engine', round: this.count, state: this.status });
    this.goNext('ending');
  }

  /**
   * goNext
   * @description Функция изменения состояний обьекта
   * @param state строка нового состояния
   */
  nextState(state: RoundStatus = 'init'): void {
    switch (state) {
      case 'init':
        // Состояние инициации раунда после создани игры
        console.debug('Round State: init');
        this.goNext('starting');
        break;
      case 'starting':
        // Начало рануда, pre-round
        console.debug('Round State: starting');
        this.start();
        this.goNext('orders');
        break;
      case 'orders':
        this.orders();
        break;
      case 'waiting':
        // code
        this.engine();
        break;
      case 'timeout':
        // code
        break;
      case 'ending':
        console.debug('Round State: ending');
        this.end();
        break;

      default:
        // code
        console.error('Unknown Round State', state);
    }
  }

  /**
   * goNext
   *
   * @description Функция изменения с одного состояния в другое
   * @param newState строка нового состояния перевод состояния
   * @param timeout число в мс, через которое следует выполнить
   */
  goNext(newState: RoundStatus, timeout = config.roundTimeout): void {
    const x = setTimeout(() => {
      this.nextState(newState);
      clearTimeout(x);
    }, timeout);
  }
}
