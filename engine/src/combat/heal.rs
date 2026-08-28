use crate::domain::defs::PlayerDef;
use crate::domain::state::DynamicState;
use crate::rng::dice::rand_float;

/// Расчёт базового объёма лечения
pub fn calculate_raw_heal(initiator: &PlayerDef, proc: f64) -> f64 {
    let min = initiator.get_base_stat("heal.min");
    let max = initiator.get_base_stat("heal.max");
    let base_heal = if min > 0.0 && max >= min {
        rand_float(min, max)
    } else {
        rand_float(5.0, 15.0)
    };

    ((base_heal * proc) * 100.0).round() / 100.0
}

/// Применение лечения к цели
pub fn execute_heal(target_state: &mut DynamicState, heal_amount: f64) -> f64 {
    target_state.apply_heal(heal_amount)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_execute_heal_capping() {
        let mut state = DynamicState::new(100.0, 50.0, 100.0);
        state.hp = 80.0;

        // Хил на 30 HP при недостающих 20 HP восстановит ровно 20
        let actual = execute_heal(&mut state, 30.0);
        assert_eq!(actual, 20.0);
        assert_eq!(state.hp, 100.0);
    }
}
