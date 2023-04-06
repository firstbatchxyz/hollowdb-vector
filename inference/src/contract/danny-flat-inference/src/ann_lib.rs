use std::cmp::Reverse;
use std::collections::{BinaryHeap, HashMap};
use std::fmt::Debug;
use std::fs::File;
use std::io::{BufReader, BufWriter, Read};
use std::time::Instant;

use rand::rngs::StdRng;
use rand::{Rng, SeedableRng};
use serde::{Deserialize, Serialize};

use crate::{Numeric, random_flip};

#[derive(PartialEq, PartialOrd)]
struct AnnResult(f64, i64);

impl Eq for AnnResult {}

#[allow(clippy::derive_ord_xor_partial_ord)]
impl Ord for AnnResult {
    fn cmp(&self, other: &AnnResult) -> std::cmp::Ordering {
        self.0.partial_cmp(&other.0).unwrap()
    }
}

use warp_wasm_utils::contract_utils::js_imports::KV;
use warp_wasm_utils::contract_utils::js_imports::log;

#[derive(Serialize)]
struct Input {
    function: String,
    nodeId: i64,
}

#[derive(Deserialize)]
pub struct GetNodeResult {
    pub node: AngularFlat,
}


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AngularFlat {
    pub children: Vec<i64>,
    pub v: Vec<f64>,
    pub n_descendants: usize,
    is_leaf: bool,
    pub metadata: Option<String>,
    pub logic: i32,
    f: usize,
}

impl AngularFlat {
    fn new(f: usize) -> Self {
        AngularFlat {
            children: vec![0, 0],
            v: vec![0.0; f],
            n_descendants: 0,
            is_leaf: false,
            metadata: None,
            logic: 0,
            f,
        }
    }

    fn reset(&mut self, v: &[f64], m: String, l: i32) {
        self.children[0] = 0;
        self.children[1] = 0;
        self.n_descendants = 1;
        self.is_leaf = true;
        self.metadata = Some(m);
        self.logic = l;
        self.v = v.to_vec();
    }

    fn copy(&mut self, other: Self) {
        self.n_descendants = other.n_descendants;
        self.children = other.children;
        self.is_leaf = other.is_leaf;
        self.v = other.v;
        self.metadata = other.metadata;
        self.logic = other.logic
    }

    fn descendant(&self) -> usize {
        self.n_descendants
    }

    fn set_descendant(&mut self, other: usize) {
        self.n_descendants = other;
    }

    fn vector(&self) -> &[f64] {
        self.v.as_slice()
    }
    fn mut_vector(&mut self) -> &mut Vec<f64> {
        &mut self.v
    }

    fn children(&self) -> Vec<i64> {
        self.children.clone()
    }

    fn set_children(&mut self, other: Vec<i64>) {
        self.children = other;
    }

    fn is_leaf(&self) -> bool { self.is_leaf }

    pub(crate) fn get_metadata(&self) -> Option<String> {
        self.metadata.clone()
    }

    fn set_metadata(&mut self, m: String) {
        self.metadata = Some(m);
    }

    fn set_logic(&mut self, logic: i32) {
        self.logic = logic;
    }

    fn distance(x: &[f64], y: &[f64], f: usize) -> f64 {
        let mut pp = 0.0;
        let mut qq = 0.0;
        let mut pq = 0.0;

        for z in 0..f {
            pp += x[z] * x[z];
            qq += y[z] * y[z];
            pq += x[z] * y[z];
        }

        let ppqq = pp * qq;

        let make_distance = || {
            let two = 2.0;

            if ppqq > 0.0 {
                two - two * pq / ppqq.sqrt()
            } else {
                2.0
            }
        };

        make_distance()
    }

    fn create_split(nodes: &[AngularFlat], n: &mut AngularFlat, f: usize, rng: &mut StdRng) {
        let (best_iv, best_jv) = two_means(rng, nodes, f);

        for z in 0..f {
            let best = best_iv[z] - best_jv[z];
            n.v[z] = best;
        }

        n.v = normalize(&n.v);
        //n.v
    }

    fn side(n: &AngularFlat, y: &[f64], rng: &mut StdRng) -> bool {
        let dot = Self::margin(n, y);

        if dot != 0.0 {
            return dot > 0.0;
        }

        random_flip(rng)
        //rng.clone().gen::<bool>()
    }

    fn margin(n: &AngularFlat, y: &[f64]) -> f64 {
        let mut dot = 0.0;

        for (z, item) in y.iter().enumerate().take(n.f) {
            dot += n.v[z] * *item;
        }

        dot
    }

    fn normalized_distance(distance: f64) -> f64 {
        distance.max(0.0).sqrt()
    }
}

fn get_norm(v: &[f64]) -> f64 {
    v.iter().fold(0.0, |acc, x| acc + x.powf(2.0)).sqrt()
}

fn normalize(v: &[f64]) -> Vec<f64> {
    let nv = to_f64_slice(v);
    let norm = get_norm(&nv);

    let mut v2 = v.iter().map(|_| 0.0).collect::<Vec<_>>();
    for z in 0..v.len() {
        v2[z] = nv[z] / norm;
    }

    v2
}

const ITERATION_STEPS: usize = 200;

pub fn to_f64_slice(v: &[f64]) -> Vec<f64> {
    let mut c: Vec<f64> = v.iter().map(|_| 0.0).collect();

    for (z, it) in v.iter().enumerate() {
        c[z] = *it;
    }

    c
}

fn two_means(
    rng: &mut StdRng,
    nodes: &[AngularFlat],
    f: usize,
) -> (Vec<f64>, Vec<f64>)
{
    let count = nodes.len();
    let i: u64 = rng.gen::<u64>() % count as u64;
    let mut j: u64 = rng.gen::<u64>() % (count - 1) as u64;
    j += (j >= i) as u64;

    let mut iv = nodes[i as usize].vector().to_vec();
    let mut jv = nodes[j as usize].vector().to_vec();

    let mut ic = 1.0;
    let mut jc = 1.0;

    for _ in 0..ITERATION_STEPS {
        let k = rng.gen::<usize>() % count as usize;
        let di = ic * AngularFlat::distance(&iv, nodes[k].vector(), f);
        let dj = jc * AngularFlat::distance(&jv, nodes[k].vector(), f);
        let nk = &nodes[k].vector();

        //let nv = to_f64_slice(nk);
        //let norm = get_norm(&nv);

        if di < dj {
            for z in 0..f {
                let v = iv[z] * ic + nk[z];
                iv[z] = v / (ic + 1.0);
            }

            ic += 1.0;
        } else if dj < di {
            for z in 0..f {
                let v = jv[z] * jc + nk[z];
                jv[z] = v / (jc + 1.0);
            }
            jc += 1.0;
        }
    }

    (iv, jv)
}

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


#[allow(non_snake_case)]
pub struct AnnoyFlat
{
    pub nodes_keys: Vec<i64>,
    pub nodes_vals: Vec<AngularFlat>,
    pub max_leaf_size: usize,
    pub n_dimensions: usize,
    pub roots: Vec<i64>,
    pub n_items: i64,
    pub node_type: String

}

impl AnnoyFlat
{
    pub fn new(n_dimensions: usize, max_leaf_size: usize, node_type: String) -> AnnoyFlat {
        AnnoyFlat {
            roots: Vec::new(),
            nodes_keys: Vec::new(),
            nodes_vals: Vec::new(),
            node_type,
            n_dimensions,
            max_leaf_size,
            n_items: 0
        }
    }

    pub async fn get_node(&self, node_id: &str) -> AngularFlat {
        let result: AngularFlat = KV::get(node_id).await.unwrap().into_serde().unwrap();
        return result;
    }


    pub async fn get_nns_by_vector(&self, v: Vec<f64>, n: usize, search_k: i64) -> (Vec<i64>, Vec<f64>, HashMap<i64, String>)
    {
        self._get_all_nns(v.clone(), n, search_k).await
    }

    async fn _get_all_nns(&self, v: Vec<f64>, n: usize, mut search_k: i64) -> (Vec<i64>, Vec<f64>, HashMap<i64, String>)
    {
        let mut q: BinaryHeap<(Numeric, i64)> = BinaryHeap::new();
        let v = v.as_slice();
        let f = self.n_dimensions;
        if search_k == -1 {
            search_k = (n as i64) * self.roots.len() as i64;
        }

        for root in self.roots.iter() {
            q.push((Numeric(0.0), *root))
        }

        let mut nns: Vec<i64> = Vec::new();
        let mut node_metadata: HashMap<i64, String> = HashMap::new();

        while nns.len() < (search_k as usize) && !q.is_empty() {
            let top = q.peek().unwrap();
            let d: f64 = top.0.0;
            let i = top.1;

            let nd: AngularFlat = self.get_node(&i.to_string().as_str()).await;
            q.pop();

            if nd.descendant() == 1 && nd.is_leaf() {
                nns.push(i);
            } else if nd.descendant() as usize <= self.max_leaf_size {
                let dst = nd.children();
                nns.extend(dst.clone());
            } else {
                let margin = AngularFlat::margin(&nd, v);
                let a = 0.0 + margin;
                let b = 0.0 - margin;

                let a = Numeric(a);
                let b = Numeric(b);

                q.push((Numeric(d).min(a), nd.children()[1]));
                q.push((Numeric(d).min(b), nd.children()[0]));
            }
        }

        nns.sort_unstable();

        let mut nns_dist: BinaryHeap<Reverse<AnnResult>> = BinaryHeap::new();
        let mut last = -1;
        for j in &nns {
            if *j == last {
                continue;
            }

            last = *j;
            let _n: AngularFlat = self.get_node(&*j.to_string().as_str()).await;
            let dist = AngularFlat::distance(v, _n.vector(), self.n_dimensions);
            nns_dist.push(Reverse(AnnResult(dist, *j)));
            node_metadata.insert(*j, _n.metadata.unwrap());
        }

        let m = nns_dist.len();
        let p = if n < m { n } else { m } as usize;

        let mut distances = Vec::new();
        let mut result = Vec::new();

        for Reverse(AnnResult(dist, idx)) in nns_dist.iter().take(p) {
            distances.push(AngularFlat::normalized_distance(*dist));
            result.push(*idx)
        }
        (result, distances, node_metadata)
    }
}
