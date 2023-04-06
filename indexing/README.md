# Indexing

### Creating Your Dataset
To start building DANNY models, you can use static csv files with "##" as the delimiter. These files contains 4 fields: `(id, metadata, timestamp, vector)` . Here is a sample row with a post id, a string metadata, an integer as UTS and a 20 dimensional vector.

```
0x013ed6-0x0f##Lens Post##1674667708##-0.00044755704584531486, -0.04151960834860802, 0.0048913205973804, 0.0022000970784574747, -0.0016962322406470776, 0.011683552525937557, -0.024173924699425697, 0.03176078572869301, -0.005960546433925629, 0.048019785434007645, 0.04324935004115105, -0.001319467555731535, 0.018381614238023758, -0.024039890617132187, 0.014896255917847157, 0.02003282494843006, -0.023054126650094986, 0.00384587817825377, 0.015684718266129494, 0.02077740617096424
```
#### **From JSON**

It is possible to generate dataset from JSON files using [create_dataset.rs](dataset/create_dataset.rs). JSON files should have the format below:

```json
[
  {"id": "0", "metadata": "https://dev.mirror.xyz/-fXvBzPDKB8GuwH85q-iFI01Q8w--1GCdmyp4QOm8jo", "timestamp": 1638748800, "embedding": "-0.00044755704584531486, -0.04151960834860802, 0.0048913205973804, 0.0022000970784574747, -0.0016962322406470776"},
  {"id": "1", "metadata": "https://dev.mirror.xyz/5gt60vKFJZ_tR1BjoJ7-Y0sNw7REebStHjzFU5x73J0", "timestamp": 1653974400, "embedding": "-0.00044755704584531486, -0.04151960834860802, 0.0048913205973804, 0.0022000970784574747, -0.0016962322406470776"}
]
```

### Creating Index 

Index creation is for creating DANNY models from datasets.

DANNY is built with Warp Contracts powerful WASM feature to ease the process of writing smart contracts that can handle intense computational tasks with complex data structures. Therefore both training and contracts core is written in Rust. Creating index is straightforward.

Create a "shards" folder
```
mkdir shards
```

Then run

```
cargo run --package indexing --bin train -- --dimensions 1024 --num-trees 5 --path lens_dataset 
```

Here is the list of all fields in CLI. 
```bash
Options:
  -d, --dimensions <DIMENSIONS>        Dimensions of the vectors in dataset
  -n, --num-trees <NUM_TREES>          Number of trees to use training ANNOY model, increases search efficieny, model size and indexing cost
  -m, --max-leaf-size <MAX_LEAF_SIZE>  Maximum leaf size, default value is 100, smaller size more precise model, larger size [default: 100]
  -u, --use-seeds                      Default is false, using seeds increases entropy in random forest creation
  -p, --path <PATH>                    Path to Data file
  -h, --help                           Print help
  -V, --version                        Print version
```


## 🙏 Acknowledgements

We want to thank [Little Annoy](https://github.com/uzushino/little-annoy) repo for giving us a head start implementing ANNOY for WASM based Warp contracts. We made indexing multi-thread and added extra functionalities and merged it with an inference-only layer to Warp Wasm contract that works with Cached models.
