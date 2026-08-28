use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Неизменяемое описание оружия персонажа
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WeaponDef {
    pub weapon_type: String, // "cut", "thrust", "chop", "stun", "range", "heal"
    pub min_hit: f64,
    pub max_hit: f64,
}

impl Default for WeaponDef {
    fn default() -> Self {
        Self {
            weapon_type: "cut".to_string(),
            min_hit: 1.0,
            max_hit: 5.0,
        }
    }
}

/// Неизменяемые статические параметры игрока (не меняются в ходе боя)
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlayerDef {
    pub id: u8,
    pub nick: String,
    pub clan_id: Option<String>,
    pub weapon: WeaponDef,
    pub skills: HashMap<String, u8>,
    pub magics: HashMap<String, u8>,
    pub passives: HashMap<String, u8>,
    pub resists: HashMap<String, f64>,
    pub base_stats: HashMap<String, f64>,
    pub max_target: u32,
}

impl PlayerDef {
    pub fn get_skill_lvl(&self, skill_name: &str) -> u8 {
        self.skills.get(skill_name).copied().unwrap_or(0)
    }

    pub fn get_magic_lvl(&self, magic_name: &str) -> u8 {
        self.magics.get(magic_name).copied().unwrap_or(0)
    }

    pub fn get_passive_lvl(&self, passive_name: &str) -> u8 {
        self.passives.get(passive_name).copied().unwrap_or(0)
    }

    pub fn get_base_stat(&self, stat_name: &str) -> f64 {
        self.base_stats.get(stat_name).copied().unwrap_or(0.0)
    }

    pub fn get_resist(&self, resist_type: &str) -> f64 {
        self.resists.get(resist_type).copied().unwrap_or(0.0)
    }
}

/// Неизменяемая конфигурация всего боя
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BattleDefs {
    pub players: Vec<PlayerDef>,
}

impl BattleDefs {
    pub fn get_player(&self, id: u8) -> Option<&PlayerDef> {
        self.players.iter().find(|p| p.id == id)
    }

    pub fn is_ally(&self, id1: u8, id2: u8, include_self: bool) -> bool {
        if id1 == id2 {
            return include_self;
        }

        let p1 = self.get_player(id1);
        let p2 = self.get_player(id2);

        match (p1, p2) {
            (Some(p1), Some(p2)) => {
                if let (Some(c1), Some(c2)) = (&p1.clan_id, &p2.clan_id) {
                    !c1.is_empty() && c1 == c2
                } else {
                    false
                }
            }
            _ => false,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_battle_defs_clan_allies() {
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

        assert!(defs.is_ally(0, 1, false)); // Соклановцы
        assert!(!defs.is_ally(0, 2, false)); // Разные кланы
        assert!(defs.is_ally(0, 0, true)); // Сам себе союзник
        assert!(!defs.is_ally(0, 0, false)); // Без self
    }
}
