
# PeerDAS

**PeerDAS** is a transitional scheme that bridges the limitations of EIP-4844 (Proto-Danksharding). It avoids requiring nodes to download and store full blobs, while also not introducing new network protocols to fully implement Danksharding. Its key improvements include:

* Erasure coding to extend blobs
* Formation of column-based subnets
* Sampling support

### **Core Principles**

Each node is required to store a minimal amount of data—e.g., two columns. The specific columns a node must store are deterministically derived from its node ID, meaning anyone can know exactly which data a node should be holding.

Blobs are extended using erasure coding so that a full row can be reconstructed from only part of the row. Each column of data is propagated through a corresponding subnet. Nodes interested in specific columns can subscribe to the relevant subnets.

Since we know deterministically which data a given node is supposed to store, we can locally maintain a diverse enough set of peers to indirectly cover all subnets. When sampling is needed, the node uses the data coordinate to reverse-look up neighbors and initiates sampling via a Req/Resp protocol. You can think of this design as a combination of *vertical* (direct subnet joining) and *horizontal* (indirect subnet coverage) scaling, bringing several benefits:

* **Recovery and cross-seeding**: If a node misses some row/column data, it can reconstruct it from enough related samples and redistribute the result into the subnet. However, full reconstruction is limited until true 2D extension is implemented, since columns cannot yet be recovered.
* **Accelerated propagation**: Once a node successfully samples a piece of data, it can forward it to others who don’t have it, accelerating propagation precisely.

Because nodes are expected to hold specific data, we can score them accordingly. If a node fails to publish its expected data in time, its score drops—though we first check whether the data was even present in the network. Based on scores, we maintain a set of high-availability neighbors.

### **Implementation**

PeerDAS is currently in the **Fulu stage**, which can be understood as the initial implementation of the DAS network. Its core goal is to support minimal sampling semantics, availability verification, and basic data propagation.

![image.png](/en/peerdas.png)

In this stage, 1D erasure coding is applied, and columns are mapped to subnets. Nodes are deterministically assigned a set of “custody columns” based on their node ID. This assignment is public, verifiable, and deterministic.

In addition to their assigned custody group, nodes can optionally choose to host more columns—or even all of them—becoming a **super-full node**. Regardless of how many columns a node hosts, it must subscribe to the corresponding subnets and publish/listen for column data (`DataColumnSidecar`) on them.

If a node fails to obtain its custody columns in time, it can use the request-response protocol to fetch the missing columns from others. Furthermore, if a node has collected more than half of the total columns, it can attempt to reconstruct the entire data matrix and rebroadcast the new columns—this is called **cross-seeding**. As long as any node can reconstruct the data, it enhances the integrity of the network, building a self-healing propagation mechanism like Wolverine.

Thanks to the deterministic custody assignments, node behavior can be evaluated to see whether they fulfill their responsibilities. Nodes use these evaluations to maintain a high-quality neighbor set, prioritized for sampling or reconstruction.

Since nodes don’t store full blob data from blocks, **sampling** remains essential to ensuring data availability at this stage. Sampling is achieved by retrieving 8 data columns, either through the subnets or from peers:

* **Subnet sampling**: Nodes subscribe to subnets and consider a column "available" if enough data is received from it. However, they aren’t responsible for storing or propagating the sampled data.
* **Peer sampling**: Nodes randomly choose 8 columns and fetch them from other peers via Req/Resp, avoiding the cost of joining subnets.

If a node is already storing 8 or more columns as part of its custody duty, it has effectively completed the sampling process without extra effort.

In short, PeerDAS at this stage delivers up to **8× the blob throughput** of Proto-Danksharding, with minimal protocol changes. Future evolution includes moving to **2D erasure codes**, **cell-level sampling**, and more, unlocking even greater performance. A comparison is shown below:

| Feature                 | EIP-4844 (Proto-Danksharding)       | PeerDAS (Fulu stage)                                     |
| ----------------------- | ----------------------------------- | -------------------------------------------------------- |
| **Node responsibility** | All nodes download full blob data   | Each node downloads a few columns based on NodeID        |
| **Max blobs per block** | Up to 6 blobs                       | Up to 48 blobs                                           |
| **Erasure coding**      | No redundancy                       | 1D erasure coding (each blob doubled)                    |
| **Sampling mechanism**  | None                                | Custody sampling (via subnet) + Peer sampling (via RPC)  |
| **Recovery ability**    | None (missing blob = unrecoverable) | Recoverable if >50% of columns available                 |
| **Protocol complexity** | Low (adds only blob sidecars)       | Medium (adds subnet gossip, Req/Resp, cell-level proofs) |
| **Attack tolerance**    | Low (any missing blob breaks block) | Medium (can tolerate up to 50% data loss)                |

---

## References

* [PeerDAS Resources](https://hackmd.io/@fradamt/peer-das-resources)
* [PeerDAS Book](https://hackmd.io/@manunalepa/peerDAS/)
