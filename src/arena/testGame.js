// FIXME: Это кастылик для работы с JSON в обход запуска всей игры

const ORDERS = [
  {
    initiator: '1', target: '2', proc: 100, action: 'attack',
  }, {
    initiator: '1', target: '1', proc: 100, action: 'protect',
  }, {
    initiator: '1', target: '1', proc: 20, action: 'dodge',
  }, {
    initiator: '1', target: '1', proc: 100, action: 'handsHeal',
  }];

module.exports = {
  orders: ORDERS,
};
