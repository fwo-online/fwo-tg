const CharModel = require('../models/character');

module.exports = {
  async check(tgId) {
    const resp = await CharModel.findOne({ tgId, deleted: false });
    return resp;
  },

  async checkNick(nickname) {
    const resp = CharModel.findOne({ nickname, deleted: false });
    return resp;
  },

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

    const newChar = new CharModel(h);
    await newChar.save();
  },

  async remove(tgId) {
    const resp = await CharModel.findOneAndDelete({ tgId });
    return resp;
  },
};
