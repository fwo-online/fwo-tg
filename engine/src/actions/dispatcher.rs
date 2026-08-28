use crate::actions::registry::{ActionCategory, ActionRegistry};
use crate::combat::damage::{apply_resists, calculate_raw_magic_hit};
use crate::combat::exp::{calculate_heal_exp, calculate_magic_exp};
use crate::combat::heal::execute_heal;
use crate::combat::pipeline::execute_physical_attack;
use crate::combat::result::ActionResult;
use crate::domain::defs::BattleDefs;
use crate::domain::events::BattleEvent;
use crate::domain::order::Order;
use crate::domain::state::{Affect, AffectType, BattleState};
use crate::rng::dice::roll_dice;
use crate::rng::streak::check_pseudo_random_chance;

/// Главный диспетчер выполнения любого действия/умения в игре
pub fn dispatch_action(
    defs: &BattleDefs,
    state: &mut BattleState,
    order: &Order,
    registry: &ActionRegistry,
) -> (ActionResult, Vec<BattleEvent>) {
    let mut events = Vec::new();
    let initiator_id = order.initiator;
    let target_id = order.target;
    let action_key = &order.action;

    let initiator_def = match defs.get_player(initiator_id) {
        Some(p) => p,
        None => return (ActionResult::Blocked { reason: "NO_INITIATOR".to_string() }, events),
    };

    let initiator_state = match state.get_player_mut(initiator_id) {
        Some(s) if s.is_alive => s,
        _ => return (ActionResult::Blocked { reason: "DEAD_INITIATOR".to_string() }, events),
    };

    // Проверка контроля (Стан / Сон)
    if initiator_state.has_affect("stun") {
        events.push(BattleEvent::blocked(initiator_id, target_id, action_key, "STUNNED"));
        return (ActionResult::Blocked { reason: "STUNNED".to_string() }, events);
    }
    if initiator_state.has_affect("sleep") {
        events.push(BattleEvent::blocked(initiator_id, target_id, action_key, "ASLEEP"));
        return (ActionResult::Blocked { reason: "ASLEEP".to_string() }, events);
    }

    let action_def = match registry.get(action_key) {
        Some(a) => a,
        None => {
            // Фолбэк на базовую физическую атаку
            return execute_physical_attack(defs, state, order);
        }
    };

    // 1. Проверка и списание ресурсов (MP / Energy)
    if !action_def.cost_type.is_empty() && action_def.base_cost > 0.0 {
        if !initiator_state.consume_resource(&action_def.cost_type, action_def.base_cost) {
            events.push(BattleEvent::no_resource(initiator_id, target_id, action_key, &action_def.cost_type));
            return (ActionResult::NoResource { resource_type: action_def.cost_type.clone() }, events);
        }
    }

    // 2. Проверка шанса успешного выполнения (псевдо-рандом со стриком)
    let fail_streak = initiator_state.get_fail_streak(action_key);
    if !check_pseudo_random_chance(action_def.base_chance, fail_streak) {
        initiator_state.inc_fail_streak(action_key);
        events.push(BattleEvent::failed_chance(initiator_id, target_id, action_key));
        return (ActionResult::FailedChance, events);
    }
    initiator_state.reset_fail_streak(action_key);

    // 3. Выполнение действия по категории
    match action_def.category {
        ActionCategory::Phys => execute_physical_attack(defs, state, order),

        ActionCategory::Heal => {
            let base_heal = roll_dice(&action_def.base_effect_expr);
            let proc = order.proc_fraction();
            let heal_val = ((base_heal * proc) * 100.0).round() / 100.0;

            let target_state = state.get_player_mut(target_id).unwrap();
            let actual_heal = execute_heal(target_state, heal_val);
            let target_hp_left = target_state.hp;

            let is_ally = defs.is_ally(initiator_id, target_id, true);
            let exp = calculate_heal_exp(actual_heal, is_ally);

            let initiator_state_mut = state.get_player_mut(initiator_id).unwrap();
            initiator_state_mut.add_exp(exp);

            events.push(BattleEvent::heal(initiator_id, target_id, action_key, actual_heal, target_hp_left, exp));

            (
                ActionResult::Success {
                    value: actual_heal,
                    exp,
                    target_hp_left,
                },
                events,
            )
        }

        ActionCategory::Magic => {
            let base_effect = roll_dice(&action_def.base_effect_expr);
            let proc = order.proc_fraction();
            let raw_damage = calculate_raw_magic_hit(initiator_def, base_effect, proc);

            let target_def = defs.get_player(target_id).unwrap();
            let final_damage = apply_resists(raw_damage, target_def, "magic");

            let target_state = state.get_player_mut(target_id).unwrap();
            let actual_damage = target_state.apply_damage(final_damage, initiator_id);
            let target_hp_left = target_state.hp;
            let target_died = !target_state.is_alive;

            let exp = calculate_magic_exp(action_def.base_exp, proc);
            let initiator_state_mut = state.get_player_mut(initiator_id).unwrap();
            initiator_state_mut.add_exp(exp);

            events.push(BattleEvent::damage(initiator_id, target_id, action_key, actual_damage, target_hp_left, exp));

            if target_died {
                events.push(BattleEvent::death(target_id, initiator_id, action_key));
            }

            (
                ActionResult::Success {
                    value: actual_damage,
                    exp,
                    target_hp_left,
                },
                events,
            )
        }

        ActionCategory::CrowdControl | ActionCategory::Buff | ActionCategory::Skill | ActionCategory::Protect => {
            let affect_type = if action_def.key == "lightShield" || action_def.key == "magicWall" {
                AffectType::Long
            } else {
                AffectType::Round
            };

            let duration = if affect_type == AffectType::Long { 2 } else { 1 };
            let value = roll_dice(&action_def.base_effect_expr);

            // Если накладывается на всех врагов (как Eclipse)
            if action_def.key == "eclipse" {
                let alive_enemies: Vec<u8> = state
                    .alive_player_ids()
                    .into_iter()
                    .filter(|&id| !defs.is_ally(initiator_id, id, true))
                    .collect();

                for enemy_id in alive_enemies {
                    let enemy_state = state.get_player_mut(enemy_id).unwrap();
                    enemy_state.add_affect(Affect {
                        action_key: action_key.to_string(),
                        initiator_id,
                        affect_type: AffectType::Round,
                        duration: 1,
                        value: 0.0,
                        proc: order.proc_fraction(),
                    });
                    events.push(BattleEvent::affect_applied(initiator_id, enemy_id, action_key, 1, 0.0));
                }
            } else {
                // Наложение на выбранную цель (или себя)
                let target_state = state.get_player_mut(target_id).unwrap();
                target_state.add_affect(Affect {
                    action_key: action_key.to_string(),
                    initiator_id,
                    affect_type,
                    duration,
                    value,
                    proc: order.proc_fraction(),
                });
                events.push(BattleEvent::affect_applied(initiator_id, target_id, action_key, duration, value));
            }

            let exp = action_def.base_exp;
            let initiator_state_mut = state.get_player_mut(initiator_id).unwrap();
            initiator_state_mut.add_exp(exp);

            (
                ActionResult::Success {
                    value,
                    exp,
                    target_hp_left: state.get_player(target_id).map_or(0.0, |p| p.hp),
                },
                events,
            )
        }

        ActionCategory::Passive => (ActionResult::Success { value: 0.0, exp: 0, target_hp_left: 0.0 }, events),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::defs::{PlayerDef, WeaponDef};
    use crate::domain::state::DynamicState;
    use std::collections::HashMap;

    fn create_test_setup() -> (BattleDefs, BattleState, ActionRegistry) {
        let defs = BattleDefs {
            players: vec![
                PlayerDef {
                    id: 0,
                    nick: "Mage".to_string(),
                    clan_id: Some("ClanA".to_string()),
                    weapon: WeaponDef::default(),
                    skills: HashMap::new(),
                    magics: HashMap::new(),
                    passives: HashMap::new(),
                    resists: HashMap::new(),
                    base_stats: HashMap::new(),
                    max_target: 1,
                },
                PlayerDef {
                    id: 1,
                    nick: "Ally".to_string(),
                    clan_id: Some("ClanA".to_string()),
                    weapon: WeaponDef::default(),
                    skills: HashMap::new(),
                    magics: HashMap::new(),
                    passives: HashMap::new(),
                    resists: HashMap::new(),
                    base_stats: HashMap::new(),
                    max_target: 1,
                },
                PlayerDef {
                    id: 2,
                    nick: "Enemy".to_string(),
                    clan_id: Some("ClanB".to_string()),
                    weapon: WeaponDef::default(),
                    skills: HashMap::new(),
                    magics: HashMap::new(),
                    passives: HashMap::new(),
                    resists: HashMap::new(),
                    base_stats: HashMap::new(),
                    max_target: 1,
                },
            ],
        };

        let mut p1 = DynamicState::new(100.0, 50.0, 100.0);
        p1.hp = 70.0; // Поврежденный союзник (70/100 HP)

        let state = BattleState {
            players: vec![
                DynamicState::new(100.0, 50.0, 100.0),
                p1,
                DynamicState::new(100.0, 50.0, 100.0),
            ],
            round: 1,
            no_damage_streak: 0,
        };

        (defs, state, ActionRegistry::new())
    }

    #[test]
    fn test_dispatch_heal_spell() {
        let (defs, mut state, registry) = create_test_setup();
        let order = Order {
            initiator: 0,
            target: 1,
            action: "lightHeal".to_string(),
            proc: 100.0,
        };

        let (res, events) = dispatch_action(&defs, &mut state, &order, &registry);
        match res {
            ActionResult::Success { value, exp, .. } => {
                assert!(value >= 11.0);
                assert!(exp > 0);
            }
            _ => panic!("Expected Success heal"),
        }

        assert_eq!(events.len(), 1);
        assert_eq!(events[0].event_type, "heal");
        assert!(state.players[1].hp > 70.0);
        assert_eq!(state.players[0].mp, 45.0); // 50 - 5 MP
    }

    #[test]
    fn test_dispatch_fireball_damage() {
        let (defs, mut state, registry) = create_test_setup();
        let order = Order {
            initiator: 0,
            target: 2,
            action: "fireBall".to_string(),
            proc: 100.0,
        };

        let (res, events) = dispatch_action(&defs, &mut state, &order, &registry);
        match res {
            ActionResult::Success { value, .. } => {
                assert!(value >= 6.0);
            }
            _ => panic!("Expected Success fireball"),
        }

        assert_eq!(events.len(), 1);
        assert_eq!(events[0].event_type, "damage");
        assert!(state.players[2].hp < 100.0);
        assert_eq!(state.players[0].mp, 26.0); // 50 - 24 MP
    }
}
