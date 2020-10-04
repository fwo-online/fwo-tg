import { Stage } from 'telegraf';
import { SceneContextMessageUpdate, BaseScene } from 'telegraf/typings/stage';
import Char from '../arena/CharacterService';
import battleScene from './battle';
import clanScene from './clan';
import create from './create';
import createClanScene from './createClan';
import greeter from './greeter';
import harksScene from './harks';
import inventoryScene from './inventory';
import lobby from './lobby';
import magicScene from './magics';
import profile from './profile';
import setNick from './setNick';
import settingScene from './settings';
import shopScene from './shop';
import skillsScene from './skills';

export type Session = {
  session: {
    character: Char;
  }
}

export type BaseGameContext = SceneContextMessageUpdate & Session

export type BaseGameScene = BaseScene<BaseGameContext>

const stage = new Stage([
  battleScene,
  clanScene,
  create,
  createClanScene,
  greeter,
  inventoryScene,
  harksScene,
  lobby,
  magicScene,
  profile,
  setNick,
  settingScene,
  shopScene,
  skillsScene,
]);
const { leave } = Stage;

// Глобальная команда выхода из сцен
stage.command('cancel', leave());
// Scene registration

export default stage;
