const {
  findCharacter, createCharacter, removeCharacter, updateCharacter,
} = require('@/api/character');
const { default: CharacterService } = require('../arena/CharacterService');
const { profsData } = require('../data/profs');

module.exports = {
  /*
  @func проверка наличия персонажа у заданного tgId (пользователя телеги)
  @return Boolean
   */
  async check(tgId) {
    const re = await findCharacter({ tgId });
    return !!re;
  },
  /*
  @func проверка ника
  @return Boolean Наличие живого ника в базе
   */
  async checkNick(nickname) {
    const re = await findCharacter({ nickname });
    return !!re;
  },
  /**
    @param {Number} tgId идентификатор телеграмма
    @param {import('../data/profs').Prof} prof id чара
  */
  async regChar(tgId, prof, nickname, sex) {
    if (!profsData[prof]) throw new Error('prof error');
    return createCharacter({
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
    const resp = await removeCharacter(tgId);
    return !!resp;
  },
  /**
   * @function
   * @return {Promise<CharacterService>} объект персонажа
   */
  async getChar(tgId) {
    try {
      return await CharacterService.getCharacter(tgId);
    } catch (e) {
      console.log(e);
    }
  },
  async saveHarks(tgId, params) {
    try {
      const resp = await updateCharacter(tgId, params);
      return !!resp;
    } catch (e) {
      console.log(e);
    }
  },
};
