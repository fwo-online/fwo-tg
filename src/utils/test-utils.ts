import casual from 'casual';
import CharacterService from '@/arena/CharacterService';
import { ClanService } from '@/arena/ClanService';
import { profsList, profsData } from '@/data/profs';
import { Char, CharModel } from '@/models/character';
import { Clan, ClanModel } from '@/models/clan';

const functions = casual.functions();

export default class TestUtils {
  static async createCharacter(params?: Partial<Char>) {
    const prof = casual.random_element([...profsList]);
    const char = await CharModel.create({
      tgId: casual.integer(1_000_000, 9_999_999),
      nickname: functions.word(),
      sex: casual.random_element(['m', 'f']),
      prof: casual.random_element(prof),
      harks: profsData[prof].hark,
      magics: profsData[prof].mag,
      ...params,
    });
    await CharacterService.getCharacter(char.tgId);
    return char;
  }

  static getCharacter(id: string) {
    return CharModel.findById(id);
  }

  static async createClan(charId: string, params?: Partial<Omit<Clan, 'owner'>>) {
    // @ts-expect-error todo
    const players = params?.players?.concat([charId]) ?? [charId];
    const created = await ClanModel.create({
      owner: charId,
      name: functions.word(),
      ...params,
      players,
    });
    const clan = await created.save();
    await CharModel.updateOne({ id: charId }, { clan: clan.id });
    return ClanService.getClanById(clan.id);
  }

  static getClan(id: string) {
    return ClanModel.findById(id).populate('owner').populate('players').populate('requests');
  }

  static getClans() {
    return ClanModel.find();
  }
}
