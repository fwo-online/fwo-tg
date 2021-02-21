const CharacterService = require('../arena/CharacterService');
const { profsData } = require('../data/profs');
const db = require('./dataBase');

module.exports = {
  /*
  @func проверка наличия персонажа у заданного tgId (пользователя телеги)
  @return Boolean
   */
  async check(tgId) {
    const re = await db.char.find({ tgId });
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
  /**
    @param {Number} tgId идентификатор телеграмма
    @param {import('../data/profs').Prof} prof id чара
  */
  async regChar(tgId, prof, nickname, sex) {
    if (!profsData[prof]) throw new Error('prof error');
    // eslint-disable-next-line no-return-await
    return await db.char.create({
      prof,
      sex,
      tgId,
      nickname,
      harks: profsData[prof].hark,
      magics: profsData[prof].mag,
    });
  },
  /*
  @func удаления
  @return Boolean
   */
  async remove(tgId) {
    const resp = await db.char.remove(tgId);
    return !!resp;
  },
  /**
   * @function
   * @return {Promise<CharacterService>} обьект персонажа
   */
  // eslint-disable-next-line consistent-return
  async getChar(tgId) {
    try {
      return await CharacterService.getCharacter(tgId);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  },
  // eslint-disable-next-line consistent-return
  async saveHarks(tgId, params) {
    try {
      const resp = await db.char.update(tgId, params);
      return !!resp;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  },
};
