use napi_derive::napi;
use serde::{Deserialize, Serialize};

/// Боевое событие для структурированного лога раунда
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BattleEvent {
    pub event_type: String, // "damage", "heal", "blocked", "dodged", "parried", "failed_chance", "no_resource", "redirected", "affect_applied", "death", "exp"
    pub initiator_id: u8,
    pub target_id: u8,
    pub action_key: String,
    pub value: f64,
    pub reason: Option<String>,
    pub target_hp_left: Option<f64>,
    pub exp: Option<u32>,
}

impl BattleEvent {
    pub fn damage(initiator_id: u8, target_id: u8, action_key: &str, value: f64, target_hp_left: f64, exp: u32) -> Self {
        Self {
            event_type: "damage".to_string(),
            initiator_id,
            target_id,
            action_key: action_key.to_string(),
            value: (value * 100.0).round() / 100.0,
            reason: None,
            target_hp_left: Some((target_hp_left * 100.0).round() / 100.0),
            exp: Some(exp),
        }
    }

    pub fn heal(initiator_id: u8, target_id: u8, action_key: &str, value: f64, target_hp_left: f64, exp: u32) -> Self {
        Self {
            event_type: "heal".to_string(),
            initiator_id,
            target_id,
            action_key: action_key.to_string(),
            value: (value * 100.0).round() / 100.0,
            reason: None,
            target_hp_left: Some((target_hp_left * 100.0).round() / 100.0),
            exp: Some(exp),
        }
    }

    pub fn blocked(initiator_id: u8, target_id: u8, action_key: &str, reason: &str) -> Self {
        Self {
            event_type: "blocked".to_string(),
            initiator_id,
            target_id,
            action_key: action_key.to_string(),
            value: 0.0,
            reason: Some(reason.to_string()),
            target_hp_left: None,
            exp: None,
        }
    }

    pub fn dodged(initiator_id: u8, target_id: u8, action_key: &str) -> Self {
        Self {
            event_type: "dodged".to_string(),
            initiator_id,
            target_id,
            action_key: action_key.to_string(),
            value: 0.0,
            reason: Some("DODGE".to_string()),
            target_hp_left: None,
            exp: None,
        }
    }

    pub fn parried(initiator_id: u8, target_id: u8, action_key: &str) -> Self {
        Self {
            event_type: "parried".to_string(),
            initiator_id,
            target_id,
            action_key: action_key.to_string(),
            value: 0.0,
            reason: Some("PARRY".to_string()),
            target_hp_left: None,
            exp: None,
        }
    }

    pub fn failed_chance(initiator_id: u8, target_id: u8, action_key: &str) -> Self {
        Self {
            event_type: "failed_chance".to_string(),
            initiator_id,
            target_id,
            action_key: action_key.to_string(),
            value: 0.0,
            reason: Some("CHANCE_FAIL".to_string()),
            target_hp_left: None,
            exp: None,
        }
    }

    pub fn no_resource(initiator_id: u8, target_id: u8, action_key: &str, resource: &str) -> Self {
        Self {
            event_type: "no_resource".to_string(),
            initiator_id,
            target_id,
            action_key: action_key.to_string(),
            value: 0.0,
            reason: Some(format!("NO_{}", resource.to_uppercase())),
            target_hp_left: None,
            exp: None,
        }
    }

    pub fn redirected(initiator_id: u8, old_target: u8, new_target: u8, action_key: &str) -> Self {
        Self {
            event_type: "redirected".to_string(),
            initiator_id,
            target_id: new_target,
            action_key: action_key.to_string(),
            value: old_target as f64,
            reason: Some("GLITCH_REDIRECT".to_string()),
            target_hp_left: None,
            exp: None,
        }
    }

    pub fn affect_applied(initiator_id: u8, target_id: u8, action_key: &str, duration: u32, value: f64) -> Self {
        Self {
            event_type: "affect_applied".to_string(),
            initiator_id,
            target_id,
            action_key: action_key.to_string(),
            value: (value * 100.0).round() / 100.0,
            reason: Some(format!("duration:{duration}")),
            target_hp_left: None,
            exp: None,
        }
    }

    pub fn death(player_id: u8, killer_id: u8, action_key: &str) -> Self {
        Self {
            event_type: "death".to_string(),
            initiator_id: killer_id,
            target_id: player_id,
            action_key: action_key.to_string(),
            value: 0.0,
            reason: Some("KILLED".to_string()),
            target_hp_left: Some(0.0),
            exp: None,
        }
    }
}
