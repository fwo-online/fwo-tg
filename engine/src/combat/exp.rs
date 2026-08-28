/// Опыт за физический урон: round(effect * 8).
/// Если цель — союзник и нет эффекта глюков, опыт = 0.
pub fn calculate_phys_exp(damage: f64, is_ally: bool, has_glitch: bool) -> u32 {
    if is_ally && !has_glitch {
        0
    } else {
        (damage * 8.0).round() as u32
    }
}

/// Опыт за лечение: round(effect * 10) только при лечении союзника.
pub fn calculate_heal_exp(heal_amount: f64, is_ally: bool) -> u32 {
    if is_ally {
        (heal_amount * 10.0).round() as u32
    } else {
        0
    }
}

/// Опыт за стандартную магию: round(base_exp * proc)
pub fn calculate_magic_exp(base_exp: u32, proc: f64) -> u32 {
    ((base_exp as f64) * proc).round() as u32
}

/// Опыт за длительную магию: round((base_exp * proc * effect) / 4)
pub fn calculate_long_magic_exp(base_exp: u32, proc: f64, effect: f64) -> u32 {
    (((base_exp as f64) * proc * effect) / 4.0).round() as u32
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_phys_exp() {
        assert_eq!(calculate_phys_exp(10.0, false, false), 80);
        assert_eq!(calculate_phys_exp(10.0, true, false), 0); // По союзнику 0
        assert_eq!(calculate_phys_exp(10.0, true, true), 80); // По союзнику с глюками 80
    }

    #[test]
    fn test_heal_exp() {
        assert_eq!(calculate_heal_exp(15.0, true), 150);
        assert_eq!(calculate_heal_exp(15.0, false), 0);
    }
}
