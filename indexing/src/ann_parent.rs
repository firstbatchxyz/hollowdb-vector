use std::fmt::Debug;
use std::fs::File;
use std::io::{BufReader, BufWriter, Write};
use std::sync::{Arc, Mutex, RwLock};
use dashmap::DashMap;
use dashmap::mapref::one::Ref;

use rand::rngs::StdRng;
use rand::{Rng, SeedableRng};
use serde::{Deserialize, Serialize};

use crate::AngularFlat;
use crate::random_flip;

#[derive(Serialize, Deserialize, Debug)]
pub struct AnnoySerialize
{

    pub nodes_keys: Vec<i64>,
    pub nodes_vals: Vec<AngularFlat>,
    pub max_leaf_size: usize,
    pub n_dimensions: usize,
    pub roots: Vec<i64>,
    pub n_items: i64,
    pub node_type: String
}

impl AnnoySerialize {
    fn new(v_k: Vec<i64>, v_v: Vec<AngularFlat>,_ml:usize,n_d:usize, _roots: Vec<i64>, _n_items: i64, _n_type: String) -> AnnoySerialize{
        AnnoySerialize{
            nodes_keys: v_k,
            nodes_vals: v_v,
            max_leaf_size:_ml,
            n_dimensions: n_d,
            roots: _roots,
            n_items: _n_items,
            node_type: _n_type
        }
    }

    fn copy(&self) -> AnnoySerialize{
        AnnoySerialize{
            nodes_keys: self.nodes_keys.clone(),
            nodes_vals: self.nodes_vals.clone(),
            max_leaf_size:self.max_leaf_size.clone(),
            n_dimensions: self.n_dimensions.clone(),
            roots: self.roots.clone(),
            n_items: self.n_items.clone(),
            node_type: self.node_type.clone()
        }
    }
}




