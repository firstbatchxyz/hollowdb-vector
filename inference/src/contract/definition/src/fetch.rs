use serde::de::DeserializeOwned;

use warp_wasm_utils::contract_utils::js_imports::log;
use warp_wasm_utils::contract_utils::js_imports::{fetch};


pub async fn run<T: DeserializeOwned>(url: &str) -> T {
    let body: T = fetch(url).await.into_serde().unwrap();
    log("fetching model as T");
    return body;
}