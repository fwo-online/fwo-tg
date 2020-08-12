import { Stage } from 'telegraf';
import { SceneContextMessageUpdate, BaseScene } from 'telegraf/typings/stage';
import greeter from './greeter';
import create from './create';
import lobby from './lobby';
import setNick from './setNick';
import profile from './profile';
import battleScene from './battle';
import inventoryScene from './inventory';
import shopScene from './shop';
import settingScene from './settings';
import magicScene from './magics';
import harksScene from './harks';
import skillsScene from './skills';
import clanScene from './clan';
import createClanScene from './createClan';
import Char from '../arena/CharacterService';

export type Session = {
  session: {
    character: Char;
  }
}

export type BaseGameContext = SceneContextMessageUpdate & Session

export type BaseGameScene = BaseScene<BaseGameContext>

const stage = new Stage([
  greeter,
  create,
  lobby,
  setNick,
  profile,
  inventoryScene,
  shopScene,
  settingScene,
  magicScene,
  harksScene,
  skillsScene,
  clanScene,
  createClanScene,
  battleScene,
]);
const { leave } = Stage;

// Глобальная команда выхода из сцен
stage.command('cancel', leave());
// Scene registration

export default stage;
