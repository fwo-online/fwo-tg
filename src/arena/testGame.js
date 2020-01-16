// FIXME: Это кастылик для работы с JSON в обход запуска всей игры

const ORDERS = [
  {
    initiator: '5e05ee58bdf83c6a5ff3f8dd', target: '5e05ee58bdf83c6a5ff3f8dd', proc: 100, action: 'protect',
  }, {
    initiator: '5e05ee58bdf83c6a5ff3f8dd', target: '5e05ee58bdf83c6a5ff3f8dd', proc: 20, action: 'dodge',
  }, {
    initiator: '5e05ee58bdf83c6a5ff3f8dd', target: '5e05ee58bdf83c6a5ff3f8dd', proc: 100, action: 'handsHeal',
  }];

module.exports = {
  orders: ORDERS,
};
