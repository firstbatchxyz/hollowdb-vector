use serde::de::DeserializeOwned;
use serde::Serialize;
use wasm_bindgen::JsValue;

use super::js_imports::KV;

pub async fn kv_get<T: DeserializeOwned + Default>(key: &str) -> Result<T, String> {
    match KV::get(key).await {
        Ok(a) if !a.is_null() => Ok(a.into_serde().unwrap()),
        // handle the error properly!
        Ok(_) => Err("not found".to_owned()),
        Err(e) => Err(format!("{e:?}")),
    }

}

pub async fn kv_put<T: Serialize>(key: &str, value: T) -> Result<(), String> {
    match KV::put(key, JsValue::from_serde(&value).unwrap()).await {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("{e:?}"))
    }
}