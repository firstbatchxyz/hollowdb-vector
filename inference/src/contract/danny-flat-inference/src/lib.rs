extern crate core;

use rand::rngs::StdRng;
use rand::Rng;
use std::cmp::Ordering;

pub mod ann_lib;

pub use ann_lib::{AnnoySerialize,AnnoyFlat, AngularFlat};


#[derive(PartialEq)]
struct Numeric(f64);

impl Eq for Numeric {}

impl PartialOrd for Numeric {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        self.0.partial_cmp(&other.0)
    }
}

impl Ord for Numeric {
    fn cmp(&self, other: &Self) -> Ordering {
        self.0.partial_cmp(&other.0).unwrap_or(Ordering::Equal)
    }
}

fn random_flip(rng: &mut StdRng) -> bool {
    rng.gen::<bool>()
}
