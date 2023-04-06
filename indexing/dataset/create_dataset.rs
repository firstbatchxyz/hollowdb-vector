use std::fs::File;
use std::io::Write;



pub fn main() {
    let lang = "en";
    let dimension = 1024;
    let data = {
        let file_content = fs::read_to_string("./dataset/dataset.json").expect("error reading file");
        serde_json::from_str::<Value>(&file_content).expect("error serializing to JSON")
    };
    let mut f = File::create(format!("datasets/{}_{}_dataset", lang, dimension)).unwrap();
    let mut ii = 0;
    for item in data {
        if let Some(embedding) = item.get("embedding").and_then(|x| x.as_array()) {
            let v = embedding.iter().map(|x| x.to_string()).collect::<Vec<String>>().join(",");
            f.write_fmt(format_args!("{}##{}##{}##{}\n", item["id"], item["source"], item["timestamp"], v)).unwrap();
        }
        ii += 1;
    }
}