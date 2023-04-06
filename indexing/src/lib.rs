#![allow(dead_code)]
#![allow(unused_imports)]
#![allow(unused_variables)]
#![allow(unused_assignments)]
#![allow(non_snake_case)]
extern crate core;

use rand::rngs::StdRng;
use rand::Rng;
use std::cmp::Ordering;

pub mod ann_lib;
pub use ann_lib::{AnnoyFlat, AngularFlat};

pub mod ann_parent;
pub use ann_parent::{AnnoySerialize};

fn random_flip(rng: &mut StdRng) -> bool {
    rng.gen::<bool>()
}
