import {
  describe, beforeEach, it, expect,
} from 'bun:test';
import { times } from 'lodash';
import arena from '@/arena';
import type { Clan } from '@/models/clan';
import TestUtils from '@/utils/testUtils';
import { CharacterService } from '../CharacterService';
import Player from './PlayerService';
import PlayersService from './PlayersService';
import { reservedClanName } from '@fwo/shared';

// npm t src/arena/PlayersService/PlayersService.test.ts

describe('PlayerService', () => {
  let characters: CharacterService[] = [];
  let players: PlayersService;
  let clans: Clan[] = [];

  beforeEach(async () => {
    const chars = await Promise.all(times(9, () => TestUtils.createCharacter()));
    const charIds = chars.map(({ id }) => id);

    arena.characters = {};

    clans = await Promise.all([
      await TestUtils.createClan(charIds[0], { players: [charIds[1], charIds[2]] }),
      await TestUtils.createClan(charIds[3], { players: [charIds[4]] }),
      await TestUtils.createClan(charIds[5]),
    ]);

    characters = await Promise.all(charIds.map((id) => CharacterService.getCharacterById(id)));
    players = new PlayersService(characters.map(({ id }) => id));
  });

  it('should get random alive', () => {
    expect(players.randomAlive).toBeInstanceOf(Player);
  });

  it('should filter by dead/alive players', () => {
    expect(players.alivePlayers).toHaveLength(characters.length);
    expect(players.deadPlayers).toHaveLength(0);
  });

  it('should participate by clan', () => {
    const {[reservedClanName]: withoutClan, ...withClan} = players.groupByClan()

    expect(withoutClan).toHaveLength(3);
    expect(withClan).toMatchObject({
      [clans[0].name]: [
        { id: characters[0].id }, { id: characters[1].id }, { id: characters[2].id },
      ],
      [clans[1].name]: [
        { id: characters[3].id }, { id: characters[4].id },
      ],
      [clans[2].name]: [
        { id: characters[5].id },
      ],
    });
  });

  it('should participate alive by clan', () => {
    players.players[7].setDead();
    players.players[5].setDead();
    players.players[3].setDead();
    players.players[1].setDead();

    const {[reservedClanName]: withoutClan, ...withClan} = players.groupByClan(players.alivePlayers)

    expect(withoutClan).toHaveLength(2);
    expect(withClan).toMatchObject({
      [clans[0].name]: [{ id: characters[0].id }, { id: characters[2].id }],
      [clans[1].name]: [{ id: characters[4].id }],
    });
  });

  it('should reset stats', () => {
    const player = players.randomAlive;
    player.setProc(10);
    player.stats.set('exp', 10);
    player.flags.isMad = true;

    expect(player.proc).toBe(10);
    expect(player.stats.val('exp')).toBe(10);

    players.reset();
    expect(player.proc).toBe(100);
    expect(player.stats.val('exp')).toBe(0);
    expect(player.flags.isMad).toBe(false);
  });

  it('should kill player', () => {
    const player = players.randomAlive;
    player.stats.set('hp', 0);
    expect(players.sortDead()).toMatchObject([player]);

    expect(players.alivePlayers).toHaveLength(8);
    expect(players.deadPlayers).toHaveLength(1);
  });

  it('should get kills', () => {
    const killer = players.alivePlayers[0];
    players.alivePlayers[1].setKiller(killer);
    players.alivePlayers[4].setKiller(killer);
    players.alivePlayers[6].setKiller(killer);

    expect(players.getKills(killer.id)).toHaveLength(3);
  });
});
