const CharModel = require('../models/character');

module.exports = {
  async  check(id) {
    try {
      return await CharModel.findOne({ tgId: id, deleted: false });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  },
  async  regChar(tgId, prof, sex) {
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
    h.tgid = tgId;
    h.nickname = nickname;
    try {
      const newChar = new CharModel(h);
      await newChar.save();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }

  },

  async remove(id) {
    try {
      await CharModel.findOneAndDelete({ tgId: id });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  },
};
