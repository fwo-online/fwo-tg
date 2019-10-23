const ee = require('events');
const { roundTimeout } = require('./config');

/**
 * Возвращаем timeStamp на момент запуска счетчика на стороне сервера
 * @return {number}
 */
function ts() {
  return Math.floor(Date.now() / 1000);
}

/**
 * RoundService
 *
 * Конструктор раунда
 * @description Обработка раунда
 * @module Service/Round
 * @todo переписать прототипы внутрь класса
 *
 */
class RoundConstructor extends ee {
  /**
   * Конструктор
   * */
  constructor() {
    super();
    this.count = 0;
    this.status = 'init';
  }

  /**
   * @description Возвращает обьект с текущим состоянием раунда
   * @return {Object} обьект последнего состояния рануда
   */
  get lastRound() {
    return {
      state: this.status, round: this.count,
    };
  }

  /**
   * @param {Object} data
   * */
  write(data) {
    this.emit('Round', data);
  }

  /**
   * Иницилизируем начало раунда
   */
  start() {
    this.status = 'starting';
    this.coun += 1;
    this.write({
      event: 'startRound',
      round: this.count,
      state: this.status,
      timestamp: ts(),
      timer: roundTimeout,
    });
    // eslint-disable-next-line no-console
    console.debug('RC debug:: start round:', this.count);
  }

  /**
   * Фаза заказов
   */
  orders() {
    this.status = 'orders';
    // Рассылаем всем состояние HP отправляем сервисное о старте раунда
    // eslint-disable-next-line no-console
    console.debug('Round State: orders');
    this.write({
      event: 'orders',
      round: this.count,
      state: this.status,
      timestamp: ts(),
      timer: roundTimeout,
    });
    this.goNext('waiting');
  }

  /**
   * Инициация окончания игры
   */
  end() {
    // Запускаем завершение раунда, и переход к следующему
    // сюда нужны таймауты проверки на end и т.п
    // eslint-disable-next-line no-console
    console.debug('RC debug:: end');
    this.status = 'ending';
    this.write({ event: 'endRound' });
  }

  /**
   * Расстылаем состояние об окончание order phase, приступаем к выполнению
   * engine function
   */
  engine() {
    this.status = 'engine';
    // eslint-disable-next-line no-console
    console.debug('Round State: waiting');
    this.write({ event: 'endOrders', round: this.count, state: this.status });
    this.write({ event: 'engine', round: this.count, state: this.status });
    this.goNext('ending');
  }

  /**
   * goNext
   * @description Функция изменения состояний обьекта
   * @param {String} newState строка нового состояния
   *
   */
  nextState(newState) {
    const state = newState || this.status;
    switch (state) {
      case 'init':
        // Состояние инициации раунда после создани игры
      // eslint-disable-next-line no-console
        console.debug('Round State: init');
        this.goNext('starting');
        break;
      case 'starting':
        // Начало рануда, pre-round
      // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
        console.debug('Round State: ending');
        this.end();
        break;

      default:
        // code
      // eslint-disable-next-line no-console
        console.error('Unknown Round State', state);
    }
  }

  /**
   * goNext
   *
   * @description Функция изменения с одного состояния в другое
   * @param {String} newState строка нового состояния перевод состояния
   * @param {Number} timeout  число в мс, через которое следует выполнить
   */
  goNext(newState, timeout) {
    const defaultTimer = timeout || roundTimeout;
    const self = this;
    const x = setTimeout(() => {
      self.nextState(newState);
      clearTimeout(x);
    }, defaultTimer);
  }
}

module.exports = RoundConstructor;