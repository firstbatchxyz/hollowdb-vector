use async_trait::async_trait;
use danny_definition::{action::ActionResult, state::State};


pub mod fetcher;
pub mod knn;

pub use fetcher::*;
pub use knn::*;


pub trait Actionable {
    fn action(self, caller: String, state: State) -> ActionResult;
}

#[async_trait(? Send)]
pub trait AsyncActionable {
    async fn action(self, caller: String, state: State) -> ActionResult;
}
