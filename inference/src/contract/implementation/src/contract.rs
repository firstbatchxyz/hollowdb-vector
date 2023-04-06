use async_recursion::async_recursion;

use danny_definition::action::{Action, ActionResult};
use danny_definition::state::State;

use crate::actions::{*};
use warp_wasm_utils::contract_utils::js_imports::{SmartWeave};

#[async_recursion(? Send)]
pub async fn handle(state: State, action: Action) -> ActionResult {
    let effective_caller = SmartWeave::caller();
    match action {
        Action::Fetcher(action) => action.action(effective_caller, state).await,
        Action::Knn(action) => action.action(effective_caller, state).await,
    }
}
