use std::fs::File;
use std::io::{BufRead, BufReader};
use std::time::{Instant};
use num::ToPrimitive;
use indexing::AnnoyFlat;
use log::{info, warn};
use simple_logger::SimpleLogger;
use clap::Parser;


#[derive(Parser,Default,Debug)] //#
#[command(author, version, about, long_about = None)]
struct Arguments {
    /// Dimensions of the vectors in dataset
    #[arg(short, long)]
    dimensions: usize,

    /// Number of trees to use training ANNOY model
    #[arg(short, long)]
    num_trees: i64,

    /// Maximum leaf size, default value is 100, smaller size more precise model, larger size
    #[arg(short, long, default_value_t = 100)]
    max_leaf_size: usize,

    /// Default is false, using seeds increases entropy in random forest creation
    #[arg(short, long, default_value_t = false)]
    use_seeds: bool,

    /// Path to model file
    #[arg(short, long)]
    path: String
}


//noinspection ALL
pub fn main(){
    SimpleLogger::new().init().unwrap();
    let args = Arguments::parse();
    let mut ann = AnnoyFlat::new(args.dimensions, args.max_leaf_size,
                                 args.use_seeds, "Angular".to_string());

    let mut metadata:Vec<String> = vec![];
    let mut timestamps:Vec<i32> = vec![];
    let mut vectors:Vec<Vec<f64>> = vec![];

    let file = File::open(args.path).unwrap();
    let reader = BufReader::new(file);

    let mut null_ctr = 0;
    for line in reader.lines() {
        let mut vector:Vec<f64> = vec![];
        let ax = line.unwrap();
        let vec = ax.split("##").collect::<Vec<&str>>();
        if vec.len()<4{
            null_ctr += 1;
            continue;
        }
        let vals = vec[3].clone().split(", ").collect::<Vec<&str>>();

        for val in vals.clone(){
            vector.push(val.parse::<f64>().unwrap());
        }

        if vector.len() != args.dimensions {
            warn!("Oops vector with {} dimensions", vector.len());
            null_ctr +=1;
            continue
        }

        let mut m = "".to_string();
        m.push_str(vec[0].clone()); //.parse().unwrap()
        m.push_str( " ");
        m.push_str( vec[1].clone());

        vectors.push(vector);
        metadata.push(m);
        timestamps.push(vec[2].clone().parse().unwrap());

    }
    info!("Corrupted {} items were removed", null_ctr);
    let mut count = 0;
    for (i, value) in vectors.into_iter().enumerate() {
        ann.add_item_threaded(i.to_i64().unwrap(), value.as_slice(),
                              metadata[i].clone(),
                              timestamps[i].clone());
        count = i;
    }
    info!("Added {} items", count);

    let now = Instant::now();
    info!("Building index ...");
    ann.build_threaded(args.num_trees);
    let duration = now.elapsed();
    info!("Training took {} seconds to execute.",  duration.as_secs());
    ann.save_shards("shards/danny".to_string());

}