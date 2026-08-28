/// Результат выполнения боевого действия в Rust-ядре
#[derive(Debug, Clone, PartialEq)]
pub enum ActionResult {
    Success {
        value: f64,
        exp: u32,
        target_hp_left: f64,
    },
    Blocked {
        reason: String,
    },
    Dodged,
    Parried,
    FailedChance,
    NoResource {
        resource_type: String,
    },
    Redirected {
        new_target_id: u8,
    },
}

/// Решение перехватчика (хука) жизненного цикла
#[derive(Debug, Clone, PartialEq)]
pub enum HookDecision {
    Continue,
    Block { reason: String },
    NegateDamage { reason: String },
    Redirect { new_target_id: u8 },
    ModifyDamage { factor: f64 },
}
