# Security Assumptions

## Security Definitions and Categories

When discussing the security of DAS, we are essentially referring to two interrelated aspects:

* **Global security of DAS as a cryptographic primitive**: Treating DAS as a standalone module, its security can be analyzed under the UC (Universal Composability) framework.
* **System-wide security of consensus with DAS sampling**: Assessing how DAS affects the overall security when integrated into a blockchain or Rollup environment.

This is because DAS never operates in isolation—it always functions within a broader environment. Therefore, it is necessary to ensure both the **global security of DAS itself** and the **security of the surrounding system once DAS is introduced**.

### Environmental Impact

The DA layer introduces fundamental changes compared to previous blockchain modules. Once DAS is integrated, the security of the surrounding environment can be evaluated from three perspectives: **global safety**, **chain liveness**, and **client liveness**.

* **Global safety**: Under DAS, global safety refers to the guarantee that "unavailable data will be rejected by nearly all nodes." In other words, if block data is unavailable, almost all validators (except for a few compromised nodes) will detect and reject the block. This ensures that blocks included on-chain are data-available, and prevents adversaries from pushing unavailable blocks onto the canonical chain.
* **Chain liveness**: The ability of the blockchain to continue producing new blocks and eventually reach consensus. From the perspective of an external observer, the chain continues to finalize new blocks over time.
* **Client liveness**: The ability of an individual client (such as a validator or light node) to confirm new transactions over time. This refers to whether a single client can continuously see and verify finalized blocks that contain their transactions.

In classical blockchains without DAS, **client liveness is nearly equivalent to chain liveness**, unless the client is under an eclipse attack. This is because traditional blockchains avoid external ambiguity (e.g., oracle inputs are confined to the application layer). With DAS, however, it introduces **unattributable but legitimate forks**, which become new concerns for system security.

### **Global Security of the DA Layer**

Put simply, the DA layer (DAL) introduces a subtle distinction between client liveness and classical block production. Without DAS, any divergence in node state due to network issues can usually be traced and resolved, eventually achieving consensus. With DAS, however, nodes may form **subjective and untraceable views** on data availability, leading to inconsistencies that are no longer attributable.

If we ignore environmental constraints, in theory the DAL can be 51% secure, which sounds robust. However, when deployed in a real-world environment, such assumptions are insufficient. A secure DAL must remain indistinguishable from a correctly functioning protocol under any environmental conditions. This is crucial not only for the host chain using the DAL, but also for Rollups and other systems that depend on it.

Thus, we must **redefine DAL security** in light of its effects on global safety, chain liveness, and client liveness, and seek a balance among them.

## Security Assumptions

### **Unlinkability of Sampling Requests**

**Unlinkability** refers to the inability of an attacker to associate multiple interactions or requests with the same client. In DAS, this property is critical to prevent **selective data disclosure attacks**, where an adversary behaves honestly for some clients but maliciously toward others.

Correlations may arise through temporal patterns, geographic signals, or identity fingerprints. For example, a malicious publisher might respond to early sampling requests but ignore later ones, misleading initial clients into believing the data is available. To prevent this, anonymized communication channels such as **mixnets (e.g., Tor, Nym)** are required to obscure request origins.

Many researchers are exploring the use of mixnets to anonymize DAS communication, aligning with this ideal assumption. These mechanisms prevent adversaries from crafting customized response strategies per node, thereby ensuring that **no single node can be singled out or selectively deceived**. However, this usually comes at high implementation costs.

### **Minimal Honest Sampler Assumption**

We abstract the DAS network as comprising **data providers** and **samplers**. Samplers not only verify data availability but also **store the sampled fragments**. If too few honest samplers participate, it becomes possible for a malicious provider to serve data only during the sampling phase and then refuse further access, leading to **data loss post-sampling**.

This assumption ensures that even if each sampler only checks a small portion of the data, collectively the honest nodes **cover the entire data space**. Without this, adversaries can hide unqueried portions of the data from the network.

### **Network Synchrony and Connectivity Assumption**

In idealized models, sampling is assumed to occur **synchronously** across nodes, which supports unlinkability. Furthermore, since sampled data must be retrievable, samplers are assumed to **store their samples**, implying the data is still available somewhere on the network.

If nodes are **disconnected or partitioned**, it can cause honest nodes to misjudge availability (e.g., failing to reconstruct despite data being present elsewhere), thus compromising **client liveness**.

Hence, the network is generally assumed to have **synchronous or quasi-synchronous properties**, allowing data to propagate within a bounded delay.