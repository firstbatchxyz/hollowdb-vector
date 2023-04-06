use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum_macros::EnumIter;

#[derive(JsonSchema, Serialize, Deserialize, Clone, Default, Debug)]
#[serde(rename_all = "camelCase")]
pub struct State {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    pub datasets: Vec<String>,
}

#[derive(JsonSchema, Clone, Debug, Serialize, Deserialize, EnumIter)]
#[serde(rename_all = "camelCase", tag = "function")]
pub enum ContractState {
    State(State)
}