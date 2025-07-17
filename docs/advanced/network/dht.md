
# Distributed Hash Table (DHT)

In a decentralized network, there are three fundamental problems to solve:
How do nodes efficiently discover one another?
Where should data be stored?
And when a user requests a piece of data, how can the network respond quickly?
DHT (Distributed Hash Table) was designed to address these exact challenges. It allows every node in the network to both store data conveniently and locate any data with high efficiency, regardless of the network size—achieving fast lookups even at large scale.

## Core Principles

DHT organizes nodes in the network based on a notion of logical distance. Each node primarily maintains connections to those closer to itself (by ID), while maintaining fewer connections to more distant nodes. Similarly, data is stored on nodes whose IDs are close to the data's ID. When a file is queried or transmitted, nodes can progressively route the request toward the closest match.
This structure allows each part of the network to scale adaptively. No matter how large the network becomes, data can still be located efficiently within a limited number of hops.

### XOR Distance

In DHT, distance is not geographic but logical, calculated using the XOR operation. Every node and piece of data is assigned a unique ID (usually via hashing), which can be represented as a 256-bit binary number.
To compute the distance between two IDs, XOR them bit-by-bit: matching bits yield 0, differing bits yield 1. The resulting binary value represents the XOR distance. For example:

* Node A ID: 10110011
* Node B ID: 11001011
* A XOR B = 01111000

A smaller XOR result means the two IDs are closer. DHT uses this distance metric to organize nodes and assign data responsibility.

### Routing Table and k-bucket

Each node maintains a routing table recording the peers it knows. Since a full list of all nodes would be too large, the table is structured hierarchically into **k-buckets**.

![image.png](/en/k-bucket.png)

Assuming IDs are 8-bit binary values, each level of the table corresponds to a range of XOR distances.

* The first level holds nodes with XOR distance in the range \$2^0\$ to \$2^1\$,
* The second level covers \$2^1\$ to \$2^2\$, and so on.
  Each k-bucket stores at most \$k\$ nodes to keep the table compact.
  As you go to higher levels, the XOR distance covered increases, so those buckets may contain more diverse and distant peers.

### Data Lookup

When you upload or download a piece of data, the system first calculates the target ID where the data should reside. Then, from the local routing table, it selects the nodes closest to that ID and sends them a lookup request.
These peers, in turn, return nodes that are even closer to the target ID, and the process continues iteratively until the node storing the data is found.

This process is essentially a nearest-neighbor iterative search, progressively approaching the target.
The overall lookup complexity is $O(\log n)$, making it scalable even in networks with thousands of nodes.

## Application Challenges

Due to its flexibility, adaptiveness, and efficient lookup capability, DHT was once considered an ideal candidate for node discovery and data dissemination in DAS systems. In principle, sampling nodes can query a small number of peers to efficiently locate and retrieve data from a network of thousands. This logarithmic lookup greatly reduces the bandwidth and storage burden of full synchronization, supporting both L1 and L2 scalability.

However, real-world experiments and research have shown that DHT introduces a new set of challenges when applied to data availability. Its strengths and limitations become more pronounced under the specific demands of DAS.

### Amplified Security Threats

While DHT offers high data availability through dynamic routing, its trustless nature makes it vulnerable to Sybil attacks. In high-value DAS networks, an attacker can inject large numbers of Sybil nodes to fill honest nodes' routing tables. This can isolate sampling requests and lead to permanent data loss.
Because Sybils can target specific subspaces of the key space, the cost to the attacker is minimal, while the impact on availability is potentially catastrophic.

![image.png](/en/sybil.png)

One possible mitigation is to verify on-chain identities (e.g., via ENS or staking), thereby raising the cost of attack. However, compared to the overall network security budget, this cost may still be too low to act as an effective deterrent.

### Path Predictability and Hijacking

DHT lookups involve querying several nodes for progressively shorter paths. But studies have shown that such routing often converges to a small set of central nodes. If these nodes are controlled by adversaries, they can censor or blackhole lookup requests.
Even if the sampling phase has already succeeded, such attacks can render data unavailable at the point of verification.

### Distribution Bottleneck

Although DHT provides logarithmic lookup complexity, DAS places extreme pressure on initial data distribution. In DAS, data must be disseminated to custodians in a very short time window. This leads to a large burst of concurrent queries, which DHT is not well-equipped to handle.
Studies show that even under healthy conditions and small data volumes, full-network propagation via DHT can take minutes—far too long for real-time block validation.
Moreover, increasing the distributor's resources does not significantly help, since the DHT queries themselves are routed through the distributor’s neighbors.

In theory, a distributor with global routing knowledge could bypass lookup and directly push data to target nodes, but such a design requires a highly provisioned, semi-centralized actor.

## Current Usage and Alternatives

Given the aforementioned challenges and the growing clarity of DAS network requirements, current systems do not use DHT directly for storing availability data.
Instead, DHT is used for **node discovery and distributed indexing**, where its benefits in routing and scalability remain valuable.
Despite its limitations, DHT continues to be an important architectural option within the DAS networking stack, and may evolve in hybrid form or in conjunction with verifiable data routing strategies.
