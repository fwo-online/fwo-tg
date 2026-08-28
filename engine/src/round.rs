use crate::actions::dispatcher::dispatch_action;
use crate::actions::registry::ActionRegistry;
use crate::domain::defs::BattleDefs;
use crate::domain::events::BattleEvent;
use crate::domain::order::Order;
use crate::domain::state::BattleState;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoundOutput {
    pub next_state: BattleState,
    pub events: Vec<BattleEvent>,
    pub is_game_end: bool,
    pub end_reason: Option<String>,
}

/// Выполняет полный раунд боя по всем стадиям
pub fn execute_round_stages(
    defs: &BattleDefs,
    mut state: BattleState,
    orders: &[Order],
) -> RoundOutput {
    let registry = ActionRegistry::new();
    let mut all_events = Vec::new();

    // 1. Исполнение стадий раунда в строгом порядке
    for stage_action in &registry.stages {
        // Находим все заказы на текущую стадию
        let stage_orders: Vec<&Order> = orders
            .iter()
            .filter(|o| &o.action == stage_action)
            .collect();

        for order in stage_orders {
            let initiator_alive = state.is_alive(order.initiator);
            let target_alive = state.is_alive(order.target);

            // Если действие направлено на врага, а цель уже мертва — пропускаем
            if !initiator_alive {
                continue;
            }

            // Для воскрешающих скиллов или если цель жива
            if target_alive || order.action == "secondLife" || order.action == "nineLives" {
                let (_result, events) = dispatch_action(defs, &mut state, order, &registry);
                all_events.extend(events);
            }
        }
    }

    // 2. Обработка окончания раунда
    let had_damage = all_events.iter().any(|e| e.event_type == "damage");
    if had_damage {
        state.no_damage_streak = 0;
    } else {
        state.no_damage_streak += 1;
    }

    state.round += 1;

    // 3. Старение и очистка эффектов
    for player in &mut state.players {
        player.tick_affects_round_end();
    }

    // 4. Проверка условий окончания боя
    let (is_game_end, end_reason) = check_game_end(defs, &state);

    RoundOutput {
        next_state: state,
        events: all_events,
        is_game_end,
        end_reason,
    }
}

/// Проверка условий победы/завершения игры
pub fn check_game_end(defs: &BattleDefs, state: &BattleState) -> (bool, Option<String>) {
    let alive_ids = state.alive_player_ids();

    if alive_ids.is_empty() {
        return (true, Some("ALL_DEAD".to_string()));
    }

    if state.no_damage_streak > 2 {
        return (true, Some("NO_DAMAGE_ROUND".to_string()));
    }

    if state.round > 9 {
        return (true, Some("ROUND_LIMIT".to_string()));
    }

    // Проверка командной победы (остался 1 клан или 1 соло игрок)
    let mut alive_clans = HashSet::new();
    let mut solo_alive_count = 0;

    for &id in &alive_ids {
        if let Some(p) = defs.get_player(id) {
            match &p.clan_id {
                Some(clan) if !clan.is_empty() => {
                    alive_clans.insert(clan.clone());
                }
                _ => {
                    solo_alive_count += 1;
                }
            }
        }
    }

    let is_team_win = if solo_alive_count == 0 {
        alive_clans.len() == 1
    } else {
        solo_alive_count == 1 && alive_clans.is_empty()
    };

    if is_team_win {
        (true, Some("TEAM_WIN".to_string()))
    } else {
        (false, None)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::defs::{PlayerDef, WeaponDef};
    use crate::domain::state::DynamicState;
    use std::collections::HashMap;

    fn create_test_battle() -> (BattleDefs, BattleState) {
        let defs = BattleDefs {
            players: vec![
                PlayerDef {
                    id: 0,
                    nick: "Warrior".to_string(),
                    clan_id: Some("ClanA".to_string()),
                    weapon: WeaponDef {
                        weapon_type: "cut".to_string(),
                        min_hit: 10.0,
                        max_hit: 10.0,
                    },
                    skills: HashMap::new(),
                    magics: HashMap::new(),
                    passives: HashMap::new(),
                    resists: HashMap::new(),
                    base_stats: HashMap::new(),
                    max_target: 1,
                },
                PlayerDef {
                    id: 1,
                    nick: "Dodger".to_string(),
                    clan_id: Some("ClanB".to_string()),
                    weapon: WeaponDef {
                        weapon_type: "cut".to_string(),
                        min_hit: 5.0,
                        max_hit: 5.0,
                    },
                    skills: HashMap::new(),
                    magics: HashMap::new(),
                    passives: HashMap::new(),
                    resists: HashMap::new(),
                    base_stats: HashMap::new(),
                    max_target: 1,
                },
            ],
        };

        let state = BattleState {
            players: vec![
                DynamicState::new(100.0, 50.0, 100.0),
                DynamicState::new(100.0, 50.0, 100.0),
            ],
            round: 0,
            no_damage_streak: 0,
        };

        (defs, state)
    }

    #[test]
    fn test_stage_sequence_dodge_before_attack() {
        let (defs, state) = create_test_battle();

        // Заказы: Dodger использует dodge (стадия 9), Warrior атакует (стадия 15)
        let orders = vec![
            Order {
                initiator: 0,
                target: 1,
                action: "attack".to_string(),
                proc: 100.0,
            },
            Order {
                initiator: 1,
                target: 1,
                action: "dodge".to_string(),
                proc: 100.0,
            },
        ];

        let output = execute_round_stages(&defs, state, &orders);

        // Dodge сработал на стадии 9, поэтому атака на стадии 15 задоджилась!
        assert_eq!(output.nextState.players[1].hp, 100.0);
        assert_eq!(output.events.len(), 2);
        assert_eq!(output.events[0].eventType, "affect_applied"); // Dodge наложен
        assert_eq!(output.events[1].eventType, "dodged"); // Атака задоджилась
        assert_eq!(output.nextState.round, 1);
    }

    #[test]
    fn test_stage_sequence_eclipse_before_attack() {
        let (defs, state) = create_test_battle();

        let orders = vec![
            Order {
                initiator: 0,
                target: 1,
                action: "attack".to_string(),
                proc: 100.0,
            },
            Order {
                initiator: 1,
                target: 0,
                action: "eclipse".to_string(),
                proc: 100.0,
            },
        ];

        let output = execute_round_stages(&defs, state, &orders);

        // Eclipse сработал на стадии 8, заблокировав физ атаку Warrior на стадии 15!
        assert_eq!(output.nextState.players[1].hp, 100.0);
        assert_eq!(output.events.len(), 2);
        assert_eq!(output.events[0].eventType, "affect_applied");
        assert_eq!(output.events[1].eventType, "blocked");
    }

    #[test]
    fn test_victory_condition_team_win() {
        let (defs, mut state) = create_test_battle();

        // 1 игрок убивает второго
        state.players[1].hp = 0.0;
        state.players[1].is_alive = false;

        let (is_end, reason) = check_game_end(&defs, &state);
        assert!(is_end);
        assert_eq!(reason, Some("TEAM_WIN".to_string()));
    }
}
