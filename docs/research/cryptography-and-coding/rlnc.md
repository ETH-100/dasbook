# Applications of Random Linear Network Coding (RLNC) in Data Availability Layers

::: warning
This article discusses cutting-edge solutions currently being explored by the community. Some mechanisms are still in theoretical design, experimental validation, or draft proposal stages. Their security, feasibility, and implementation details may evolve with future research.
:::

So far, Ethereum and several other data availability layers have adopted Reed-Solomon (RS) codes or their variants, often combined with KZG commitments to operate in adversarial environments. RLNC presents an alternative with several advantages, though its use in DAS still faces many challenges.

## Background

### **The Butterfly Network**

Data dissemination in DAS is deeply related to classical concepts in communication networks such as unicast, broadcast, and multicast. Linear Network Coding (LNC) is a breakthrough in this area. LNC demonstrates that traditional routing cannot achieve the multicast capacity bound, but by allowing intermediate nodes to perform linear encoding, it is possible to reach the theoretical max throughput defined by the min-cut.

The butterfly network is a canonical example in network coding theory, illustrating the limitations of traditional routing in multicast scenarios and demonstrating the core idea behind LNC.

![image.png](/shared/the-butterfly-network.png)

In this simplified network, there are two receiver nodes $t_1$ and $t_2$, along with several intermediate nodes. The goal is to deliver two messages to both receivers. Each message and each link has a capacity of 1 (i.e., only one message per time slot per node).

Node $d$ is shared by both receivers. In traditional routing, $d$ can send only $A$ or $B$, causing $t_1$ to receive $A$ twice and $t_2$ to receive $B$ twice, requiring 4 time slots.

If we allow node $d$ to send a linear combination $A + B$, then:

* $t_1$ receives $A$ and $A + B$, computes $B = (A + B) - A$;
* $t_2$ receives $B$ and $A + B$, computes $A = (A + B) - B$;

Thus, both receivers obtain complete information in just 3 time slots. Linear network coding enables intermediate nodes to forward linear combinations instead of raw data, improving efficiency.

### RLNC Encoding Principle

Random Linear Network Coding (RLNC) is a simple yet powerful scheme that uses decentralized algorithms to achieve near-optimal throughput.

Given a set of original data blocks $m_1, m_2, \dots, m_k$, each node transmits linear combinations:

$$
c_i = \sum_{j=1}^k \alpha_{i,j} \cdot m_j
$$

where:

* $\alpha_{i,j}$ are randomly chosen coefficients from a finite field, e.g., $\mathbb{F}_{2^8}$;
* $c_i$ is the encoded block;
* Each encoded block includes its encoding vector $(\alpha_{i,1}, ..., \alpha_{i,k})$.

Once any $k$ linearly independent blocks are collected, the original data can be recovered by solving the corresponding linear system:

$$
\begin{bmatrix} \alpha_{1,1} & \cdots & \alpha_{1,k} \\ \vdots & \ddots & \vdots \\ \alpha_{k,1} & \cdots & \alpha_{k,k} \end{bmatrix}
\cdot
\begin{bmatrix} m_1 \\ \vdots \\ m_k \end{bmatrix}
=
\begin{bmatrix} c_1 \\ \vdots \\ c_k \end{bmatrix}
$$

Intermediate nodes can also recombine received encoded blocks without decoding, preserving rank and enabling robust propagation.

### Pedersen Commitment

In untrusted environments like blockchains, we must ensure that data has not been tampered with and is properly encoded. Pedersen commitments address this to some extent.

Pedersen commitments are based on the discrete logarithm problem and require a trusted setup (distinct from KZG). The setup includes:

* A cyclic group $\mathbb{G}$ of prime order $q$;
* Two generators $G, H \in \mathbb{G}$, with $\log_G H$ unknown.

For a message $m \in \mathbb{Z}_q$ and randomness $r \in \mathbb{Z}_q$, the commitment is:

$$
C = m \cdot G + r \cdot H
$$

Pedersen commitments are homomorphic: $C_{v_1 + v_2} = C_{v_1} + C_{v_2}$. This makes them well-suited for verifying linear combinations. Variants without randomness (i.e., $r = 0$) are used in RLNC applications where hiding the message is not required.

## Accelerating Block Propagation

RLNC was first proposed to accelerate block propagation and save bandwidth.

### Sender

**Initialization**

* Split the block into $N$ chunks;
* Each chunk $v_i = (a_{i1}, ..., a_{iM}) \in \mathbb{F}_p^M$;
* Commit to each $v_i$ using Pedersen commitments with fixed public generators $G_j \in \mathbb{G}$:

$$
C_i = \sum_{j=1}^{M} a_{ij} \cdot G_j
$$

**Message Construction**

Each $v_i$ is treated as a block in RLNC. The sender randomly chooses scalars $b_i$ to form a linear combination:

$$
v = \sum_{i=1}^N b_i v_i
$$

Message includes:

* Encoded data $v$ ($32M$ bytes);
* $N$ commitments $C_i$ ($32N$ bytes);
* $N$ coefficients $b_i$ ($32N$ bytes);
* A BLS signature on the concatenated commitments ($96$ bytes).

### Receiver

The receiver checks the signature, reconstructs the commitment $C$ from $v = (a_1, ..., a_M)$:

$$
C = \sum_{j=1}^M a_j G_j
$$

And verifies:

$$
C' = \sum_{i=1}^N b_i C_i \quad \Rightarrow \quad C \stackrel{?}{=} C'
$$

If valid and $v$ is linearly independent of stored vectors, it is added. Once $N$ independent vectors are collected, the original $v_i$ can be recovered.

### Forwarder

Without decoding, relays can generate new valid combinations:

1. Select $L$ stored vectors $w_i$ with encoding vectors $b_{ij}$;
2. Randomly choose scalars $\alpha_i$;
3. Compute $w = \sum \alpha_i w_i$ and $a_j = \sum \alpha_i b_{ij}$;
4. Send new message $(w, a_j, C_i, \text{signature})$.

All nodes use the same commitments and proposer signature, avoiding redundant verification.

## DAS Applications

DAS has different requirements from block propagation:

* Larger data volumes;
* Extremely low-latency distribution;
* Fragmented download (each node stores only a portion).

Coefficients can be drawn from small fields, even binary fields (i.e., XOR). This approximates Fountain codes.

Unlike 2D RS sampling, RLNC does not allow sampling specific cells or columns. Instead, it verifies linear combinations over the entire space. However, like current DAS designs, seed nodes store $K$ independent vectors:

$$
\text{span}(w_1, ..., w_K) \subseteq \mathbb{F}_p^N
$$

A sampling node sends $K$ random scalars $c_1, ..., c_K$, requesting:

$$
w = c_1 w_1 + \cdots + c_K w_K
$$

With $w$ and the coefficients, the sampler verifies the commitment. This achieves **sample visibility**—samples are accessible and verifiable, unlike 2D RS where sampled cells may not be discoverable.

### Attack Vectors and Defenses

A malicious node can cheat by storing only one vector $w_f$, and crafting responses that appear as combinations of fake vectors $w_1', ..., w_K'$ satisfying:

$$
a_1 w_1' + \cdots + a_K w_K' = w_f
$$

Since commitments verify linear combinations, this forged response still passes.

To prevent such **degeneracy attacks**, two approaches exist:

* **I-RLC** (Interactive): The sampler requests how stored vectors are derived;
* **NI-RLC** (Non-Interactive): Reduce interaction.

Another method is requiring RREF (Reduced Row Echelon Form) encoding bases initially. RREF serves as a nearly unique canonical basis, limiting forgery flexibility. This approach's security remains under evaluation.

## Conclusion

Applying RLNC to data availability layers offers several significant advantages:

* **Near-optimal throughput**: Approaches the min-cut bound;
* **Re-encoding and multicast**: Relays can recombine without decoding;
* **Efficient verification**: Pedersen commitments enable lightweight trustless validation;
* **Sample visibility**: Overcomes the sample discoverability limitation in 2D RS schemes.

Moreover, RLNC may eliminate the need for subnetworks (depending on the design). While RLNC lacks the matrix-structured amplification of 2D RS, that amplification itself can be seen as a special case of linear network coding.

However, several challenges remain for practical deployment:

* **Sampling security**: Still an open problem in RLNC;
* **Trade-offs with 2D RS**: Need to balance sample locality, decoding complexity, and throughput;
* **Patent & standardization**: Some RLNC techniques are patented, which may hinder adoption;
* **System complexity**: RLNC introduces significant architectural changes compared to RS + KZG.

## References

* [**Linear network coding**](https://en.wikipedia.org/wiki/Linear_network_coding)
* [**Battle of the Codes: RLNC vs Reed-Solomon & Fountain Codes**](https://mirror.xyz/0xBfAC4db6d990A6cF9842f437345c447B18EbeF73/GD-GGB8jlpv9wxwpLQzSFkJfT_F8fz91MxRoocI4L20)
* [**Faster block/blob propagation in Ethereum**](https://ethresear.ch/t/faster-block-blob-propagation-in-ethereum/21370)
* [Alternative DAS concept based on RLNC](https://hackmd.io/@nashatyrev/Bku-ELAA1e)
