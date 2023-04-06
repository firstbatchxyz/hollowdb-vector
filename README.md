![DANNY Logo](https://imagedelivery.net/kbUqkpOIvA4TJOyi-hNQfQ/cbfba403-0864-4ace-dbfb-8b5052570700/public)

## DANNY: Decentralized Approximate Nearest Neighbors Yummy!

**DANNY** is a decentralized vector database for building vector search applications, powered by [Warp Contracts](https://warp.cc/), built by [FirstBatch](https://twitter.com/FirstBatchxyz_).

For a comprehensive overview, please visit the link [here](https://mirror.xyz/0x4a34646adaf10EEfBf2C210B72918e763d306fdb/5tJxWTJ4j3OqB6w0um4lcUt9q1UsEKi04WWPRbdUz08)




1. 🏗️ [Foundations](#foundations)
2. 🛠️ [Using DANNY](#using-danny)
3. 🔮 [Future Work & Contributions](#future-work)

---

## 🏗️ Foundations

Representing images, videos, books, comments, and articles as vectors while encoding their context enables operations such as cosine similarity or Euclidian distance between them. Finding the most similar/close vector based on the chosen metric (cosine similarity, euclidian, etc.) is at the heart of building AI applications.

DANNY acts as a vector database, offering powerful tools for developing various applications, including recommendation systems and semantic search functionalities. By utilizing Warp Contracts, apps can deliver semantic search and/or personalized suggestions for products, content, or venues tailored to individual preferences to enhance the user experience.

On the other hand, DANNY has the potential to remove duplicates from large sets of data and detect anomalies, creating new possibilities for DAO's action space and fighting fraud on de-fi, Sybil identities, and more. This means you can build transparent and decentralized algorithms such as:

- 📚 Semantic search
- 🎯 Recommendation
- 🚫 Deduplication
- 🕵️‍♀️ Fraud detection -- and many more!

### 🎛️ **Current State**

Developers can use DANNY to create vector databases (train) from their custom datasets and run queries for vector search through Warp contracts. 

Currently DANNY implements ANNOY Search algorithm for vector search. DANNY doesn't fully support CRUD operations as a database yet. Developers should re-train entire corpus to add new vectors to DANNY. 

The library contains source code for contracts, workers, and utilities that allow training, deployment, and inference of DANNY models. 

## 🛠️ Using DANNY

1. **Dataset creation** and **indexing** with DANNY are explained [here](indexing/README.md) in detail.

2. **Sharding**, **deploying** contracts and **querying** DANNY are explained [here](inference/README.md) in detail.

## 🔮 Future Work

DANNY is open to public contributions. We, as FirstBatch, will be developing DANNY to be a full-feature Vector database with multiple indexing algorithms.

- 🆕 New Indexing methods
    - 🌐  Adding support for Hierarchical Navigable Small Worlds (HNSW)
    - 🔍 Adding support for Locality Sensitive Hashing (LSH)
- 🏄🏼‍ Parametric distance metrics, L2, L1, cosine similarity, angular
- 🌐  Distributed training: Creating DANNY models should also be possible in a distributed manner for larger datasets. Moving transparency a step further.
- 🚀 DANNY Node Release: DANNY Node will provide gRPC-wrapped decentralized scalability tools, making DANNY a scalable service with competitive features.
- 🔄 CRUD operations: Models should enable appending or removing vectors instead of re-training.

## 🤝 Contributing

We welcome contributions from the community. If you are interested in contributing to DANNY, please follow these steps:

Fork the repository on GitHub.
Create a new branch for your feature or bugfix.
Implement your changes and write tests if applicable.
Submit a pull request with a clear description of your changes and reference any related issues.
For questions or discussions, please join our community on Discord or Telegram.

## 📜 License

DANNY is licensed under the MIT License.

## 🙏 Acknowledgements

We want to thank the following projects and their contributors for providing the foundation for DANNY:

- [ANNOY](https://github.com/spotify/annoy)
- [Warp](https://warp.cc/)


## 🌐 Join our Dev Server
We'd love for you to be a part of our dev community! If you have any questions, want to discuss DANNY, or simply want to connect with like-minded individuals, feel free to join our Discord server.

[![Join our Discord server!](https://invidget.switchblade.xyz/2wuU9ym6fq)](http://discord.gg/2wuU9ym6fq)

Click the badge above to receive an invitation to our Discord server. Let's build the future of decentralized AI applications together! 🚀