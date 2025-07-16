
# Applications

Scaling L1 and L2 is a vast and complex topic. This article won’t cover everything in detail, but instead focuses on data availability as a core perspective. For a more comprehensive overview, refer to the [Ethereum scaling documentation](https://ethereum.org/en/developers/docs/scaling/).

## L1 Scaling

The most direct way to scale is to allow the base layer (L1) to handle more transactions. Thanks to the combination of **Data Availability Sampling (DAS)** and **Zero-Knowledge Proofs (ZKP)**, this is becoming feasible:

* **Data Availability**: DAS ensures that on-chain data has been fully published;
* **Execution Validity**: ZKP verifies the correctness of transaction execution without needing to re-run the computations.

Together, these enable an extreme but powerful model: validators no longer need to store state or download transaction data. A lightweight proof is all that's required to verify an entire block. The validator's workload is so minimal that verification could run on a mobile device or browser extension.

Of course, this doesn't mean the computation disappears—generating ZKPs is still very expensive and must be completed within the block time. This leads to a crucial question: **who generates the proof?**

The most straightforward solution is to rely on large, resource-rich nodes. However, this introduces centralization risks. A fundamental solution requires reducing the cost of generating proofs—this includes both the proof of consensus and the proof of EVM execution. The EVM, not originally designed for ZK-friendliness, presents particular challenges and has become a bottleneck for efficient proof generation. Optimizing the virtual machine for ZK compatibility is thus a major research direction.

ZK-ifying the consensus layer also requires foundational changes—modifying block structures, adjusting consensus mechanisms, and most importantly, building robust stateless clients. In the long term, it’s more stable to first deploy these advanced mechanisms at the application layer. The progress of zkEVM exemplifies this strategy. Moreover, L2s tend to be more efficient than L1 and will continue to serve diverse application-layer needs.

## Rollup

Rollups offer another scaling pathway. They offload execution to off-chain systems while retaining on-chain data and settlement. You can think of this as a kind of *execution sharding*:

* Execute transactions and update state off-chain;
* Publish data and results to the main chain for verification and settlement.

The Rollup design is becoming mature, but there are still significant differences in implementations—particularly in their proof systems, data publishing strategies, and finality guarantees. These design choices directly affect performance, security, and applicability.

### ZK-Rollup

ZK-Rollups use zero-knowledge proofs to compress off-chain execution into a validity proof, submitted alongside the new state root to an on-chain contract. The main chain only verifies the proof’s validity to confirm the correctness of all transactions—without re-executing any of them.

In addition, ZK-Rollups must make a cryptographic commitment to the state delta and bind this to the proof. This ensures that the published data genuinely causes the correct state transition and that the new state can be reconstructed.

Compared to L1 ZK scaling, ZK-Rollups have much lower real-time requirements. zkEVMs aim to replicate full EVM behavior, allowing existing smart contracts to migrate without modification. However, since the EVM is not ZK-friendly, generating proofs is extremely costly and becomes a bottleneck. Some systems solve this by designing custom zkVMs or introducing highly optimized circuits to allow efficient proof generation over batched transactions.

### Optimistic Rollup

In contrast to ZK-Rollups, Optimistic Rollups don’t require expensive computation to generate validity proofs. Instead, they introduce a **challenge window** during which the results are not yet finalized.

Optimistic Rollups take a pragmatic engineering approach: they assume off-chain execution is correct and submit results to the main chain without a proof—while allowing challenges during the window. If any observer finds an error, they can submit a fraud proof within the challenge period.

Conceptually, this works by deploying an EVM-equivalent contract on-chain. The challenger submits the disputed transaction data for re-execution. If the resulting output diverges from the submitted result, the challenge succeeds. However, in practice, faithfully replicating the EVM in a contract is infeasible—any minor differences (like gas cost rules) could introduce vulnerabilities.

A key point: challengers **must have access to transaction data** to re-execute and generate a fraud proof. If a malicious actor hides the data, challenges become impossible. Therefore, **Optimistic Rollups must publish all transaction data** on-chain in a data-available format—making them **more dependent on data availability** than ZK-Rollups.

## Validium

Unlike standard Rollups, Validium **does not rely on the base chain for data availability**. Instead, it stores data off-chain, and the main chain only verifies the ZKP attesting to state changes.

This significantly reduces on-chain data burden, lowering transaction costs and increasing throughput. Validium is particularly suited for use cases that don’t require on-chain data—such as games, identity systems, NFTs, or enterprise ledgers. Additionally, Validium offers unique advantages for privacy-preserving applications.

To ensure off-chain data remains secure, Validium typically introduces a **Data Availability Committee (DAC)**—a set of permissioned nodes responsible for storing and serving the data. The system assumes a majority of these DAC nodes are honest. If most nodes go offline or behave maliciously, users may be unable to retrieve their assets, resulting in system freeze.

To mitigate this risk, Validium offers **one-time exit mechanisms**. A user can submit a Merkle proof on-chain to validate their account state and exit the system. However, this is only a fallback—it cannot replace the guarantee of continuous data availability.

## Volition

Volition is an evolution of Validium, offering users **a per-transaction choice** of whether to publish data on-chain:

* If data is posted on-chain, it achieves Rollup-equivalent security;
* If kept off-chain, it enjoys the efficiency and low cost of Validium.

This allows developers to dynamically adjust the security model based on user needs, use case sensitivity, and value scale—while preserving a unified verification logic on the main chain.
