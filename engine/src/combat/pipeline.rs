use crate::combat::damage::{apply_resists, calculate_raw_phys_hit};
use crate::combat::exp::calculate_phys_exp;
use crate::combat::result::ActionResult;
use crate::domain::defs::BattleDefs;
use crate::domain::events::BattleEvent;
use crate::domain::order::Order;
use crate::domain::state::BattleState;
use crate::rng::dice::rand_int;

/// Выполняет базовую физическую атаку с полным жизненным циклом перехватов
pub fn execute_physical_attack(
    defs: &BattleDefs,
    state: &mut BattleState,
    order: &Order,
) -> (ActionResult, Vec<BattleEvent>) {
    let mut events = Vec::new();
    let initiator_id = order.initiator;
    let mut target_id = order.target;
    let action_key = &order.action;
    let proc = order.proc_fraction();

    let initiator_def = match defs.get_player(initiator_id) {
        Some(p) => p,
        None => return (ActionResult::Blocked { reason: "NO_INITIATOR".to_string() }, events),
    };

    let initiator_state = match state.get_player(initiator_id) {
        Some(s) if s.is_alive => s,
        _ => return (ActionResult::Blocked { reason: "DEAD_INITIATOR".to_string() }, events),
    };

    // 1. Проверка контроля на атакующем (OnBeforeAction: Стан / Сон)
    if initiator_state.has_affect("stun") {
        events.push(BattleEvent::blocked(initiator_id, target_id, action_key, "STUNNED"));
        return (ActionResult::Blocked { reason: "STUNNED".to_string() }, events);
    }
    if initiator_state.has_affect("sleep") {
        events.push(BattleEvent::blocked(initiator_id, target_id, action_key, "ASLEEP"));
        return (ActionResult::Blocked { reason: "ASLEEP".to_string() }, events);
    }

    // 2. Проверка хуков атакующего (OnBeforeDamageDeal: Eclipse / Glitch)
    if initiator_state.has_affect("eclipse") {
        events.push(BattleEvent::blocked(initiator_id, target_id, action_key, "ECLIPSE_BLOCKED"));
        return (ActionResult::Blocked { reason: "ECLIPSE_BLOCKED".to_string() }, events);
    }

    let has_glitch = initiator_state.has_affect("glitch");
    if has_glitch {
        let alive_ids = state.alive_player_ids();
        if !alive_ids.is_empty() {
            let random_idx = rand_int(0, (alive_ids.len() - 1) as i32) as usize;
            let new_target = alive_ids[random_idx];
            if new_target != target_id {
                events.push(BattleEvent::redirected(initiator_id, target_id, new_target, action_key));
                target_id = new_target;
            }
        }
    }

    let target_def = match defs.get_player(target_id) {
        Some(p) => p,
        None => return (ActionResult::Blocked { reason: "NO_TARGET".to_string() }, events),
    };

    let target_state = match state.get_player(target_id) {
        Some(s) if s.is_alive => s,
        _ => return (ActionResult::Blocked { reason: "DEAD_TARGET".to_string() }, events),
    };

    // 3. Проверка защитных реакций цели (OnBeforeDamageReceive: Dodge / Parry)
    if target_state.has_affect("dodge") {
        events.push(BattleEvent::dodged(initiator_id, target_id, action_key));
        return (ActionResult::Dodged, events);
    }
    if target_state.has_affect("parry") {
        events.push(BattleEvent::parried(initiator_id, target_id, action_key));
        return (ActionResult::Parried, events);
    }

    // 4. Расчёт и применение урона
    let raw_damage = calculate_raw_phys_hit(initiator_def, proc);
    let final_damage = apply_resists(raw_damage, target_def, "phys");

    let target_state_mut = state.get_player_mut(target_id).unwrap();
    let actual_dmg = target_state_mut.apply_damage(final_damage, initiator_id);
    let target_hp_left = target_state_mut.hp;
    let target_died = !target_state_mut.is_alive;

    // 5. Расчёт и начисление опыта
    let is_ally = defs.is_ally(initiator_id, target_id, true);
    let exp = calculate_phys_exp(actual_dmg, is_ally, has_glitch);

    let initiator_state_mut = state.get_player_mut(initiator_id).unwrap();
    initiator_state_mut.add_exp(exp);

    // 6. Формирование событий
    events.push(BattleEvent::damage(
        initiator_id,
        target_id,
        action_key,
        actual_dmg,
        target_hp_left,
        exp,
    ));

    if target_died {
        events.push(BattleEvent::death(target_id, initiator_id, action_key));
    }

    // 7. Пост-эффекты (OnDamageDealt: SweepingBlow splash)
    if initiator_state_mut.has_affect("sweepingBlow") && initiator_def.weapon.weapon_type == "cut" {
        let alive_enemies: Vec<u8> = state
            .alive_player_ids()
            .into_iter()
            .filter(|&id| id != target_id && !defs.is_ally(initiator_id, id, true))
            .collect();

        if !alive_enemies.is_empty() {
            let splash_target = alive_enemies[0];
            let splash_dmg = ((actual_dmg * 0.5) * 100.0).round() / 100.0;
            let splash_state = state.get_player_mut(splash_target).unwrap();
            splash_state.apply_damage(splash_dmg, initiator_id);
            let splash_hp_left = splash_state.hp;
            let splash_exp = (splash_dmg * 8.0).round() as u32;

            events.push(BattleEvent::damage(
                initiator_id,
                splash_target,
                "sweepingBlow",
                splash_dmg,
                splash_hp_left,
                splash_exp,
            ));
        }
    }

    (
        ActionResult::Success {
            value: actual_dmg,
            exp,
            target_hp_left,
        },
        events,
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::defs::{PlayerDef, WeaponDef};
    use crate::domain::state::{Affect, AffectType, DynamicState};
    use std::collections::HashMap;

    fn create_test_battle() -> (BattleDefs, BattleState) {
        let defs = BattleDefs {
            players: vec![
                PlayerDef {
                    id: 0,
                    nick: "Attacker".to_string(),
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
                    nick: "Defender".to_string(),
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

        let state = BattleState {
            players: vec![
                DynamicState::new(100.0, 50.0, 100.0),
                DynamicState::new(100.0, 50.0, 100.0),
            ],
            round: 1,
            no_damage_streak: 0,
        };

        (defs, state)
    }

    #[test]
    fn test_execute_physical_attack_success() {
        let (defs, mut state) = create_test_battle();
        let order = Order {
            initiator: 0,
            target: 1,
            action: "attack".to_string(),
            proc: 100.0,
        };

        let (res, events) = execute_physical_attack(&defs, &mut state, &order);
        match res {
            ActionResult::Success { value, exp, target_hp_left } => {
                assert_eq!(value, 10.0);
                assert_eq!(exp, 80);
                assert_eq!(target_hp_left, 90.0);
            }
            _ => panic!("Expected Success result"),
        }

        assert_eq!(events.len(), 1);
        assert_eq!(events[0].event_type, "damage");
        assert_eq!(state.players[1].hp, 90.0);
        assert_eq!(state.players[0].exp_earned, 80);
    }

    #[test]
    fn test_execute_physical_attack_dodge() {
        let (defs, mut state) = create_test_battle();
        state.players[1].add_affect(Affect {
            action_key: "dodge".to_string(),
            initiator_id: 1,
            affect_type: AffectType::Round,
            duration: 1,
            value: 0.0,
            proc: 1.0,
        });

        let order = Order {
            initiator: 0,
            target: 1,
            action: "attack".to_string(),
            proc: 100.0,
        };

        let (res, events) = execute_physical_attack(&defs, &mut state, &order);
        assert_eq!(res, ActionResult::Dodged);
        assert_eq!(events.len(), 1);
        assert_eq!(events[0].event_type, "dodged");
        assert_eq!(state.players[1].hp, 100.0); // Урон не нанесен
    }

    #[test]
    fn test_execute_physical_attack_eclipse_blocked() {
        let (defs, mut state) = create_test_battle();
        state.players[0].add_affect(Affect {
            action_key: "eclipse".to_string(),
            initiator_id: 1,
            affect_type: AffectType::Round,
            duration: 1,
            value: 0.0,
            proc: 1.0,
        });

        let order = Order {
            initiator: 0,
            target: 1,
            action: "attack".to_string(),
            proc: 100.0,
        };

        let (res, events) = execute_physical_attack(&defs, &mut state, &order);
        match res {
            ActionResult::Blocked { reason } => assert_eq!(reason, "ECLIPSE_BLOCKED"),
            _ => panic!("Expected Blocked result"),
        }
        assert_eq!(events.len(), 1);
        assert_eq!(events[0].event_type, "blocked");
        assert_eq!(state.players[1].hp, 100.0);
    }
}
