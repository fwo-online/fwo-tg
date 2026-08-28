use crate::rng::dice::roll_rndm;

/// Проверка базового шанса в процентах (0.0 .. 100.0)
/// Аналог MiscService.chance: 1d100 <= percent
pub fn check_chance(chance_percent: f64) -> bool {
    let roll = roll_rndm("1d100") as f64;
    roll <= chance_percent
}

/// Проверка псевдослучайного шанса со стриком неудач.
/// Формула: effective_p = 1 - (1 - p)^(streak + 1)
/// С каждой неудачей вероятность следующего успеха возрастает, приближаясь к 100%.
pub fn check_pseudo_random_chance(chance_percent: f64, fail_streak: u32) -> bool {
    let p = (chance_percent / 100.0).clamp(0.0, 1.0);
    let effective_p = 1.0 - (1.0 - p).powi((fail_streak + 1) as i32);
    check_chance(effective_p * 100.0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_guaranteed_chance() {
        assert!(check_chance(100.0));
        assert!(!check_chance(0.0));
    }

    #[test]
    fn test_pseudo_random_streak_guarantee() {
        // Даже при шансе 10%, со стриком 50 шанс практически 100%
        assert!(check_pseudo_random_chance(10.0, 50));
    }
}
