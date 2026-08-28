use rand::Rng;

/// Рандомное float значение в интервале [min, max)
pub fn rand_float(min: f64, max: f64) -> f64 {
    if min >= max {
        return min;
    }
    let mut rng = rand::thread_rng();
    rng.gen_range(min..max)
}

/// Рандомное целое значение в интервале [min, max]
pub fn rand_int(min: i32, max: i32) -> i32 {
    if min >= max {
        return min;
    }
    let mut rng = rand::thread_rng();
    rng.gen_range(min..=max)
}

/// Парсит выражение дайса и бросает float кубик:
/// "1d80+20" -> rand_float(1, 80) + 20
/// "1d100"   -> rand_float(1, 100)
/// "50"      -> 50.0
pub fn roll_dice(dice_str: &str) -> f64 {
    let trimmed = dice_str.trim();

    if let Some((dice_part, add_part)) = trimmed.split_once('+') {
        let add_val: f64 = add_part.trim().parse().unwrap_or(0.0);
        roll_dice_range(dice_part.trim()) + add_val
    } else if let Some((dice_part, sub_part)) = trimmed.split_once('-') {
        let sub_val: f64 = sub_part.trim().parse().unwrap_or(0.0);
        roll_dice_range(dice_part.trim()) - sub_val
    } else {
        roll_dice_range(trimmed)
    }
}

fn roll_dice_range(expr: &str) -> f64 {
    if let Some((min_str, max_str)) = expr.split_once('d') {
        let min: f64 = min_str.trim().parse().unwrap_or(1.0);
        let max: f64 = max_str.trim().parse().unwrap_or(1.0);
        rand_float(min, max)
    } else {
        expr.parse::<f64>().unwrap_or(0.0)
    }
}

/// Целочисленный бросок по формату "1d100" (включая границы):
/// "1d100" -> rand_int(1, 100)
pub fn roll_rndm(dice_str: &str) -> i32 {
    let trimmed = dice_str.trim();
    if let Some((min_str, max_str)) = trimmed.split_once('d') {
        let min: i32 = min_str.trim().parse().unwrap_or(1);
        let max: i32 = max_str.trim().parse().unwrap_or(1);
        rand_int(min, max)
    } else {
        trimmed.parse::<i32>().unwrap_or(0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rand_float_range() {
        for _ in 0..100 {
            let val = rand_float(5.0, 10.0);
            assert!(val >= 5.0 && val <= 10.0);
        }
    }

    #[test]
    fn test_rand_int_range() {
        for _ in 0..100 {
            let val = rand_int(1, 6);
            assert!((1..=6).contains(&val));
        }
    }

    #[test]
    fn test_roll_dice_plus() {
        for _ in 0..100 {
            let val = roll_dice("1d80+20");
            assert!(val >= 21.0 && val <= 100.0);
        }
    }

    #[test]
    fn test_roll_dice_simple() {
        for _ in 0..100 {
            let val = roll_dice("1d100");
            assert!(val >= 1.0 && val <= 100.0);
        }
    }

    #[test]
    fn test_roll_rndm() {
        for _ in 0..100 {
            let val = roll_rndm("1d100");
            assert!((1..=100).contains(&val));
        }
    }
}
