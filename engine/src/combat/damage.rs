use crate::domain::defs::PlayerDef;
use crate::rng::dice::rand_float;

/// Расчёт базового физического урона оружия
pub fn calculate_raw_phys_hit(initiator: &PlayerDef, proc: f64) -> f64 {
    let min = initiator.weapon.min_hit;
    let max = initiator.weapon.max_hit;
    let hit = rand_float(min, max);
    let phys_att = initiator.get_base_stat("phys.attack");
    let multiplier = 1.0 + 0.01 * phys_att;

    (hit * proc * multiplier * 100.0).round() / 100.0
}

/// Расчёт базового магического урона
pub fn calculate_raw_magic_hit(initiator: &PlayerDef, base_effect: f64, proc: f64) -> f64 {
    let magic_att = initiator.get_base_stat("magic.attack");
    let multiplier = 1.0 + 0.01 * magic_att;

    (base_effect * proc * multiplier * 100.0).round() / 100.0
}

/// Применение сопротивлений цели
pub fn apply_resists(damage: f64, target: &PlayerDef, damage_type: &str) -> f64 {
    let resist = target.get_resist(damage_type).clamp(0.0, 1.0);
    let final_dmg = damage * (1.0 - resist);
    (final_dmg * 100.0).round() / 100.0
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::defs::WeaponDef;
    use std::collections::HashMap;

    #[test]
    fn test_phys_hit_calculation() {
        let mut base_stats = HashMap::new();
        base_stats.insert("phys.attack".to_string(), 50.0); // +50% урона

        let player = PlayerDef {
            id: 0,
            nick: "Warrior".to_string(),
            clan_id: None,
            weapon: WeaponDef {
                weapon_type: "cut".to_string(),
                min_hit: 10.0,
                max_hit: 10.0,
            },
            skills: HashMap::new(),
            magics: HashMap::new(),
            passives: HashMap::new(),
            resists: HashMap::new(),
            base_stats,
            max_target: 1,
        };

        // 10.0 * 1.0 (proc) * 1.5 (attack mod) = 15.0
        let hit = calculate_raw_phys_hit(&player, 1.0);
        assert_eq!(hit, 15.0);

        // При 50% proc: 10.0 * 0.5 * 1.5 = 7.5
        let hit_half = calculate_raw_phys_hit(&player, 0.5);
        assert_eq!(hit_half, 7.5);
    }

    #[test]
    fn test_resist_application() {
        let mut resists = HashMap::new();
        resists.insert("phys".to_string(), 0.2); // 20% резист

        let target = PlayerDef {
            id: 1,
            nick: "Tank".to_string(),
            clan_id: None,
            weapon: WeaponDef::default(),
            skills: HashMap::new(),
            magics: HashMap::new(),
            passives: HashMap::new(),
            resists,
            base_stats: HashMap::new(),
            max_target: 1,
        };

        // 100 урона - 20% = 80.0
        let reduced = apply_resists(100.0, &target, "phys");
        assert_eq!(reduced, 80.0);
    }
}
