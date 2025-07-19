

# Network Topology Design

While the data availability (DA) layer is theoretically highly scalable, the primary challenge lies in how to distribute data to peers and retrieve it from them. Gossip and DHT are two typical peer-to-peer (P2P) protocols. DHT has long been used for data propagation in decentralized systems, while Gossip protocols are widely adopted in blockchain infrastructures. However, neither was specifically designed for DAS, and each presents trade-offs. Designing DAS network topologies thus requires balancing **security** and **throughput**.

## Gossip

Despite vulnerabilities under default conditions, Gossip protocols offer structured advantages over DHT. These include **multi-path redundancy**, which avoids single-point hijacking; **keyless neighbor selection**, reducing vision pollution; and **tolerance of some malicious nodes**. Gossip also enables rapid message propagation: in Ethereum's GossipSub network, important messages can reach thousands of nodes in [just a few seconds](https://ethresear.ch/t/gossipsub-message-propagation-latency/19982/1).

However, this comes at a cost: **significant bandwidth overhead**. Each node broadcasts messages to multiple peers, leading to 3–8× amplification. For example, a 1MB message expanded via erasure coding to 2MB could ultimately consume 16MB of bandwidth—one of the major bottlenecks in DAS's high-frequency, high-volume setting.

Two directions help mitigate this: reducing redundancy and improving propagation path efficiency. GossipSub adopts a **dual-layer architecture**: core nodes form a stable **mesh network** with direct, high-priority connections using **eager push**, while non-mesh nodes rely on more economic **lazy pull**.

The pull mechanism is based on the **IHAVE/IWANT** pair. Instead of forwarding full messages to all neighbors, a node sends “IHAVE” notices to non-mesh neighbors. Only when a peer replies with “IWANT” does it send the actual data. This strategy drastically reduces waste. In practice, roughly 100 IHAVE messages are sent for every 1 IWANT, demonstrating its efficiency.

Still, IHAVE consumes bandwidth and operates at coarse granularity, lacking finer control. It also introduces delay: if messages don't quickly propagate through the mesh, peripheral nodes may remain unaware for some time.

**GossipSub v2.0** introduces the **IANNOUNCE/INEED** mechanism as a lightweight alternative. IANNOUNCE replaces IHAVE by advertising only message IDs, not digests, dramatically reducing bandwidth. INEED is the corresponding request, allowing precise message retrieval. This mechanism is more suitable for DAS scenarios involving large block bodies and fine-grained message fragmentation.

However, whether to completely eliminate IHAVE is a new trade-off. While IANNOUNCE is more efficient, IHAVE provides security and resiliency. It allows peripheral nodes—those not directly connected to the mesh—to still observe network propagation, which is especially valuable during DoS or censorship attacks.

Other enhancements include **PPPT (Push-Pull Phase Transition)**. PPPT dynamically switches modes based on **hop-count**. Early-stage gossip uses PUSH to ensure fast diffusion near the source, then transitions to PULL to reduce redundancy and bandwidth overhead. This **layered attenuation** structure is well-suited for DAS, where global consistency must be achieved across wide propagation domains.

## DHT

Compared to Gossip, DHT avoids bandwidth amplification during seeding. Its deterministic replication, logarithmic complexity, and elastic scalability make it appealing for large networks. However, DHT has **critical flaws**.

In terms of sampling, DHT performs reasonably. Yet simulations by Cortes-Goicoechea et al. show that **Kademlia-based DAS networks seed slowly**. For a 32MB block requiring \~262,144 fragments, even under optimistic low-latency conditions, seeding can take 10–14 minutes—over 50× longer than Ethereum’s 12s block target. This is because unmodified Kademlia requires a separate lookup for each fragment, leading to immense short-term parallelism. Worse, increasing seeder resources doesn’t help, as neighbor nodes become the bottleneck.

One mitigation is allowing seeders to use global routing, bypassing lookups. However, this introduces **centralization risk**.

Another fatal flaw is **Sybil vulnerability**. Attackers can flood a DHT region with fake nodes, capturing keyspaces and launching **data withholding attacks**. They can also drop or delay queries upon receipt.

Because of these fundamental issues, **complex DHTs are not currently preferred**. Instead, DAS can map node IDs directly to **Gossip row/column subnets**, avoiding DHT’s fragmentation and Sybil issues. Still, DHT’s advantages in storage locality and scalability remain appealing, and several DHT-enhancement proposals exist.

### S/Kademlia

DHT’s biggest weakness is Sybil resistance. Attackers can spin up many nodes to occupy parts of the keyspace and disrupt lookups. To counter this, Baumgart and Mies proposed **S/Kademlia** in 2007.

The first improvement is raising the barrier to node creation. They introduce **Proof of Work (PoW)** to deter Sybil attacks. But in Ethereum, PoW is inefficient: validator identities are naturally scarce and verifiable. So, researchers propose a cleaner alternative: use **validator keys**.

Each node has two identities: a regular ID and a **validator ID**, derived from its validator key. Validator IDs are hard to forge or mass-produce. This results in two logical networks: a regular DHT, and a **trusted backbone** of validators. Each node maintains two routing tables and falls back to the validator layer when anomalies are detected.

The second enhancement addresses **path hijacking**. Original Kademlia follows a linear search path—one compromised hop can ruin the lookup. S/Kademlia uses **multi-path lookups**: each query travels $d$ disjoint paths simultaneously. As long as one is honest, the target can be reached.

The third feature is the **sibling list**. Unlike Kademlia’s buckets (which store a few nodes per range), the sibling list focuses on maintaining the $k$ closest nodes (by XOR distance) to a target. This creates a **dense cache** near the target, preventing lookup stalling near the destination.

In DAS, each fragment (e.g., row/column) can be deterministically mapped via `hash(block_commitment, row, column)`. These keys are stored by the $k$ closest nodes, e.g., 10 regular + 10 validator peers, achieving **dual-replica protection**.

Over time, nodes accumulate rich peer info, achieving **near one-hop resolution**. Multi-path lookups can also be staged: start with one path, expand to three or five only on failure—saving bandwidth.

Overall, **S/Kademlia offers a secure DHT alternative**, using validator trust, multi-path resilience, and local density to survive large-scale Sybil attacks while enabling reliable sample lookup.

### Rated List

The **Rated List**, proposed by Dankrad Feist, is a DHT variant tailored for DAS. It builds a **social-graph-like** trust mechanism via local observation.

Each node periodically performs **network crawling**, collecting peer info from neighbors and neighbors-of-neighbors. The result is a **trust graph** with multi-hop peer relationships.

Each peer is then **scored** based on behavior—especially during sample lookups. Since mappings are deterministic, a peer “should” possess certain data. If it responds correctly, its score rises; otherwise, it’s marked inactive. These scores cascade: a parent’s score is affected by its child’s actions. Sybil clusters get marked as **low-quality regions**, and honest nodes gradually exclude them.

Rated List is **low-overhead** and **locally maintained**, requiring no consensus. Queries are part of normal operation. Peers converge toward bidirectional links. These features make it well-suited for **bandwidth-sensitive** DAS systems.

## Hybrid Networks

Gossip is faster; DHT is more elastic. For DAS, **hybrids** may be ideal. By leveraging DAS-specific traits, we can avoid weaknesses of both.

DAS has two stages: **data dissemination** and **sampling**. Dissemination prioritizes speed, so Gossip is preferred, with subnet division to control traffic. But sampling requires peers to **cover all subnets**, which scales poorly as subnet count grows (and impacts subnet security).

We can treat the **network of subnets** as a **DHT variant**. Subnet membership acts like a DHT bucket. Unlike traditional Kademlia, DAS Topic IDs (row/column identifiers) are dense and predictable, allowing deterministic subnet routing.

Two routing strategies:

* **Hypercube connections**: A node connects to topics with IDs $C + 2^j$ (mod total topics), covering log bits. In $\log\_2 C$ hops, any topic can be reached—short paths, high efficiency.
* **MSB flipping (Kademlia-style)**: Flip the $j+1$-th most significant bit of the topic ID to derive a neighbor—e.g., $10101 \rightarrow 11101$. This mimics prefix-distance shrinking in Kademlia.

These ensure logarithmic hop counts and minimal connections per node. This avoids maintaining full subnet neighbor sets, while sidestepping DHT’s sparse-key complexity.

This results in a **fast, resilient hybrid topology**. A node joins its assigned subnets (akin to S/Kademlia siblings) plus DHT-style neighbors. Upon sampling, it queries locally first; if missed, it hops to new subnets via logarithmic routing.

## References

* [**The rated list**](https://notes.ethereum.org/hfbmSM_9RYas6t013xjq6Q)
* [**Scalability limitations of Kademlia DHTs when enabling Data Availability Sampling in Ethereum**](https://arxiv.org/pdf/2402.09993)
* [**Improving DAS performance with GossipSub Batch Publishing**](https://ethresear.ch/t/improving-das-performance-with-gossipsub-batch-publishing/21713)
* [**Accelerating blob scaling with FullDASv2**](https://ethresear.ch/t/accelerating-blob-scaling-with-fulldasv2-with-getblobs-mempool-encoding-and-possibly-rlc/22477)
* [**FullDAS: towards massive scalability with 32MB blocks and beyond**](https://ethresear.ch/t/fulldas-towards-massive-scalability-with-32mb-blocks-and-beyond/19529)
* [**PPPT: Fighting the GossipSub Overhead**](https://ethresear.ch/t/pppt-fighting-the-gossipsub-overhead-with-push-pull-phase-transition/22118)
* [Draft (Notion link)](https://www.notion.so/216c156587888042805dfdcab42cf056?pvs=21)
