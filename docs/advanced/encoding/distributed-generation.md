# Distributed Construction

In a 2D data matrix, the original data is submitted by transaction initiators and is ultimately extended along both the row and column directions. A naïve approach would involve a single builder collecting all the data, determining the transaction order, performing the full 2D extension, and then generating the commitments and proofs for each extended row. However, this places a heavy burden on the builder, increases centralization, and becomes a bottleneck in the system.

In practice, we can leverage the homomorphic properties of KZG commitments, allowing us to generate new commitments and proofs without needing to compute or transmit the column-extended data explicitly.

![image.png](/en/decentralized-building.png)

## Core Principle

Let’s first recall the structure of KZG commitments. Let $f(X), g(X)$ be polynomials over a finite field $\mathbb{F}\_q$, both with degree less than $d$. Their KZG commitments are defined as:

* $C\_f = \text{comm}(f) = f(s) \cdot G$
* $C\_g = \text{comm}(g) = g(s) \cdot G$

Where:

* $s$ is a secret value chosen during a trusted setup (Structured Reference String, or SRS)
* $G$ is a generator point on an elliptic curve

For the sum polynomial $h(X) = f(X) + g(X)$, we have:

$$
C_h = \text{comm}(h) = h(s) \cdot G = (f(s) + g(s)) \cdot G = C_f + C_g
$$

This shows that KZG commitments are **additively homomorphic**:

$$
\text{comm}(f + g) = \text{comm}(f) + \text{comm}(g)
$$

This naturally extends to scalar multiplication. For $h(X) = a \cdot f(X)$, we have:

$$
\text{comm}(a \cdot f) = a \cdot \text{comm}(f)
$$

In general:

$$
\text{comm}(af + bg) = a \cdot \text{comm}(f) + b \cdot \text{comm}(g)
$$

Thus, a commitment can be viewed as a linear evaluation of a polynomial at $s$, followed by a multiplication by $G$. As described in the section on data matrices, performing interpolation in the column direction yields the same result as row-first interpolation due to linearity. Therefore, we can apply Lagrange interpolation directly to the commitment vector $C\_1, \dots, C\_n$ to produce new commitments $C\_{n+1}, \dots, C\_{2n}$ corresponding to the extended data, without accessing the underlying data.

The same principle applies to witnesses. Recall the witness for a point in a committed polynomial:

$$
W_{i,j} = \frac{f_i(\tau) - f_i(\omega^j)}{\tau - \omega^j} \cdot G
$$

Here, $f\_i(\tau)$ is implicitly known from the commitment, and $f_i(\omega^j)$ is the actual data point $D_i[j]$. The expression is linear in $f_i$, so we can define the following linear operator:

$$
\phi_j(f_i) := \frac{f_i(\tau) - f_i(\omega^j)}{\tau - \omega^j}
$$

Then the witness is:

$$
W_{i,j} = \phi_j(f_i) \cdot G
$$

We can now perform **in-the-exponent interpolation** for a fixed column index $j$:

$$
W_{n+1,j} = \sum_{k=1}^n \lambda_k \cdot W_{k,j} = \phi_j\left( \sum_{k=1}^n \lambda_k f_k \right) \cdot G
$$

Here, $\sum \lambda\_k f\_k$ corresponds to the column polynomial $f^{\text{col}}(X)$ obtained by interpolating column values $D_1[j], \dots, D_n[j]$. So the extended point $f^{text{col}}_{n+1}$ yields a valid KZG witness:

$$
W_{n+1,j} = \phi_j(f^{\text{col}}_{n+1}) \cdot G
$$

In other words, performing interpolation directly on the exponentiated witnesses $W_{1,j}, \dots, W_{n,j}$ gives us a valid KZG witness for the extended data point $D_{n+1}[j]$.

Since $W\_{i,j}$ is a linear function of $f_i(X)$, just like the commitment $C_i$, it supports **in-the-exponent interpolation**. We can interpolate the witness vector $[W_{1,j}, \dots, W_{n,j}]$ directly—without knowing the underlying data—to construct extended witnesses $[W_{n+1,j}, \dots, W_{2n,j}]$.

## Implementation

In traditional implementations, generating KZG commitments for the extended data requires a single powerful node to collect all data, perform the full 2D extension, and then compute commitments and witnesses. However, thanks to the homomorphic properties of KZG, **distributed construction** becomes feasible. This removes the dependency on a centralized builder, improves decentralization, and increases system efficiency.

One possible implementation is as follows:
Nodes are assigned to $n$ rows and $n$ columns. They acquire blobs via the mempool and exchange data within their respective column subnets. Once they have reconstructed the original column data, they can compute complete commitments and witnesses locally—without needing full global data.

As a result, no single node in the system needs to see the entire dataset. Moreover, since both rows and columns are individually recoverable from 50% of the data, in an ideal peer-to-peer setting, **only 25% of the full extended data** needs to be transmitted over the network. This greatly reduces bandwidth consumption.
