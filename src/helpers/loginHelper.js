const CharModel = require('../models/character');

async function checkId(id) {
  try {
    return await CharModel.findOne({ tgid: id });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
    return false;
  }
}

async function createNewChar(tgid, prof, sex, cb) {
  let h;
  switch (prof) {
    case 'Воин':
      h = {
        prof: 'w',
        str: 10,
        dex: 8,
        int: 3,
        wis: 3,
        inventory: [{
          code: 'waa',
          puton: true,
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
        inventory: [{
          code: 'wab',
          puton: true,
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
        inventory: [{
          code: 'wac',
          puton: true,
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
        inventory: [{
          code: 'wac',
          puton: true,
          place: 'a',
        }],
      };
      break;

    default:
      cb('prof error', null);
      break;
  }

  if (!h) return;

  h.sex = sex;
  h.tgid = tgid;
  h.nickname = tgid;

  try {
    const newChar = new CharModel(h);
    await newChar.save();
  } catch (e) {
  // eslint-disable-next-line no-console
    console.log(e);
  }
}

async function removeChar(id) {
  try {
    return await CharModel.findOneAndDelete({ tgid: id });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
    return false;
  }
}

module.exports.regChar = createNewChar;
module.exports.check = checkId;
module.exports.remove = removeChar;
