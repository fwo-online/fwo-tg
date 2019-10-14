const db = require('./dataBase');

module.exports = {
  /*
  @func проверка наличия персонажа у заданного tgId (пользователя телеги)
  @return Boolean
   */
  async check(tgId) {
    const re = await db.char.find(tgId);
    return !!re;
  },
  /*
  @func проверка ника
  @return Boolean Наличие живого ника в базе
   */
  async checkNick(nickname) {
    const re = await db.char.findNick(nickname);
    return !!re;
  },
  /*
  @func регистрация чара
  @param {Number} tgId идентификатор телеграмма
  @param {String} prof id чара
   */
  async regChar(tgId, prof, nickname, sex) {
    let h;
    switch (prof) {
      case 'Воин':
        h = {
          prof: 'w',
          str: 10,
          dex: 8,
          int: 3,
          wis: 3,
          inventory: [
            {
              code: 'waa',
              putOn: true,
              place: 'a',
            }],
        };
        break;

      case 'Лучник':
        h = {
          prof: 'l',
          str: 3,
          dex: 8,
          int: 10,
          wis: 3,
          inventory: [
            {
              code: 'wab',
              putOn: true,
              place: 'a',
            }],
        };
        break;

      case 'Маг':
        h = {
          prof: 'm',
          str: 3,
          dex: 3,
          int: 8,
          wis: 10,
          mag: {
            magic_arrow: 1,
          },
          inventory: [
            {
              code: 'wac',
              putOn: true,
              place: 'a',
            }],
        };
        break;

      case 'Лекарь':
        h = {
          prof: 'p',
          str: 3,
          dex: 3,
          int: 10,
          wis: 8,
          mag: {
            light_heal: 1,
          },
          inventory: [
            {
              code: 'wac',
              putOn: true,
              place: 'a',
            }],
        };
        break;

      default:
        // eslint-disable-next-line no-console
        console.log('prof error');
        break;
    }

    if (!h) return;
    h.sex = sex;
    h.tgId = tgId;
    h.nickname = nickname;
    db.char.create(h);
  },
  /*
  @func удаления
  @return Boolean
   */
  async remove(tgId) {
    const resp = await db.char.remove(tgId);
    return !!resp;
  },
};
