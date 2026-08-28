#![deny(clippy::all)]

use napi_derive::napi;
use serde::{Deserialize, Serialize};

#[napi]
pub fn ping(msg: String) -> String {
    format!("pong: {msg} (from Rust engine)")
}

#[napi]
pub fn float_number(val: f64) -> f64 {
    (val * 100.0).round() / 100.0
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EngineStatus {
    pub ready: bool,
    pub version: String,
    pub engine_name: String,
}

#[napi]
pub fn get_engine_status() -> EngineStatus {
    EngineStatus {
        ready: true,
        version: "0.1.0".to_string(),
        engine_name: "fwo-engine-rs".to_string(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ping() {
        assert_eq!(ping("test".to_string()), "pong: test (from Rust engine)");
    }

    #[test]
    fn test_float_number() {
        assert_eq!(float_number(12.3456), 12.35);
        assert_eq!(float_number(0.1 + 0.2), 0.3);
        assert_eq!(float_number(1.999), 2.0);
    }
}

