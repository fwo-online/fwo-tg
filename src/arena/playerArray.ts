import _, { Dictionary } from 'lodash';
import Player from './PlayerService';

export default class PlayersArr {
  init: string[];
  arr: Player[] = [];
  /**
   * Конструктор объекта
   * @param arr [charId,charId,...]
   */
  constructor(arr: string[]) {
    this.init = arr;
  }

  /**
   * round_json
   * @description JSON пользователей нужно хратить в определенном формате
   * @return userjson Объект на начало игры
   * @todo переделать это, убрать внутрь конструктора playersArr
   */
  async roundJson(): Promise<Dictionary<Player>> {
    const result = await Promise.all(
      this.init.map((p) => Player.loading(p)),
    );
    this.arr = result;
    return _.keyBy(result, 'id');
  }

  /**
   * Функция вернет массив игроков в моей тиме
   * @param clan объект клана
   */
  getMyTeam(player: Player): Player[] {
    const { clan } = player;
    if (!clan?.id) return [];
    return this.arr.filter((p) => p.clan?.id === clan.id);
  }

  /**
  * Функция возвращает рандомного игрока из массива живых
  * @return
  */
  get randomAlive(): Player {
    const alive = _.filter(this.arr, {
      alive: true,
    });
    return alive[Math.floor(Math.random() * alive.length)];
  }
}
