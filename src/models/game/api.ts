import type { LeanDocument } from "mongoose";
import { GameDocument, GameModel } from "@/models/game";

export type Game = LeanDocument<GameDocument>

const dbErr = (e) => console.log(e);

export async function createGame(gameObject) {
  try {
    const game = new GameModel(gameObject);
    game.save();
    return game.toObject();
  } catch (e) {
    dbErr(e);
  }
}
