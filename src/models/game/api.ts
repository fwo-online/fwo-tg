import type { LeanDocument } from "mongoose";
import { GameDocument, GameModel } from "@/models/game";
import { dbErr } from "@/models/utils";

export type Game = LeanDocument<GameDocument>

export async function createGame(gameObject) {
  try {
    const game = new GameModel(gameObject);
    game.save();
    return game.toObject();
  } catch (e) {
    dbErr(e);
  }
}
