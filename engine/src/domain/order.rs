use napi_derive::napi;
use serde::{Deserialize, Serialize};
use crate::domain::defs::BattleDefs;

/// Тип допустимой цели для заказа/действия
#[napi(string_enum)]
#[derive(Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum OrderTargetType {
    SelfTarget,     // Только сам
    Enemy,          // Враг
    Team,           // Союзник (включая себя)
    TeamExceptSelf, // Союзник кроме себя
    All,            // Любой игрок
}

/// Заказ действия игрока в раунде
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Order {
    pub initiator: u8,
    pub target: u8,
    pub action: String,
    pub proc: f64, // 0..100 (%)
}

impl Order {
    pub fn proc_fraction(&self) -> f64 {
        self.proc / 100.0
    }

    /// Проверка соответствия цели типу заказа
    pub fn is_valid_target(&self, target_type: OrderTargetType, defs: &BattleDefs) -> bool {
        match target_type {
            OrderTargetType::SelfTarget => self.initiator == self.target,
            OrderTargetType::Enemy => !defs.is_ally(self.initiator, self.target, true),
            OrderTargetType::Team => defs.is_ally(self.initiator, self.target, true),
            OrderTargetType::TeamExceptSelf => defs.is_ally(self.initiator, self.target, false),
            OrderTargetType::All => true,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::defs::{PlayerDef, WeaponDef};
    use std::collections::HashMap;

    #[test]
    fn test_order_target_validation() {
        let defs = BattleDefs {
            players: vec![
                PlayerDef {
                    id: 0,
                    nick: "Alice".to_string(),
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
                    nick: "Bob".to_string(),
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
                    nick: "Charlie".to_string(),
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

        let attack_order = Order {
            initiator: 0,
            target: 2,
            action: "attack".to_string(),
            proc: 100.0,
        };
        assert!(attack_order.is_valid_target(OrderTargetType::Enemy, &defs));
        assert!(!attack_order.is_valid_target(OrderTargetType::Team, &defs));

        let heal_order = Order {
            initiator: 0,
            target: 1,
            action: "lightHeal".to_string(),
            proc: 100.0,
        };
        assert!(heal_order.is_valid_target(OrderTargetType::Team, &defs));
        assert!(heal_order.is_valid_target(OrderTargetType::TeamExceptSelf, &defs));
    }
}
