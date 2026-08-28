use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Тип аффекта / эффекта
#[napi(string_enum)]
#[derive(Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum AffectType {
    Round,   // 1 раунд
    Long,    // N раундов (декрементируется каждый раунд)
    Passive, // Постоянный эффект
}

/// Аффект, наложенный на персонажа
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Affect {
    pub action_key: String,
    pub initiator_id: u8,
    pub affect_type: AffectType,
    pub duration: u32,
    pub value: f64,
    pub proc: f64,
}

/// Динамическое изменяемое состояние игрока в ходе раунда
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DynamicState {
    pub hp: f64,
    pub max_hp: f64,
    pub mp: f64,
    pub max_mp: f64,
    pub energy: f64,
    pub max_energy: f64,
    pub exp_earned: u32,
    pub is_alive: bool,
    pub killer_id: Option<u8>,
    pub fail_streaks: HashMap<String, u32>,
    pub affects: Vec<Affect>,
}

impl DynamicState {
    pub fn new(hp: f64, mp: f64, energy: f64) -> Self {
        Self {
            hp,
            max_hp: hp,
            mp,
            max_mp: mp,
            energy,
            max_energy: energy,
            exp_earned: 0,
            is_alive: hp > 0.0,
            killer_id: None,
            fail_streaks: HashMap::new(),
            affects: Vec::new(),
        }
    }

    /// Списание ресурса (mp / en). Возвращает false, если ресурса не хватает.
    pub fn consume_resource(&mut self, resource_type: &str, amount: f64) -> bool {
        match resource_type {
            "mp" => {
                if self.mp >= amount {
                    self.mp = ((self.mp - amount) * 100.0).round() / 100.0;
                    true
                } else {
                    false
                }
            }
            "en" => {
                if self.energy >= amount {
                    self.energy = ((self.energy - amount) * 100.0).round() / 100.0;
                    true
                } else {
                    false
                }
            }
            _ => true,
        }
    }

    /// Применение урона к HP
    pub fn apply_damage(&mut self, damage: f64, initiator_id: u8) -> f64 {
        let rounded_dmg = (damage * 100.0).round() / 100.0;
        self.hp = ((self.hp - rounded_dmg).max(0.0) * 100.0).round() / 100.0;

        if self.hp <= 0.0 && self.is_alive {
            self.is_alive = false;
            self.killer_id = Some(initiator_id);
        }

        rounded_dmg
    }

    /// Применение лечения
    pub fn apply_heal(&mut self, heal_amount: f64) -> f64 {
        let max_possible = (self.max_hp - self.hp).max(0.0);
        let actual_heal = ((heal_amount.min(max_possible)) * 100.0).round() / 100.0;

        self.hp = ((self.hp + actual_heal) * 100.0).round() / 100.0;

        // Если оживили лечением:
        if self.hp > 0.0 && !self.is_alive {
            self.is_alive = true;
            self.killer_id = None;
        }

        actual_heal
    }

    /// Начисление опыта
    pub fn add_exp(&mut self, exp: u32) {
        self.exp_earned += exp;
    }

    /// Добавление аффекта
    pub fn add_affect(&mut self, affect: Affect) {
        self.affects.push(affect);
    }

    /// Получение аффектов по имени действия
    pub fn get_affects_by_action(&self, action_key: &str) -> Vec<&Affect> {
        self.affects
            .iter()
            .filter(|a| a.action_key == action_key)
            .collect()
    }

    /// Удаление аффектов по имени действия
    pub fn remove_affects_by_action(&mut self, action_key: &str) {
        self.affects.retain(|a| a.action_key != action_key);
    }

    /// Проверка наличия аффекта
    pub fn has_affect(&self, action_key: &str) -> bool {
        self.affects.iter().any(|a| a.action_key == action_key)
    }

    /// Управление стриками неудач для псевдо-RNG
    pub fn get_fail_streak(&self, action_key: &str) -> u32 {
        self.fail_streaks.get(action_key).copied().unwrap_or(0)
    }

    pub fn inc_fail_streak(&mut self, action_key: &str) {
        let current = self.get_fail_streak(action_key);
        self.fail_streaks.insert(action_key.to_string(), current + 1);
    }

    pub fn reset_fail_streak(&mut self, action_key: &str) {
        self.fail_streaks.remove(action_key);
    }

    /// Жизненный цикл эффектов в конце раунда:
    /// - Round: удаляются
    /// - Long: duration--, если 0 -> удаляются
    /// - Passive: остаются
    pub fn tick_affects_round_end(&mut self) {
        self.affects.retain_mut(|a| match a.affect_type {
            AffectType::Round => false,
            AffectType::Long => {
                if a.duration > 1 {
                    a.duration -= 1;
                    true
                } else {
                    false
                }
            }
            AffectType::Passive => true,
        });
    }
}

/// Общее изменяемое состояние всего боя
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BattleState {
    pub players: Vec<DynamicState>,
    pub round: u32,
    pub no_damage_streak: u32,
}

impl BattleState {
    pub fn get_player_mut(&mut self, id: u8) -> Option<&mut DynamicState> {
        self.players.get_mut(id as usize)
    }

    pub fn get_player(&self, id: u8) -> Option<&DynamicState> {
        self.players.get(id as usize)
    }

    pub fn is_alive(&self, id: u8) -> bool {
        self.get_player(id).map_or(false, |p| p.is_alive)
    }

    pub fn alive_player_ids(&self) -> Vec<u8> {
        self.players
            .iter()
            .enumerate()
            .filter(|(_, p)| p.is_alive)
            .map(|(i, _)| i as u8)
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_dynamic_state_damage_and_death() {
        let mut state = DynamicState::new(100.0, 50.0, 100.0);
        assert!(state.is_alive);

        let dmg = state.apply_damage(40.0, 1);
        assert_eq!(dmg, 40.0);
        assert_eq!(state.hp, 60.0);
        assert!(state.is_alive);

        state.apply_damage(70.0, 2);
        assert_eq!(state.hp, 0.0);
        assert!(!state.is_alive);
        assert_eq!(state.killer_id, Some(2));
    }

    #[test]
    fn test_affects_lifecycle_tick() {
        let mut state = DynamicState::new(100.0, 50.0, 100.0);

        state.add_affect(Affect {
            action_key: "eclipse".to_string(),
            initiator_id: 1,
            affect_type: AffectType::Round,
            duration: 1,
            value: 0.0,
            proc: 1.0,
        });

        state.add_affect(Affect {
            action_key: "lightShield".to_string(),
            initiator_id: 1,
            affect_type: AffectType::Long,
            duration: 2,
            value: 15.0,
            proc: 1.0,
        });

        state.add_affect(Affect {
            action_key: "sweepingBlow".to_string(),
            initiator_id: 1,
            affect_type: AffectType::Passive,
            duration: 0,
            value: 0.0,
            proc: 1.0,
        });

        // 1-й тик раунда
        state.tick_affects_round_end();
        assert!(!state.has_affect("eclipse")); // Round удалился
        assert!(state.has_affect("lightShield")); // Long остался (duration стал 1)
        assert!(state.has_affect("sweepingBlow")); // Passive остался

        // 2-й тик раунда
        state.tick_affects_round_end();
        assert!(!state.has_affect("lightShield")); // Long удалился (duration закончился)
        assert!(state.has_affect("sweepingBlow")); // Passive остался
    }
}
