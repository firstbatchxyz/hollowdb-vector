use serde::de::DeserializeOwned;
use serde::Serialize;
use wasm_bindgen::JsValue;

use super::js_imports::{SmartWeave, log};

pub async fn read_foreign_contract_state<T: DeserializeOwned>(contract_address: &str) -> Result<T, String> {
    match SmartWeave::read_contract_state(contract_address).await {
        Ok(s) => {
            match s.into_serde() {
                Ok(v) => Ok(v),
                Err(e) => {
                    log(&format!("deserialization failed: {e:?}"));
                    Err(format!("{e:?}"))
                }
            }
        }
        Err(e) => {
            log(&format!("read foreign contract state error {e:?}"));
            Err(format!("{e:?}"))
        }
    }
}

pub async fn view_foreign_contract_state<T: DeserializeOwned, I: Serialize>(contract_address: &str, input: I) -> Result<T, String> {
    match SmartWeave::view_contract_state(contract_address, JsValue::from_serde(&input).unwrap()).await {
        Ok(s) => {
            match s.into_serde() {
                Ok(v) => Ok(v),
                Err(e) => {
                    log(&format!("deserialization failed: {e:?}"));
                    Err(format!("{e:?}"))
                }
            }
        },
        Err(e) => {
            log(&format!("view foreign contract state error {e:?}"));
            Err(format!("{e:?}"))
        }
    }
}

pub async fn write_foreign_contract<T: DeserializeOwned, I: Serialize>(contract_address: &str, input: I) -> Result<T, String> {
    match SmartWeave::write(contract_address, JsValue::from_serde(&input).unwrap()).await {
        Ok(s) => {
            match s.into_serde() {
                Ok(v) => Ok(v),
                Err(e) => {
                    log(&format!("deserialization failed: {e:?}"));
                    Err(format!("{e:?}"))
                }
            }
        },
        Err(e) => {
            log(&format!("write foreign contract state error {e:?}"));
            Err(format!("{e:?}"))
        }
    }
}