# Concept

## From “Big Blocks” to “Data Availability (DA)”

At its core, a blockchain is simply a system for reaching consensus on a batch of recent transactions within a certain period. These transactions are bundled into a block, which is then downloaded and verified by nodes around the world to ensure each transaction was correctly executed, and ultimately to achieve global agreement on the block's validity.

To make blockchains “faster,” the intuitive solution is to process more transactions in the same amount of time. However, more transactions mean larger blocks, which brings both good and bad news.

**The bad news**: For nodes to reach consensus, they must first have access to the block data. In a peer-to-peer network, rapidly disseminating large chunks of data across the globe is both time-consuming and prone to failure. Some solutions try to circumvent this challenge by sacrificing decentralization—allowing only a few nodes to verify transactions—but this goes against the core values of blockchain.

**The good news**: With the advent of Zero-Knowledge Proofs (ZKPs), we no longer need all nodes to receive the full block data in order to verify that transactions were correctly executed. ZKPs are a vast topic, but here we only need to understand their basic principle.

### The ZKP Model

Each blockchain maintains a complete, real-time set of data, such as all account balances, known as the “state.” When a block is added, transactions within it update this state, replacing the old "fingerprint" with a new one. This fingerprint (state root) is derived from a massive dataset computed from all historical transactions. Even a small change—like updating a single balance—can dramatically change the fingerprint. Thus, by verifying whether the new state root is valid, we can confirm that the block was correctly executed.

![image.png](/en/ZKP.png)

In the traditional model, nodes receive the full block, compute the new state, and agree on the new fingerprint.

In the ZKP model, block producers must additionally generate a proof that their computations are correct. Verifiers only need to check this proof and the new fingerprint—no need to download the full block—which significantly lowers the barrier to participation and allows more nodes to join consensus.

But this brings a new problem.

### Data Availability
Imagine: I have 100 ETH and send 80 ETH to a friend. A block producer processes this transaction, computes a new state root (I now have 20 ETH), and generates a zero-knowledge proof to confirm this state transition is correct. Validators accept the new state root after verifying the proof.

![image.png](/en/da.png)

But what if the block producer does not reveal the fact that I now only have 20 ETH? Then, when I try to send another 10 ETH in the future, other producers cannot verify whether I have sufficient balance. This means only the original producer, who holds the full data, can continue producing blocks. They effectively control the entire network and could halt it at any time to profit by shorting the market.

To prevent this, we must not only verify the correctness of the new state root, but also ensure that the producer has published the new balance data.

A simple way to do this would be to have all validators download the full block data before verifying, but that defeats the purpose of scaling. This is where Data Availability (DA) comes in: it allows validators to confirm that the full data is available on the network without downloading it all—ensuring anyone can access the data if needed.

This is the core idea behind L1 scaling and ZK Rollups. While Optimistic Rollups work a bit differently, they share a similar underlying principle.

## What Is DAS?

We’ve seen that if a malicious block producer withholds post-execution state data, the network could stall—even if they provide a valid state root and ZK proof. To solve this, we must ensure that verifiers can probabilistically confirm that data was indeed fully published to the network—without downloading all of it.

It's like someone uploading a movie via P2P. You don’t want to spend hours downloading it only to find out the full file isn’t available. So instead, before downloading, you do a few tests: split the movie into thousands of numbered chunks, and try downloading some random ones. If you can download a few successfully, your confidence increases. Keep sampling more chunks, and eventually, you’re reasonably sure the full movie exists online.

That’s the core idea of Data Availability Sampling (DAS): probabilistically confirm that data is "available" by randomly sampling small portions. But it’s not quite that simple.

You might have experienced a download stuck at 99.9%—the final chunk is missing, and no matter how many times you retry, you can’t get it. Only then do you realize: the file was never fully uploaded. Even if you sampled dozens or hundreds of times, you may still have missed the missing chunk. Unless you randomly hit it, you’ll never know it’s gone.

In other words, sampling can give high confidence that the data is available, but not a deterministic guarantee of completeness. For movies, that’s just annoying. For blockchains, it can be catastrophic—leading to halted blocks, hidden transactions, or even network attacks.

So we shift strategies. Since we can’t guarantee 100% completeness through sampling, we aim for something "good enough": ensure that at least 50% of the data is available on the network. That’s much more feasible:

![image.png](/en/das.png)

- With 50% of data available, a random sample has a 50% chance of hitting it;
- Sampling twice and missing both has a probability of 0.5 × 0.5;
- The more you sample, the lower the chance of missing everything;
- After just 7 samples, confidence in data availability is extremely high.

Most importantly, this confidence is independent of data size. Whether the block is 1MB or 1GB, sampling requires only minimal bandwidth.

Why is 50% enough? Because the original data is encoded using erasure codes—so as long as you get any 50% of the chunks, you can reconstruct the full data. That’s the magic of DAS: providing probabilistic guarantees of availability, enabling secure and scalable data propagation with minimal resource consumption.