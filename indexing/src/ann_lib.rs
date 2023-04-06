use std::cmp::max;
use std::collections::HashMap;
use std::fmt::Debug;
use std::fs::File;

use std::io::{BufReader, BufWriter, Write};
use std::sync::{Arc, Mutex, RwLock};
use std::time::Instant;
use dashmap::DashMap;
use dashmap::mapref::one::Ref;

use std::mem;

use rand::rngs::StdRng;
use rand::{Rng, SeedableRng};
use serde::{Deserialize, Serialize};

use log::{info, trace, warn};

use crate::random_flip;
use crate::{AnnoySerialize};


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AngularFlat{
    pub children: Vec<i64>,
    pub v: Vec<f64>,
    pub n_descendants: usize,
    is_leaf: bool,
    metadata: Option<String>,
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

    fn is_leaf(&self) -> bool{self.is_leaf}

    fn get_metadata(&self) -> Option<String>{
        self.metadata.clone()
    }

    fn set_metadata(&mut self, m:String) {
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
    let norm = get_norm(&nv) + f64::EPSILON;

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
) -> (Vec<f64>, Vec<f64>) {
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
                iv[z] = v/ (ic + 1.0);
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

#[allow(non_snake_case)]
pub struct AnnoyFlat
{
    pub _n_dimensions: usize,
    pub _max_leaf_size: usize,
    pub _n_nodes_thread: Arc<Mutex<i64>>,
    pub _n_items: i64,

    pub _node_type: String,
    pub _nodes_thread: Arc<DashMap<i64, AngularFlat>>,
    pub _roots: Vec<i64>,

    pub _seed_thread: [Option<u64>; 32],

}

impl AnnoyFlat {
    pub fn new(n_dimensions: usize, max_leaf_size: usize, use_seeds: bool, node_type: String) -> AnnoyFlat {
        let mut rng = StdRng::from_entropy();
        let mut seeds = [None; 32];
        if use_seeds {
            (0..32).for_each(|i| {
                seeds[i] = Some((rng.gen::<usize>() % 999999) as u64);
            });
        }

        AnnoyFlat {
            _roots: Vec::new(),
            _nodes_thread: Arc::new(DashMap::new()),
            _n_items: 0,
            _node_type: node_type,
            _n_nodes_thread: Arc::new(Mutex::new(0 as i64)),
            _n_dimensions: n_dimensions,
            _max_leaf_size: max_leaf_size,
            _seed_thread: seeds,
        }
    }

    pub fn add_item_threaded(&mut self, item: i64, w: &[f64], metadata: String, logic: i32) {
        let f = self._n_dimensions;
        let mut n = self._nodes_thread.entry(item).or_insert_with(|| AngularFlat::new(f));
        n.reset(w, metadata, logic);

        if item >= self._n_items {
            self._n_items = item + 1;
        }
    }

    pub fn build_threaded(&mut self, q: i64)
    {
        *self._n_nodes_thread.lock().unwrap() = self._n_items; //self._n_nodes =

        loop {
            if q == -1 && *self._n_nodes_thread.lock().unwrap() >= self._n_items * 2 {
                break;
            }
            if q != -1 && self._roots.len() >= (q as usize) {
                break;
            }

            let mut indices: Vec<i64> = Vec::new();

            for i in 0..self._n_items {
                if let Some(n) = self._nodes_thread.get(&i) {
                    if n.descendant() >= 1 {
                        indices.push(i)
                    }
                }
            }

            let ax = Arc::new(RwLock::new(indices));
            let nodes_t = self._nodes_thread.clone();
            let n_nodes_t = Arc::clone(&self._n_nodes_thread);
            let seed_ref = self._seed_thread.clone();
            let ind: i64;

            let now = Instant::now();

            ind = AnnoyFlat::_make_tree_threaded(ax, self._max_leaf_size.clone(), self._n_dimensions.clone(), &seed_ref[self._roots.len()],
                                             nodes_t, n_nodes_t);


            let duration = now.elapsed();
            let prg = self._roots.len() as f32 * 30.0 / q as f32;
            let remain = (q as f32 - self._roots.len() as f32)  * 30.0 / q as f32;
            let prg_ = vec!["*"; prg as usize];
            let remaining = vec!["-"; remain as usize];
            let mut temp = prg_.join("");
            temp.push_str(remaining.join("").as_str());
            info!("Progress: {:?}", temp);
            self._roots.push(ind);
        }
    }


    fn _make_tree_threaded(indices: Arc<RwLock<Vec<i64>>>, _K: usize, _f: usize, _seed: &Option<u64>,
                           _nodes: Arc<DashMap<i64, AngularFlat>>,
                           _n_nodes: Arc<Mutex<i64>>) -> i64
    {
        if indices.read().unwrap().len() == 1 {
            return indices.read().unwrap()[0];
        }


        if indices.read().unwrap().len() <= (_K as usize) {
            let mut item = _n_nodes.lock().unwrap();

            let mut m = _nodes.entry(*item).or_insert(AngularFlat::new(_f));
            m.set_descendant(indices.read().unwrap().len());
            m.set_children(indices.read().unwrap().to_vec());

            *item += 1; // ++ item
            return *item - 1;
        }

        let children: Vec<AngularFlat> = indices.read().unwrap()
            .iter()
            .map(|index| _nodes.get(index))
            .flatten()
            .map(|n| n.clone())
            .collect::<Vec<_>>();


        let children_indices = &mut [Arc::new(RwLock::new(Vec::new())),
            Arc::new(RwLock::new(Vec::new()))];

        let mut m = AngularFlat::new(_f);

        //let ind_s = if let Some(ind) = rayon::current_thread_index()
        //{ ind } else { 0 };

        let mut rng = if let Some(seed) = _seed {
            SeedableRng::seed_from_u64(*seed)
        } else {
            StdRng::from_entropy()
        };

        AngularFlat::create_split(&children, &mut m, _f, &mut rng);
        drop(children);

        for i in indices.read().unwrap().iter() {
            if let Some(n) = _nodes.get(i) {
                let side = AngularFlat::side(&m, n.vector(), &mut rng);
                children_indices[side as usize].write().unwrap().push(*i);
            }
        }


        while children_indices[0].read().unwrap().is_empty() || children_indices[1].read().unwrap().is_empty() {
            children_indices[0].write().unwrap().clear();
            children_indices[1].write().unwrap().clear();
            indices.read().unwrap()
                .iter()
                .for_each(|j| children_indices[random_flip(&mut rng) as usize].write().unwrap().push(*j));
        }


        let flip = if children_indices[0].read().unwrap().len()
            > children_indices[1].read().unwrap().len() {
            1
        } else {
            0
        };

        m.set_descendant(indices.read().unwrap().len());

        let side1 = 0;
        let side2 = 1;
        let s1 = side1 ^ flip;
        let s2 = side2 ^ flip;
        let a = children_indices[s1].clone();
        let b = children_indices[s2].clone();

        let mut v = m.children();

        let mut ind1: i64 = 0;
        let mut ind2: i64 = 0;
        let nodes_t = _nodes.clone();
        let n_nodes_t = Arc::clone(&_n_nodes);

        let nodes_t2 = _nodes.clone();
        let n_nodes_t2 = Arc::clone(&_n_nodes);


        rayon::join_context(|_| {
            ind1 = AnnoyFlat::_make_tree_threaded(a, /*scope,*/ _K.clone(), _f.clone(), &_seed, nodes_t, n_nodes_t)
        }, |_|
                                ind2 = AnnoyFlat::_make_tree_threaded(b, /*scope,*/ _K.clone(), _f.clone(), &_seed, nodes_t2, n_nodes_t2)
        );


        v[s1] = ind1;
        v[s2] = ind2;
        m.set_children(v);

        let mut item = _n_nodes.lock().unwrap();
        let mut node = _nodes.entry(*item).or_insert_with(|| AngularFlat::new(_f));

        node.copy(m);
        *item += 1;

        *item - 1
    }

    fn traverse_tree(&self ,ind: i64) -> Vec<i64>{

        let mut left_subtree = Vec::new();
        let mut right_subtree = Vec::new();
        let mut left_i = 0;
        let mut right_i = 0;

        if let Some(ncom) = self._nodes_thread.get(&ind) {
            let n = ncom.value();
            if n.n_descendants == n.children.len() && n.is_leaf == false
            {
                vec![ind.clone()]
            }

            else {

                let mut s = vec![ind.clone()];
                left_i = n.children[0];
                right_i = n.children[1];
                for side in 0..2{
                    if side==0{
                        left_subtree = self.traverse_tree(left_i);
                    }
                    else{
                        right_subtree = self.traverse_tree(right_i);
                    }
                }

                left_subtree.append(&mut right_subtree);
                left_subtree.append(&mut s);
                left_subtree
            }

        }
        else {
            Vec::new()
        }


    }

    pub fn save_shards(&self, w: String)
    {

        let max_size = 50; //in compressed! Megabytes, per shard, approx x2.5 as JSON, 50mb is 135mb

        let mut nk = Vec::new();
        let mut nv = Vec::new();
        for i in self._nodes_thread.iter(){
                nk.push(*i.key());
                nv.push(i.value().clone());
        }

        let node_size_inbytes = self.calculate_size(nv.get(0).unwrap().clone());
        let node_size_in_megabytes = node_size_inbytes as f64 / (1024.0 * 1024.0);

        let key_size_in_bytes = mem::size_of::<i64>();
        let key_size_in_megabytes = key_size_in_bytes as f64 / (1024.0 * 1024.0);

        let total_size_in_mb = (key_size_in_megabytes + node_size_in_megabytes) * nv.len() as f64;
        if total_size_in_mb as i64 > max_size
        {
            let chunk_size = nv.len() / (total_size_in_mb / max_size as f64) as usize;

            let chunks_nk: Vec<&[i64]> = nk.chunks(chunk_size).collect();
            let chunks_nv: Vec<&[AngularFlat]> = nv.chunks(chunk_size).collect();
            let w_nodes = "_nodes".to_string();

            for i in 0..chunks_nk.len(){

                let mut fname_nodes = w_nodes.clone();
                fname_nodes.push_str((i).to_string().as_str());


                let mut f_name = w.clone();
                f_name.push_str("_shard");
                f_name.push_str((i).to_string().as_str());
                f_name.push_str(".json");

                let a_s = AnnoySerialize{ nodes_keys: chunks_nk[i].to_vec(), nodes_vals: chunks_nv[i].to_vec(),
                    max_leaf_size: self._max_leaf_size, n_dimensions: self._n_dimensions,
                    node_type: self._node_type.clone(), n_items:self._n_items, roots:self._roots.clone()};
                self.save_shard_json(f_name, a_s);

            }


        }
        else {
            let mut f_name = w.clone();
            f_name.push_str("_shard0");
            f_name.push_str(".json");
            let a_s = AnnoySerialize{ nodes_keys: nk, nodes_vals: nv,
                max_leaf_size: self._max_leaf_size, n_dimensions: self._n_dimensions,
                node_type: self._node_type.clone(),n_items:self._n_items, roots:self._roots.clone()};
            self.save_shard_json(f_name, a_s);
        }

    }

    pub fn save_shard_json(&self, w:String, a:AnnoySerialize){

        let j = serde_json::to_string(&a);
        let out = File::create(w).expect("Unable to create file");
        let mut f = BufWriter::new(out);
        f.write(j.unwrap().as_bytes()).expect("Write failed");
        f.flush().unwrap();

    }

    pub fn calculate_size(&self, node:AngularFlat)->usize{

        let size_of_struct = mem::size_of::<AngularFlat>();
        let size_of_children = node.children.capacity() * mem::size_of::<i64>();
        let size_of_vector = node.v.capacity() * mem::size_of::<f64>();
        let size_of_metadata = node.metadata.as_ref().map_or(0, |v| v.capacity() * mem::size_of::<u8>());
        let total_size_in_bytes = size_of_struct + size_of_vector +size_of_metadata + size_of_children;
        total_size_in_bytes
    }

}