import { beforeEach, describe, expect, it } from 'bun:test';
import { reservedClanName } from '@fwo/shared';
import { times } from 'lodash';
import type { Char } from '@/models/character';
import type { Clan } from '@/models/clan';
import TestUtils from '@/utils/testUtils';
import Player from './PlayerService';
import PlayersService from './PlayersService';

// npm t server/arena/PlayersService/PlayersService.test.ts

describe('PlayerService', () => {
  let chars: Char[];
  let players: PlayersService;
  let clans: Clan[] = [];

  beforeEach(async () => {
    chars = await Promise.all(times(9, () => TestUtils.createCharacter({})));

    clans = await Promise.all([
      await TestUtils.createClan(chars[0], { players: [chars[1], chars[2]] }),
      await TestUtils.createClan(chars[3], { players: [chars[4]] }),
      await TestUtils.createClan(chars[5]),
    ]);

    players = new PlayersService(chars.map(({ id }) => id));
  });

  it('should get random alive', () => {
    expect(players.randomAlive).toBeInstanceOf(Player);
  });

  it('should filter by dead/alive players', () => {
    expect(players.alivePlayers).toHaveLength(chars.length);
    expect(players.deadPlayers).toHaveLength(0);
  });

  it('should participate by clan', () => {
    const { [reservedClanName]: withoutClan, ...withClan } = players.groupByClan();

    expect(withoutClan).toHaveLength(3);
    expect(withClan).toMatchObject({
      [clans[0].name]: [{ id: chars[0].id }, { id: chars[1].id }, { id: chars[2].id }],
      [clans[1].name]: [{ id: chars[3].id }, { id: chars[4].id }],
      [clans[2].name]: [{ id: chars[5].id }],
    });
  });

  it('should participate alive by clan', () => {
    players.players[7].setDead();
    players.players[5].setDead();
    players.players[3].setDead();
    players.players[1].setDead();

    const { [reservedClanName]: withoutClan, ...withClan } = players.groupByClan(
      players.alivePlayers,
    );

    expect(withoutClan).toHaveLength(2);
    expect(withClan).toMatchObject({
      [clans[0].name]: [{ id: chars[0].id }, { id: chars[2].id }],
      [clans[1].name]: [{ id: chars[4].id }],
    });
  });

  it('should reset stats', () => {
    const player = players.randomAlive;
    player.setProc(10);
    player.stats.set('exp', 10);
    player.flags.isMad = [{ initiator: player, val: 0 }];

    expect(player.proc).toBe(10);
    expect(player.stats.val('exp')).toBe(10);

    players.reset();
    expect(player.proc).toBe(100);
    expect(player.stats.val('exp')).toBe(0);
    expect(player.flags.isMad).toHaveLength(0);
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
