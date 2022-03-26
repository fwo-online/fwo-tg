import mongoose from 'mongoose';
import { connect, disconnect } from '@/models';
import type { Char } from '@/models/character';
import type { Clan } from '@/models/clan';
import TestUtils from '@/utils/test-utils';
import { ClanService } from './ClanService';
import arena from '.';

jest.retryTimes(3);

describe('ClanService', () => {
  let char: Char;
  let clan: Clan;

  beforeAll(async () => {
    await connect();
    await mongoose.connection.dropDatabase();
  });

  beforeEach(async () => {
    await connect();
    char = await TestUtils.createCharacter({ gold: 100_000 });
    clan = await TestUtils.createClan(char.id);
  });

  afterEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should create clan', async () => {
    const char = await TestUtils.createCharacter();
    const clan = await ClanService.createClan(char.id, 'some name');

    expect(clan.name).toEqual('some name');
    expect(clan.owner.id).toEqual(char.id);
    expect(clan.players).toHaveLength(1);
    expect(clan.players[0].id).toEqual(char.id);

    const clans = await TestUtils.getClans();
    expect(clans).toHaveLength(2);
  });

  it('should throw if user has not enough gold when create clan', async () => {
    const char = await TestUtils.createCharacter({ gold: 10 });

    expect(ClanService.createClan(char.id, 'some name')).rejects.toMatchObject(new Error('Нужно больше золота'));

    const clans = await TestUtils.getClans();
    expect(clans).toHaveLength(1);
  });

  it('should throw if clan name is existed', async () => {
    const char = await TestUtils.createCharacter();

    expect(ClanService.createClan(char.id, clan.name)).rejects.toMatchObject(new Error('Кто-то придумал это до тебя!'));

    const clans = await TestUtils.getClans();
    expect(clans).toHaveLength(1);
  });

  it('should remove clan', async () => {
    await ClanService.removeClan(clan.id, char.id);

    const clans = await TestUtils.getClans();
    expect(clans).toHaveLength(0);
    expect(arena.clans.has(clan.id)).toBe(false);
  });

  it('should add gold to clan', async () => {
    await ClanService.addGold(clan.id, char.id, 100);

    expect(await TestUtils.getClan(clan.id)).toMatchObject({
      gold: 100,
    });
    expect(await TestUtils.getCharacter(char.id)).toMatchObject({
      gold: 99_900,
    });
  });

  it('should throw if user has not enough gold when add gold to clan', async () => {
    const char = await TestUtils.createCharacter({ gold: 10 });

    expect(ClanService.addGold(clan.id, char.id, 100)).rejects.toMatchObject(new Error('Недостаточно золота'));

    expect(await TestUtils.getClans()).toHaveLength(1);
    expect(await TestUtils.getCharacter(char.id)).toMatchObject({
      gold: 10,
    });
  });

  it('should level up', async () => {
    const char = await TestUtils.createCharacter();
    const clan = await TestUtils.createClan(char.id, { gold: 100_000 });
    await ClanService.levelUp(clan.id);

    expect(await TestUtils.getClan(clan.id)).toMatchObject({
      lvl: 2,
      gold: 99_750,
    });
  });

  it('should throw if clan has not enough gold when level up', async () => {
    expect(ClanService.levelUp(clan.id)).rejects.toMatchObject(new Error('Недостаточно золота'));
    expect(await TestUtils.getClan(clan.id)).toMatchObject({
      gold: 0,
    });
  });

  it('should throw if clan has max level', async () => {
    const char = await TestUtils.createCharacter();
    const clan = await TestUtils.createClan(char.id, { lvl: 4, gold: 100_000 });

    expect(ClanService.levelUp(clan.id)).rejects.toMatchObject(new Error('Клан имеет максимальный уровень'));
    expect(await TestUtils.getClan(clan.id)).toMatchObject({
      gold: 100_000,
    });
  });

  it('should add user to requesters', async () => {
    const requester = await TestUtils.createCharacter();

    const message = await ClanService.handleRequest(clan.id, requester.id);

    expect(message).toEqual('Заявка на вступление отправлена');

    const requestedClan = await TestUtils.getClan(clan.id);
    expect(requestedClan?.requests).toHaveLength(1);
    expect(requestedClan?.requests[0]).toEqual(requester._id);
  });

  it('should remove user from requesters', async () => {
    const char = await TestUtils.createCharacter();
    const requester = await TestUtils.createCharacter();
    const clan = await TestUtils.createClan(char.id, { requests: [requester.id], lvl: 2 });

    expect(clan.requests).toHaveLength(1);

    const message = await ClanService.handleRequest(clan.id, requester.id);

    expect(message).toEqual('Заявка на вступление отменена');

    const requestedClan = await TestUtils.getClan(clan.id);
    expect(requestedClan?.requests).toHaveLength(0);

    expect(await TestUtils.getCharacter(requester.id)).toMatchObject({
      penalty: [{
        reason: 'clan_request',
      }],
    });
  });

  it('should throw if user has penalty for request', async () => {
    const requester = await TestUtils.createCharacter({ penalty: [{ reason: 'clan_request', date: new Date(Date.now() + 60_000) }] });

    expect(clan.requests).toHaveLength(0);

    expect(ClanService.handleRequest(clan.id, requester.id)).rejects.toMatchObject(new Error('Определись и возвращайся через 1 мин.'));

    const requestedClan = await TestUtils.getClan(clan.id);
    expect(requestedClan?.requests).toHaveLength(0);
  });

  it('should leave from clan', async () => {
    const [owner, player] = await Promise.all([
      TestUtils.createCharacter(),
      TestUtils.createCharacter(),
    ]);
    const clan = await TestUtils.createClan(owner.id, { players: [player.id] });
    expect(clan?.players).toHaveLength(2);

    await ClanService.leaveClan(clan.id, player.id);

    const leavedClan = await TestUtils.getClan(clan.id);
    expect(leavedClan?.players).toHaveLength(1);
  });

  it('should throw when owner leave from clan', async () => {
    expect(ClanService.leaveClan(clan.id, char.id)).rejects.toMatchObject(new Error('Невозможно покинуть клан, где вы являетесь владельцем'));
  });

  it('should add player after accept request', async () => {
    const [owner, player] = await Promise.all([
      TestUtils.createCharacter(),
      TestUtils.createCharacter(),
    ]);
    const clan = await TestUtils.createClan(owner.id, { requests: [player.id] });

    await ClanService.acceptRequest(clan.id, player.id);

    expect(await TestUtils.getClan(clan.id).populate('players')).toMatchObject({
      requests: [],
      players: [{ id: owner.id }, { id: player.id }],
    });
  });

  it('should throw when accept player in clan without slots', async () => {
    const [owner, player1, player2] = await Promise.all([
      TestUtils.createCharacter(),
      TestUtils.createCharacter(),
      TestUtils.createCharacter(),
    ]);
    const clan = await TestUtils.createClan(owner.id, {
      players: [player1.id],
      requests: [player2.id],
    });

    expect(ClanService.acceptRequest(clan.id, player2.id)).rejects.toMatchObject(new Error('Клан уже сформирован'));

    expect(await TestUtils.getClan(clan.id).populate('players').populate('requests')).toMatchObject({
      players: [{ id: player1.id }, { id: owner.id }],
      requests: [{ id: player2.id }],
    });
  });

  it('should remove player from requesters after reject request', async () => {
    const [owner, player] = await Promise.all([
      TestUtils.createCharacter(),
      TestUtils.createCharacter(),
    ]);
    const clan = await TestUtils.createClan(owner.id, { requests: [player.id] });

    await ClanService.rejectRequest(clan.id, player.id);

    expect(await TestUtils.getClan(clan.id).populate('players')).toMatchObject({
      requests: [],
      players: [{ id: owner.id }],
    });
  });
});
