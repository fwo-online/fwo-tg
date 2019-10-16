module.exports = {

  /**
   * Возвращает обьект со списком чаров для UI
   * @param {Number} userId Идентификатор пользователя (не чара)
   * @return {Promise}
   */
  charList: async function(userId) {
    let resUser = {};
    let userObj = await User.findOne({
      id: userId,
    }).populate('chars');
    for (let i = 0; i < 3; i++) {
      resUser['char' + [i]] = userObj.chars[i] || '';
    }
    return resUser;
  }, /**
   * Проверяем доступен ли данный чар для этого пользователя
   * @param {Number} charId имя пользователя
   * @param {Number} userId Идентификатор пользователя (не чара)
   * @return {Boolean}
   */
  charCheck: async(charId, userId) => {
    let charObj = await Character.findOne({
      id: charId,
    });
    return charObj.login === userId;
  }, /**
   * Проверка max кол-ва создаваемых персонажей для аккаунта
   * @param {Number} userId ID аккаунта
   */
  canCreateChar: async(userId) => {
    let len = await Character.find({
      login: userId,
    });
    if (len.length > 2) throw new Error('x3');
  }, /**
   * @description Удаляем чар и связанные таблицы
   * @param {Number} charId ID персонажа
   * @param {Number} userId ID аккаунта
   */
  delChar: async(charId, userId) => {
    await CharService.charCheck(charId, userId);
    await Character.destroy({
      id: charId,
    });
    await Inventory.destroy({
      id: charId,
    });
  }, /**
   * Функция выбора чара для последующего перехода в world
   * @param {Number} charId ID персонажа
   * @todo нужно вынести сюда отдельную функцию выбора чара
   */
  selectChar: function(charId) {

  }, /**
   * @description Функция создания чара
   * @param {String} nick имя персонажа
   * @param {String} prof профа персонажа
   * @param {String} sex пол персонажа
   * @param {String} userId id пользователя
   * @return {Object} Обьект созданного персонажа
   */
  regChar: async(nick, prof, sex, userId) => {
    let h = MiscService['prof'][prof];
    h.nickname = nick;
    h.sex = sex;
    h.login = userId;
    let newCharObj = await Character.create(h);
    await Inventory.firstCreate(newCharObj.id, h.prof);
    return newCharObj;
  },
};
