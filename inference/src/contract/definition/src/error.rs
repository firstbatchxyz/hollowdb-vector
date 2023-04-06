use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(JsonSchema, Serialize, Deserialize, Debug)]
#[serde(tag = "kind", content = "data")]
pub enum ContractError {
    RuntimeError(String),
    TransferAmountMustBeHigherThanZero,
    IDontLikeThisContract,
    CallerBalanceNotEnough(u64),
    OnlyOwnerCanEvolve,
    EvolveNotAllowed,
    WalletHasNoBalanceDefined(String)
  }
  