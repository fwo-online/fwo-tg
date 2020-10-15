// FIXME: Это кастылик для работы с JSON в обход запуска всей игры

const ORDERS = [
  {
    initiator: '5f7b495eb642e9201025109e', target: '5f7b495eb642e9201025109e', proc: 40, action: 'berserk',
  }, {
    initiator: '5e05ee58bdf83c6a5ff3f8dd', target: '5e05ee58bdf83c6a5ff3f8dd', proc: 20, action: 'dodge',
  }, {
    initiator: '5e05ee58bdf83c6a5ff3f8dd', target: '5e05ee58bdf83c6a5ff3f8dd', proc: 100, action: 'handsHeal',
  }];

module.exports = {
  orders: ORDERS,
};
