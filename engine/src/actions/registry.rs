use crate::domain::order::OrderTargetType;
use std::collections::HashMap;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ActionCategory {
    Phys,
    Magic,
    Skill,
    Protect,
    Heal,
    Buff,
    CrowdControl,
    Passive,
}

/// Чистая конфигурация механики действия (без UI, локализации и форматирования)
#[derive(Debug, Clone)]
pub struct ActionDef {
    pub key: String,
    pub category: ActionCategory,
    pub target_type: OrderTargetType,
    pub cost_type: String, // "mp", "en", or ""
    pub base_cost: f64,
    pub base_exp: u32,
    pub base_chance: f64,
    pub base_effect_expr: String, // e.g. "1d8+10", "1d3+5"
    pub stage_index: usize,
}

#[derive(Debug, Clone)]
pub struct ActionRegistry {
    pub actions: HashMap<String, ActionDef>,
    pub stages: Vec<String>,
}

impl ActionRegistry {
    pub fn new() -> Self {
        let mut registry = Self {
            actions: HashMap::new(),
            stages: Vec::new(),
        };

        registry.init_standard_actions();
        registry
    }

    pub fn get(&self, action_key: &str) -> Option<&ActionDef> {
        self.actions.get(action_key)
    }

    fn register(&mut self, def: ActionDef) {
        self.actions.insert(def.key.clone(), def);
    }

    fn init_standard_actions(&mut self) {
        // Порядок выполнения стадий раунда
        self.stages = vec![
            "silence".to_string(),
            "sleep".to_string(),
            "lightShield".to_string(),
            "magicWall".to_string(),
            "stoneSkin".to_string(),
            "glitch".to_string(),
            "madness".to_string(),
            "paralysis".to_string(),
            "eclipse".to_string(),
            "dodge".to_string(),
            "parry".to_string(),
            "disarm".to_string(),
            "shieldBlock".to_string(),
            "protect".to_string(),
            "regeneration".to_string(),
            "attack".to_string(),
            "fireBall".to_string(),
            "magicArrow".to_string(),
            "frostTouch".to_string(),
            "vampirism".to_string(),
            "lightHeal".to_string(),
            "handsHeal".to_string(),
            "secondLife".to_string(),
            "nineLives".to_string(),
        ];

        // 1. Базовые действия
        self.register(ActionDef {
            key: "attack".to_string(),
            category: ActionCategory::Phys,
            target_type: OrderTargetType::All,
            cost_type: "".to_string(),
            base_cost: 0.0,
            base_exp: 0,
            base_chance: 100.0,
            base_effect_expr: "".to_string(),
            stage_index: 15,
        });

        self.register(ActionDef {
            key: "protect".to_string(),
            category: ActionCategory::Protect,
            target_type: OrderTargetType::Team,
            cost_type: "".to_string(),
            base_cost: 0.0,
            base_exp: 0,
            base_chance: 100.0,
            base_effect_expr: "".to_string(),
            stage_index: 13,
        });

        // 2. Скиллы
        self.register(ActionDef {
            key: "dodge".to_string(),
            category: ActionCategory::Skill,
            target_type: OrderTargetType::SelfTarget,
            cost_type: "en".to_string(),
            base_cost: 10.0,
            base_exp: 15,
            base_chance: 85.0,
            base_effect_expr: "".to_string(),
            stage_index: 9,
        });

        self.register(ActionDef {
            key: "parry".to_string(),
            category: ActionCategory::Skill,
            target_type: OrderTargetType::SelfTarget,
            cost_type: "en".to_string(),
            base_cost: 10.0,
            base_exp: 15,
            base_chance: 80.0,
            base_effect_expr: "".to_string(),
            stage_index: 10,
        });

        self.register(ActionDef {
            key: "disarm".to_string(),
            category: ActionCategory::Skill,
            target_type: OrderTargetType::Enemy,
            cost_type: "en".to_string(),
            base_cost: 12.0,
            base_exp: 20,
            base_chance: 75.0,
            base_effect_expr: "".to_string(),
            stage_index: 11,
        });

        self.register(ActionDef {
            key: "shieldBlock".to_string(),
            category: ActionCategory::Skill,
            target_type: OrderTargetType::SelfTarget,
            cost_type: "en".to_string(),
            base_cost: 8.0,
            base_exp: 10,
            base_chance: 90.0,
            base_effect_expr: "".to_string(),
            stage_index: 12,
        });

        self.register(ActionDef {
            key: "regeneration".to_string(),
            category: ActionCategory::Skill,
            target_type: OrderTargetType::SelfTarget,
            cost_type: "en".to_string(),
            base_cost: 5.0,
            base_exp: 10,
            base_chance: 100.0,
            base_effect_expr: "1d5+5".to_string(),
            stage_index: 14,
        });

        // 3. Магии контроля
        self.register(ActionDef {
            key: "eclipse".to_string(),
            category: ActionCategory::CrowdControl,
            target_type: OrderTargetType::Enemy,
            cost_type: "mp".to_string(),
            base_cost: 16.0,
            base_exp: 80,
            base_chance: 80.0,
            base_effect_expr: "".to_string(),
            stage_index: 8,
        });

        self.register(ActionDef {
            key: "glitch".to_string(),
            category: ActionCategory::CrowdControl,
            target_type: OrderTargetType::Enemy,
            cost_type: "mp".to_string(),
            base_cost: 12.0,
            base_exp: 80,
            base_chance: 80.0,
            base_effect_expr: "".to_string(),
            stage_index: 5,
        });

        self.register(ActionDef {
            key: "madness".to_string(),
            category: ActionCategory::CrowdControl,
            target_type: OrderTargetType::Enemy,
            cost_type: "mp".to_string(),
            base_cost: 14.0,
            base_exp: 80,
            base_chance: 75.0,
            base_effect_expr: "".to_string(),
            stage_index: 6,
        });

        self.register(ActionDef {
            key: "paralysis".to_string(),
            category: ActionCategory::CrowdControl,
            target_type: OrderTargetType::Enemy,
            cost_type: "mp".to_string(),
            base_cost: 15.0,
            base_exp: 80,
            base_chance: 70.0,
            base_effect_expr: "".to_string(),
            stage_index: 7,
        });

        self.register(ActionDef {
            key: "sleep".to_string(),
            category: ActionCategory::CrowdControl,
            target_type: OrderTargetType::Enemy,
            cost_type: "mp".to_string(),
            base_cost: 10.0,
            base_exp: 50,
            base_chance: 80.0,
            base_effect_expr: "".to_string(),
            stage_index: 1,
        });

        // 4. Защитная магия и щиты
        self.register(ActionDef {
            key: "lightShield".to_string(),
            category: ActionCategory::Buff,
            target_type: OrderTargetType::Team,
            cost_type: "mp".to_string(),
            base_cost: 3.0,
            base_exp: 8,
            base_chance: 90.0,
            base_effect_expr: "1d1+10".to_string(),
            stage_index: 2,
        });

        self.register(ActionDef {
            key: "magicWall".to_string(),
            category: ActionCategory::Buff,
            target_type: OrderTargetType::Team,
            cost_type: "mp".to_string(),
            base_cost: 5.0,
            base_exp: 15,
            base_chance: 85.0,
            base_effect_expr: "1d5+15".to_string(),
            stage_index: 3,
        });

        // 5. Боевая магия
        self.register(ActionDef {
            key: "fireBall".to_string(),
            category: ActionCategory::Magic,
            target_type: OrderTargetType::Enemy,
            cost_type: "mp".to_string(),
            base_cost: 24.0,
            base_exp: 10,
            base_chance: 95.0,
            base_effect_expr: "1d3+5".to_string(),
            stage_index: 16,
        });

        self.register(ActionDef {
            key: "magicArrow".to_string(),
            category: ActionCategory::Magic,
            target_type: OrderTargetType::Enemy,
            cost_type: "mp".to_string(),
            base_cost: 8.0,
            base_exp: 10,
            base_chance: 90.0,
            base_effect_expr: "1d2+4".to_string(),
            stage_index: 17,
        });

        self.register(ActionDef {
            key: "vampirism".to_string(),
            category: ActionCategory::Magic,
            target_type: OrderTargetType::Enemy,
            cost_type: "mp".to_string(),
            base_cost: 15.0,
            base_exp: 25,
            base_chance: 85.0,
            base_effect_expr: "1d4+6".to_string(),
            stage_index: 19,
        });

        // 6. Лечение
        self.register(ActionDef {
            key: "lightHeal".to_string(),
            category: ActionCategory::Heal,
            target_type: OrderTargetType::Team,
            cost_type: "mp".to_string(),
            base_cost: 5.0,
            base_exp: 20,
            base_chance: 95.0,
            base_effect_expr: "1d5+10".to_string(),
            stage_index: 20,
        });

        self.register(ActionDef {
            key: "handsHeal".to_string(),
            category: ActionCategory::Heal,
            target_type: OrderTargetType::Team,
            cost_type: "mp".to_string(),
            base_cost: 10.0,
            base_exp: 40,
            base_chance: 90.0,
            base_effect_expr: "1d10+20".to_string(),
            stage_index: 21,
        });

        // 7. Пассивки
        self.register(ActionDef {
            key: "sweepingBlow".to_string(),
            category: ActionCategory::Passive,
            target_type: OrderTargetType::SelfTarget,
            cost_type: "".to_string(),
            base_cost: 0.0,
            base_exp: 0,
            base_chance: 50.0,
            base_effect_expr: "".to_string(),
            stage_index: 0,
        });

        self.register(ActionDef {
            key: "lacerate".to_string(),
            category: ActionCategory::Passive,
            target_type: OrderTargetType::SelfTarget,
            cost_type: "".to_string(),
            base_cost: 0.0,
            base_exp: 0,
            base_chance: 40.0,
            base_effect_expr: "".to_string(),
            stage_index: 0,
        });

        self.register(ActionDef {
            key: "nineLives".to_string(),
            category: ActionCategory::Passive,
            target_type: OrderTargetType::SelfTarget,
            cost_type: "".to_string(),
            base_cost: 0.0,
            base_exp: 0,
            base_chance: 100.0,
            base_effect_expr: "".to_string(),
            stage_index: 23,
        });
    }
}
