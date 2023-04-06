use danny_definition::action::{ActionResult, Knn, HandlerResult, KnnResult};
use danny_definition::state::{State};
use async_trait::async_trait;
use super::AsyncActionable;
use danny_flat_inference::{AnnoyFlat};
use warp_wasm_utils::contract_utils::js_imports::KV;

#[async_trait(? Send)]
impl AsyncActionable for Knn {
    async fn action(self, _caller: String, _state: State) -> ActionResult {
        let mut ann = AnnoyFlat::new(1024, 100, "Angular".to_string());
        ann.roots = KV::get("roots").await.unwrap().into_serde().unwrap();
        let mut result_vec = KnnResult { vec: Vec::new() };
        let (result, _distance, node_metadata) = ann.get_nns_by_vector(self.vec.clone(),
                                                                      self.n.clone() as usize,
                                                                      self.search_k.clone()).await;
        for (_i, id) in result.iter().enumerate() {
            result_vec.vec.push(node_metadata.get(id).unwrap().to_string());
        }
        Ok(HandlerResult::GetK(result_vec))
    }
}
