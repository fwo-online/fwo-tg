const MiscService = require('./MiscService');
/**
 * Сервис создания групп
 */
class Groups {
  /**
   * Конструктор группы
   * @param {Number} liderId charId пользователя создавшего группу
   */
  constructor(liderId) {
    this.id = MiscService.guid();
    this.lider = liderId;
    this.psr = 0;
    this.players = [];
    this.inQueue = false;
  }

  /**
   * Приглашение в группу
   * @param {Number} charId Id чара которого приглашают в группу
   */
  invite(charId) {
    // sendGroupInvite ? (groupLiderId ?)
    return charId || this;
  }

  add(charId) {
    return charId || this;
  }

  remove(charId) {
    return charId || this;
  }
}

module.exports = Groups;
