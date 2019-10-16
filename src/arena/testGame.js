// FIXME: Это кастылик для работы с JSON в обход запуска всей игры

const ORDERS = [
  {
    initiator: '1', target: '2', proc: 100, action: 'attack',
  }, {
    initiator: '1', target: '1', proc: 100, action: 'protect',
  }, {
    initiator: '2', target: '1', proc: 20, action: 'silence',
  }, {
    initiator: '1', target: '2', proc: 100, action: 'chainLightning',  
  }, {
    initiator: '1', target: '2', proc: 100, action: 'regen',
  }, {
    initiator: '2', target: '1', proc: 20, action: 'magicArrow',
  }, {
    initiator: '2', target: '2', proc: 20, action: 'smallAura',
  }, {
    initiator: '2', target: '2', proc: 100, action: 'smallAura',
  }, {
    initiator: '2', target: '1', proc: 100, action: 'handsHeal',
  }, {
    initiator: '1', target: '1', proc: 100, action: 'handsHeal',
  }, {
    initiator: '2', target: '1', proc: 100, action: 'frostTouch',
  }, {
    initiator: '2', target: '1', proc: 15, action: 'frostTouch',
  }, {
    initiator: '2', target: '1', proc: 100, action: 'rockfall',
  }, {
    initiator: '1', target: '1', proc: 10, action: 'berserk',
  }];

module.exports = {
  orders: ORDERS,
};
