
# Decentralized Seeding and Scheduling Optimization in Data Availability Layers

The primary task of the Data Availability (DA) layer is to efficiently distribute data across the network, ensuring it exists in a highly redundant (oversaturated) manner. This ensures correctness and consistency in sampling results. Early designs assigned this responsibility to the block builder, requiring substantial resources. This not only increased centralization but also introduced bottlenecks. A better approach is **decentralized seeding**, where data distribution and reconstruction no longer depend on a single large node, thus increasing throughput securely.

## Decentralized Seeding

Currently, several intersecting approaches to decentralized seeding are under active development. These include horizontal mempool sharding with partial column dissemination, and FullDAS’s design of cell-level propagation.

### Cell-Level Propagation

In the FullDAS architecture, nodes are deterministically assigned **custody** responsibilities based on their NodeID, managing one or more complete rows or columns. This mapping is public and deterministic, enabling quick sampling coordination by other nodes. Unlike row- or column-level granularity, data is encoded into a 2D matrix, with the smallest unit called a **cell**, located at the intersection of a row and column.

In newer versions, when a blob-carrying transaction enters the execution-layer mempool, nodes can immediately encode it along the row direction. This reduces overhead for builders and allows a node to respond to `getBlobs` requests by returning pre-encoded row fragments.

More importantly, after extracting the blob from the execution layer, a node can directly disseminate the **column** data. If the cell falls within a subscribed column, it is directly pushed to neighbors; otherwise, it's preferable to first gossip its availability. During propagation, once a node collects enough cells from a column to exceed a reconstruction threshold, it can recover the column without needing all blobs. The reconstructed node can then act as a new seeding source, spreading remaining cells in that column or row.

This **cross-forwarding** mechanism enables cooperation between rows and columns to propagate and repair missing segments, effectively “amplifying” data availability.

### Horizontal Mempool Sharding

In environments where the execution layer (EL) and consensus layer (CL) are separated, blobs exist both as transactions in the EL and as data in the CL’s availability network. To optimize seeding from the source, **mempool-level sharding** is introduced.

This approach pre-partitions blob-carrying type-3 transactions **before** they enter a block, assigning blobs to different nodes based on sharding rules. Each node only downloads transactions and blob data belonging to the shard that matches its NodeID.

This binds the EL’s blob downloading responsibility with the CL’s **row custody** assignment, avoiding redundant uploads of row data to the CL after the block is built.

After horizontal sharding, since column data is the vertical slice of blob data, each node possesses partial column data and becomes responsible for disseminating it.

### Partial Column Dissemination

Nodes are deterministically and statically assigned to different columns. They disseminate corresponding column slices extracted from the horizontally sharded mempool data. Simultaneously, they receive other column segments from peers to assemble complete columns.

This strategy—**mempool-level sharding + partial column dissemination**—relieves the builder and CL nodes from heavy upload workloads and increases availability and redundancy of column data. It is key to achieving column-level distribution **without introducing supernodes**.

This method significantly reduces bandwidth usage, making it especially suitable for home-stakers. However, it introduces system complexity. A typical issue is **nonce gaps**: transactions from the same sender may be assigned to different shards, breaking execution order.

![image.png](/shared/partial-column-dissemination.png)

## Scheduling Optimization

Beyond decentralized distribution, another major optimization area is **scheduling**. DAS has unique demands and characteristics that standard protocols like GossipSub weren’t designed for. Several targeted optimizations have been proposed, many of which are **orthogonal** and can be **combined** to produce multiplicative benefits.

### Batch Publishing

In traditional GossipSub, each message must queue through the `publish` API to be sent to neighbors. Messages published early spread quickly, while those at the tail experience delays. This results in uneven data coverage and delays in data availability sampling.

**Batch Publishing** explicitly tells the network stack that a group of messages belongs to the same batch and should be optimized together. It uses **interleaved scheduling**, a form of concurrency, ensuring that each message in the batch is sent at least once to a random neighbor before broadcasting additional copies. This triggers peer-to-peer diffusion efficiently.

### Rarest-First

Inspired by BitTorrent’s piece selection strategy, **Rarest-First** prioritizes propagation of cells or columns least observed in the network. It aims to boost redundancy for scarce data early, preventing future bottlenecks.

Rarity is locally estimated by tracking `IHAVE` messages. The node then prioritizes pushing rare items during the push phase.

This strategy is especially effective during **initial seeding**, enhancing network coverage and path diversity. When combined with batch publishing, it ensures high-priority propagation for rare items, improving scheduling efficiency.

### Node Coloring

**Node Coloring** statically divides the node set into groups (colors), each responsible for a distinct subset of data. The most common pattern is for nodes of the same color to avoid redundant propagation among themselves, while inter-color communication bridges the data.

In DAS, colors can be assigned based on NodeID and data coordinates. Each node determines its data subset based on its color and prioritizes handling it. This creates finer-grained concurrent propagation, reduces hotspots, and accelerates distribution.

### PPPT (Push-Pull Phase Transition)

GossipSub enables fast DA data propagation but causes significant **duplicate overhead**, wasting bandwidth. It uses two modes:

* **PUSH**: Nodes form a mesh of degree $D$, actively broadcasting received messages to $D - 1$ neighbors.
* **PULL**: Missing messages are recovered via `IHAVE/IWANT` gossip messages across the broader network.

By default, GossipSub relies heavily on PUSH, with PULL used only as a fallback. As the network saturates, duplicate traffic increases drastically.

**Push-Pull Phase Transition (PPPT)** is a dynamic scheduling strategy that allows nodes to adapt based on **hop-count**. Early hops use PUSH to ensure fast diffusion, later hops switch to PULL to reduce duplicates.

Each node reads the message’s hop-count $h$, then applies a preset threshold $d$ to determine strategy:

* If $h < d$, perform $max(0, d - h)$ additional PUSH steps to $d - h$ neighbors;
* If $h \ge d$, switch to PULL by sending `IHAVE` to remaining peers and wait for `IWANT`.

This **gradual transition** cuts down redundant messages in late stages, while maintaining low-latency propagation early on. Experiments show PPPT nearly eliminates duplicates while only slightly increasing total latency—achieving high-throughput, bandwidth-efficient GossipSub performance.

## References

* [**Accelerating blob scaling with FullDASv2 (with getBlobs, mempool encoding, and possibly RLC)**](https://ethresear.ch/t/accelerating-blob-scaling-with-fulldasv2-with-getblobs-mempool-encoding-and-possibly-rlc/22477)
* [**PPPT: Fighting the GossipSub Overhead with Push-Pull Phase Transition**](https://ethresear.ch/t/pppt-fighting-the-gossipsub-overhead-with-push-pull-phase-transition/22118)
* [**Improving DAS performance with GossipSub Batch Publishing**](https://ethresear.ch/t/improving-das-performance-with-gossipsub-batch-publishing/21713)
* [**FullDAS: towards massive scalability with 32MB blocks and beyond**](https://ethresear.ch/t/fulldas-towards-massive-scalability-with-32mb-blocks-and-beyond/19529)
* [**From 4844 to Danksharding: a path to scaling Ethereum DA**](https://ethresear.ch/t/from-4844-to-danksharding-a-path-to-scaling-ethereum-da/18046)
* [**Doubling the blob count with Gossipsub v2.0**](https://ethresear.ch/t/doubling-the-blob-count-with-gossipsub-v2-0/21893)
* [**A new design for DAS and Sharded Blob Mempools**](https://ethresear.ch/t/a-new-design-for-das-and-sharded-blob-mempools/22537)

