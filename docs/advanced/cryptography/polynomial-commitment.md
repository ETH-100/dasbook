# Polynomial Commitment

As previously mentioned, using Merkle proofs in data availability introduces a security issue: malicious transactions can be hidden. This is because a Merkle proof only binds individual data elements, not the entire polynomial. This allows individual data points to be altered without detection. Polynomial commitments solve this problem by binding the entire polynomial.

We represent a polynomial in the following form:

$$
f(x) = a_0 x^0 + a_1 x^1 + a_2 x^2 + \dots + a_n x^n
$$

As usual, we first generate a secret value $s$, and compute the result of plugging $s$ into $f(x)$. The result, when multiplied by a base point in group $G_1$, becomes the commitment to the entire polynomial:

$$
C = \text{Commit}(f) = f(s) \cdot G_1
$$

However, in KZG commitments, we cannot fully eliminate knowledge of $s$, but we can precompute $s^i \cdot G_1$ and $s^i \cdot G_2$, and then securely destroy $s$ to ensure no one knows its value. This process is known as a **trusted setup**. Ultimately, we publicly obtain values such as:

$$
[s^0 \cdot G_1, s^1 \cdot G_1, s^2 \cdot G_1, \dots]
$$

$$
[s^0 \cdot G_2, s^1 \cdot G_2, s^2 \cdot G_2, \dots]
$$

To compute a specific commitment $C$, we only need to substitute the polynomial's coefficients. Clearly, no matter what $f(x)$ is, the resulting $C$ is always a point on the elliptic curve. For every point $(x_i, y_i)$, a proof can be generated. The verifier only needs the commitment $C$ to check whether $(x_i, y_i)$ is a valid evaluation.

To prove that $f(z) = y$, we need knowledge of the full polynomial so we can construct the quotient polynomial:

$$
q(x) = \frac{g(x)}{x - z}
$$

where $g(x) = f(x) - f(z)$. This uses **polynomial division**, which is similar to rational division. It has a quotient and a remainder:

$$
g(x) = q(x)(x - z) + r
$$

Substituting $x = z$ yields:

$$
r = 0
$$

We then generate the proof:

$$
\pi = q(s) \cdot G_1
$$

By providing the original point $(x_i, y_i)$, the commitment $C$, and the proof $\pi$, one can verify using elliptic curve pairings:

$$
e(C - y_i \cdot G_1, G_2) = e(\pi, s \cdot G_2 - x_i \cdot G_2)
$$

To verify the correctness of KZG, we substitute the secret $s$:

$$
f(s) - f(z) = q(s)(s - z)
$$

Therefore:

$$
[f(s) - f(z)] \cdot G_1 = [q(s)(s - z)] \cdot G_1
$$

$$
f(s) \cdot G_1 - f(z) \cdot G_1 = q(s) \cdot G_1 \cdot (s - z)
$$

Since $f(s) \cdot G_1 - f(z) \cdot G_1 = C - y_i \cdot G_1$, we use pairings for the final step:

$$
e(C - y_i \cdot G_1, G_2) = e(q(s) \cdot G_1 \cdot (s - x_i), G_2)
$$

$$
= e(q(s) \cdot G_1, (s - x_i) \cdot G_2)
$$

$$
= e(\pi, s \cdot G_2 - x_i \cdot G_2)
$$

Verification succeeds.

---

## Example

Let’s walk through an actual example of the full KZG commitment flow using the polynomial:

$$
f(x) = 2x^2 + 3x + 1
$$

### Generating the Commitment

$$
C = 2 \cdot s^2 \cdot G_1 + 3 \cdot s \cdot G_1 + G_1
$$

Here, $s^2 \cdot G_1$ and $s \cdot G_1$ are precomputed public values.

### Generating the Proof

Pick a point $x_i = 1$ and evaluate:

$$
f(1) = 2(1)^2 + 3(1) + 1 = 6
$$

We want to prove:

$$
f(1) = 6
$$

without revealing the full polynomial. Construct:

$$
g(x) = f(x) - 6 = 2x^2 + 3x + 1 - 6 = 2x^2 + 3x - 5
$$

Now divide $g(x) = 2x^2 + 3x - 5$ by $(x - 1)$ using polynomial division. Here's a manual calculation:

```text
         2x + 5
       ------------
x - 1 | 2x^2 + 3x - 5
        - (2x^2 - 2x)
        -------------
               5x - 5
           - (5x - 5)
           -----------
                    0
```

So we get:

$$
q(x) = 2x + 5
$$

The proof is then:

$$
\pi = 2 \cdot s \cdot G_1 + 5 \cdot G_1
$$

Finally, publish the original point $(1, 6)$, the commitment $C$, and the proof $\pi$, and verification can proceed.

---

## Batch Proof

KZG commitments not only support single-point proofs but also allow a **single proof for multiple points**. That is, a single group element can prove that multiple points $(x_0, y_0), (x_1, y_1), \dots, (x_k, y_k)$ are valid evaluations of the polynomial $f(x)$.

First, construct an **interpolation polynomial** $i(x)$ such that:

$$
i(x_j) = y_j \quad \text{for all } j \in \{0, 1, \dots, k\}
$$

This can be done via Lagrange interpolation. The degree of $i(x)$ is strictly less than $k$. Then construct the quotient polynomial:

$$
q(x) = \frac{g(x)}{z(x)}
$$

Where $g(x) = f(x) - i(x)$, and $z(x)$ is the **zero polynomial**:

$$
z(x) = (x - x_0)(x - x_1)\dots(x - x_k)
$$

Here, $g(x)$ is divisible by $z(x)$, because at each $x_j$, $f(x_j) = i(x_j)$, so $g(x_j) = 0$ and $z(x_j) = 0$. As in the single-point case, we conclude $r = 0$.

Now commit to $q(s)$:

$$
\pi = q(s) \cdot G_1
$$

This $\pi$ is the **batch proof** for KZG. The prover then reveals:

* $(x_0, y_0), (x_1, y_1), \dots, (x_k, y_k)$
* The proof $\pi$
* The commitment $C$

The verifier holds:

* The commitment $C = f(s) \cdot G_1$
* The interpolation polynomial $i(x)$ (reconstructed from the data points)
* The zero polynomial $z(x)$ (from the same points)
* The proof $\pi = q(s) \cdot G_1$

The verifier computes:

* $i(s) \cdot G_1$
* $z(s) \cdot G_2$

Then verifies using pairing:

$$
e(C - i(s) \cdot G_1, G_2) \stackrel{?}{=} e(\pi, z(s) \cdot G_2)
$$

If it holds, all point evaluations are valid and consistent with the committed polynomial.

---

In practice, we use a more efficient scheme called [aSVC (Aggregatable Subvector Commitment)](https://alinush.github.io/2020/05/06/aggregatable-subvector-commitments-for-stateless-cryptocurrencies.html#constant-sized-i-subvector-proofs), which enables **batch proofs that support individual queries**. This is particularly useful in **data availability** settings, where it greatly reduces bandwidth and storage overhead.
