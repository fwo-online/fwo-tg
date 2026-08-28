#![deny(clippy::all)]

pub mod actions;
pub mod combat;
pub mod domain;
pub mod rng;

use actions::registry::ActionRegistry;
use domain::defs::BattleDefs;
use domain::events::BattleEvent;
use domain::order::Order;
use domain::state::BattleState;
use napi_derive::napi;
use serde::{Deserialize, Serialize};

#[napi]
pub fn ping(msg: String) -> String {
    format!("pong: {msg} (from Rust engine)")
}

#[napi]
pub fn float_number(val: f64) -> f64 {
    (val * 100.0).round() / 100.0
}

#[napi]
pub fn roll_dice_expr(dice_str: String) -> f64 {
    rng::dice::roll_dice(&dice_str)
}

#[napi]
pub fn roll_rndm_expr(dice_str: String) -> i32 {
    rng::dice::roll_rndm(&dice_str)
}

#[napi]
pub fn check_pseudo_chance(chance_percent: f64, fail_streak: u32) -> bool {
    rng::streak::check_pseudo_random_chance(chance_percent, fail_streak)
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EngineStatus {
    pub ready: bool,
    pub version: String,
    pub engine_name: String,
}

#[napi]
pub fn get_engine_status() -> EngineStatus {
    EngineStatus {
        ready: true,
        version: "0.1.0".to_string(),
        engine_name: "fwo-engine-rs".to_string(),
    }
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoundInput {
    pub defs: BattleDefs,
    pub state: BattleState,
    pub orders: Vec<Order>,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoundOutput {
    pub next_state: BattleState,
    pub events: Vec<BattleEvent>,
    pub is_game_end: bool,
    pub end_reason: Option<String>,
}

/// Выполняет боевые действия через диспетчер и возвращает обновленное состояние и список событий
#[napi]
pub fn execute_single_action(input: RoundInput) -> RoundOutput {
    let mut state = input.state;
    let mut all_events = Vec::new();
    let registry = ActionRegistry::new();

    for order in &input.orders {
        let (_result, events) = actions::dispatcher::dispatch_action(&input.defs, &mut state, order, &registry);
        all_events.extend(events);
    }

    let alive_players = state.alive_player_ids();
    let is_game_end = alive_players.len() <= 1;

    RoundOutput {
        next_state: state,
        events: all_events,
        is_game_end,
        end_reason: if is_game_end {
            Some("LAST_PLAYER_STANDING".to_string())
        } else {
            None
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ping() {
        assert_eq!(ping("test".to_string()), "pong: test (from Rust engine)");
    }

    #[test]
    fn test_float_number() {
        assert_eq!(float_number(12.3456), 12.35);
        assert_eq!(float_number(0.1 + 0.2), 0.3);
        assert_eq!(float_number(1.999), 2.0);
    }
}
