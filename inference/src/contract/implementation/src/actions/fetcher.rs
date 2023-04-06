use danny_definition::action::{ActionResult, Fetcher, HandlerResult};
use danny_definition::state::{State};
use danny_definition::fetch;
use warp_wasm_utils::contract_utils::js_imports::log;
use async_trait::async_trait;
use danny_flat_inference::{AnnoySerialize};
use serde_json;
use super::AsyncActionable;

use warp_wasm_utils::contract_utils::js_imports::KV;
use wasm_bindgen::JsValue;


#[async_trait(? Send)]
impl AsyncActionable for Fetcher {
    async fn action(self, _caller: String, mut state: State) -> ActionResult {
        for i in self.files.clone() {
            let model_link = "https://arweave.net/".to_string() + self.manifest_id.as_str() + "/" + i.as_str();
            let res: String = fetch::run(model_link.as_str()).await;
            let annoy_obj: AnnoySerialize = serde_json::from_str(&res.as_str()).unwrap();
            for (k, v) in annoy_obj.nodes_keys.clone().into_iter().zip(annoy_obj.nodes_vals.clone().into_iter())
            {
                KV::put(k.to_string().as_str(), JsValue::from_serde(&v.clone()).unwrap()).await;
            }
            KV::put("n_items", JsValue::from_serde(&annoy_obj.n_items.clone()).unwrap()).await;
            KV::put("max_leaf_size", JsValue::from_serde(&annoy_obj.max_leaf_size.clone()).unwrap()).await;
            KV::put("n_dimensions", JsValue::from_serde(&annoy_obj.n_dimensions.clone()).unwrap()).await;
            KV::put("roots", JsValue::from_serde(&annoy_obj.roots.clone()).unwrap()).await;
            KV::put("node_type", JsValue::from_serde(&annoy_obj.node_type.clone()).unwrap()).await;
            state.datasets.push(model_link.to_string());
        }
        Ok(HandlerResult::Write(state))
    }
}
