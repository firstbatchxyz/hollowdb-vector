use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum_macros::EnumIter;

use crate::error::ContractError;
use crate::state::{State};


#[derive(JsonSchema, Clone, Debug, Serialize, Deserialize, PartialEq, Default)]
#[serde(rename_all = "camelCase")]
pub struct Fetcher {
    pub manifest_id: String,
    pub files: Vec<String>,
}

#[derive(JsonSchema, Clone, Debug, Serialize, Deserialize, PartialEq, Default)]
#[serde(rename_all = "camelCase")]
pub struct Knn {
    pub vec: Vec<f64>,
    pub n: i64,
    pub search_k: i64
}


#[derive(JsonSchema, Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase", tag = "function")]
pub enum Action {

    Fetcher(Fetcher),
    Knn(Knn),

}

#[derive(JsonSchema, Clone, Debug, Serialize, Deserialize, PartialEq, EnumIter)]
#[serde(rename_all = "camelCase", tag = "function")]
pub enum View {
    Knn(Knn),
    KnnResult(KnnResult),
}

#[derive(JsonSchema, Clone, Debug, Serialize, Deserialize, PartialEq, EnumIter)]
#[serde(rename_all = "camelCase", tag = "function")]
pub enum WriteAction {
    Fetcher(Fetcher),
}

#[derive(JsonSchema, Clone, Debug, Serialize, Deserialize, Hash, PartialEq, Eq, Default)]
#[serde(rename_all = "camelCase")]
pub struct KnnResult {
    pub vec: Vec<String>
}

#[derive(Serialize, Deserialize)]
#[serde(untagged)]
pub enum HandlerResult {
    Write(State),
    GetK(KnnResult),
}

pub type ActionResult = Result<HandlerResult, ContractError>;
