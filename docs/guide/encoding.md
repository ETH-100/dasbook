# Encoding

## Data Availability Encoding

The core goal of DAS is to confirm whether data is fully available on the network, and encoding techniques are the key tool to achieve this.

After encoding, **any 50% of the encoded data** is sufficient to **reconstruct the original data**. While this may sound sophisticated, the principle is actually quite simple. We’ll introduce a few formulas—but don’t worry, they’re easy to follow.

### Starting with a Line

Suppose we have a small piece of original data split into two parts, denoted as $y_1$ and $y_2$. You can think of them as two points on a straight line, where $y_1$ corresponds to $x_1 = 1$ and $y_2$ corresponds to $x_2 = 2$. Based on the principle that *two points determine a line*, we can uniquely determine the line:

$$
y = ax + b
$$

To encode the original data, we generate the $y$ values for $x = 3$ and $x = 4$, resulting in:

$$
[y_1, y_2, y_3, y_4]
$$

![image.png](/en/line.png)

This gives us a **redundant dataset**, where any two of the four $y$ values are sufficient to reconstruct the entire line—and thus, recover the original $y_1$ and $y_2$. In other words, even if half the data is lost, the original information can still be recovered.

### Polynomial Interpolation and Reed-Solomon Encoding

Of course, real-world data is far more complex than just two numbers—it could include entire batches of transactions, state changes, smart contract executions, and more. A simple line won’t suffice, but that’s okay—we can use **polynomial interpolation** instead.

In encoding theory, we use a technique called **Reed-Solomon (RS) encoding**, which transforms original data into points on a high-degree polynomial and then performs redundancy expansion. This method is widely used in CDs, hard drives, and satellite communications—any system that requires high fault tolerance. For example, even if a CD is scratched, RS encoding allows us to recover the data. As long as you have a sufficient number of “points,” the original data can be reconstructed.

In blockchain data availability, RS encoding allows us to recover an entire block’s content as long as we obtain **any half of the data chunks**, providing a solid mathematical foundation for DAS.

## Correctness of Encoding

Let’s revisit the sampling process: a validator attempts to obtain data at a certain coordinate from the network. After repeated successful samples, they gain increasing confidence in the availability of the data. But here’s a critical question: **How do we ensure that the sampled data chunks are actually the original data, and not tampered with?**

### Data Fingerprints

To address this, we generate a unique fingerprint for each data chunk using a cryptographic hash. Then we pair these hashes, hash them again, and repeat this process until we get a single hash representing the entire dataset—this is the famous **Merkle Root**, and the tree-like structure is known as a **Merkle Tree**.

By publishing the path from a leaf to the root, anyone can verify whether a data chunk has been tampered with. Thanks to the Merkle Tree structure, the data publisher only needs to disclose the Merkle root, and other nodes can use a minimal proof (Merkle proof) to verify whether any given chunk belongs to the original dataset. This technique is widely used in Bitcoin, Ethereum, and other blockchains, forming a standard for on-chain data verification.

### Faulty Encoding

Merkle Trees ensure that data hasn’t been altered *after* publication—but they can’t verify whether the **original data itself was correct**. Let’s look at the original correct dataset:

$$
[y_1, y_2, y_3, y_4]
$$

This generates a Merkle root $root$.

![image.png](/en/merkle-tree.png)

Now suppose $y_2$ contains a malicious transaction—for instance, Alice has only 20 ETH but attempts to transfer 100 ETH to Bob. In an Optimistic Rollup, we could submit $y_2$ and its Merkle proof to initiate a challenge and invalidate the transaction.

But imagine Alice instead **replaces $y_2$ with a fake value $z$**, and builds a new Merkle tree with root $root'$, which she then publishes:

$$
[y_1, z, y_3, y_4]
$$

Then she **withholds $z$**, only releasing the other chunks.

![image.png](/en/merkle-tree-fraud.png)

This leads validators to **successfully sample** the dataset and mistakenly conclude it is available. But here’s the problem:

* We **can’t challenge** $root'$ using $z$, because we don’t know its contents.
* Even if we recover the correct $y_2$, we **can’t generate a valid Merkle proof** for $root'$, because $y_2$ doesn’t belong to that tree.

Thus, the malicious transaction is **successfully hidden** within seemingly available data—undetectable and uncorrectable. While this is a theoretical example, in practice **any dishonest encoding** introduces serious security risks.

The solution is **Fraud Proofs**.

### Fraud Proofs

To prevent such attacks, we introduce an additional role: the **honest full node**. This powerful node collects enough data to reconstruct the original dataset and **re-encodes it** to generate the correct Merkle root. If it finds that $root'$ is incorrect, it generates a **fraud proof**—containing enough chunks and corresponding proofs to show that the published data batch is invalid.

When a sampling node successfully samples data, it does **not immediately confirm** availability. Instead, it waits within a **time window** to see if any fraud proof appears. If one is received, the dataset is deemed **unavailable**. If none appears, the data is **finally confirmed as available**.

This is the fraud-proof-enhanced version of DAS—providing an additional layer of security.

### Polynomial Commitments

While fraud proofs are effective, they suffer from three main limitations:

1. **Dependence on full nodes**: Fraud detection requires powerful full nodes, increasing centralization. If too few exist, attackers could evade detection.
2. **Susceptibility to eclipse attacks**: If a sampling node is isolated from honest nodes, it may never receive fraud proofs.
3. **Proof overhead**: Merkle tree proofs can be larger than the data itself when datasets are huge.

There is a more elegant solution that solves all of these problems at once: **Polynomial Commitments**.

Recall how a malicious block producer cheated using Merkle proofs: by constructing a fake point $(x_2, z)$ and building a new Merkle root along with valid data. The system mistakenly accepts the dataset as available because Merkle Trees only verify individual data chunks, not the underlying polynomial (line).

Polynomial Commitments work differently: instead of generating a fingerprint for each data point, they generate a **commitment to the entire polynomial**. Every point on the polynomial can be proven individually. With just a **data chunk, a proof, and the original commitment**, validators can verify correctness. **Attackers cannot forge a valid proof** for a fake point like $z$.

In summary:

* **Merkle Trees** generate fingerprints for **each data chunk**.
* **Polynomial Commitments** generate a fingerprint for the **entire polynomial**.

In a Polynomial Commitment scheme, a validator only needs to know:

* A data point $(x, y)$;
* A proof associated with it;
* The original commitment value.

The proof size is relatively small, and we can even optimize it so multiple chunks share the same proof. With Polynomial Commitments, **fraud proofs are no longer necessary**, enabling highly **efficient and robust** data availability checks.
