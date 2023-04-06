
use std::cell::RefCell;

use serde_json::Error;
use wasm_bindgen::prelude::*;

use crate::contract;
use danny_definition::action::{Action, HandlerResult};
use danny_definition::error::ContractError;
use danny_definition::state::State;

thread_local! {
    static STATE: RefCell<State> = RefCell::default();
}

#[wasm_bindgen()]
pub async fn handle(interaction: JsValue) -> Option<JsValue> {
    let action: Result<Action, Error> = interaction.into_serde();

    if action.is_err() {
        let error = Err::<HandlerResult, _>(ContractError::RuntimeError(
            "Error while parsing input".to_string(),
        ));

        return Some(JsValue::from_serde(&error).unwrap());
    }

    let state = STATE.with(|service| service.borrow().clone());
    let result = contract::handle(state, action.unwrap()).await;

    if let Ok(HandlerResult::Write(state)) = result {
        STATE.with(|service| service.replace(state));
        None
    } else {
        Some(JsValue::from_serde(&result).unwrap())
    }
}

#[wasm_bindgen(js_name = initState)]
pub fn init_state(state: &JsValue) {
    let state_parsed: State = state.into_serde().unwrap();

    STATE.with(|service| service.replace(state_parsed));
}

#[wasm_bindgen(js_name = currentState)]
pub fn current_state() -> JsValue {
    let current_state = STATE.with(|service| service.borrow().clone());
    JsValue::from_serde(&current_state).unwrap()
}

#[wasm_bindgen()]
pub fn version() -> i32 {
    return 1;
}

#[wasm_bindgen]
pub fn lang() -> i32 {
    return 2;
}
