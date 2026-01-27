import { ForestEventAction, ForestEventResult } from "@fwo/shared";
import { ForestService } from "../ForestService";

export type ForestEventHandler = (action: ForestEventAction, forest: ForestService) => Promise<ForestEventResult>