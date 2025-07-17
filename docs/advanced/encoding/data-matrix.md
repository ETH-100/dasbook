# Data Matrix Encoding

## 1D Extension

![image.png](/en/1d.png)

To introduce redundancy and enable data availability sampling, a simple approach is to treat the original data as a one-dimensional array and divide it into rows. Each row is then independently encoded: we treat \$n\$ original values as evaluations of a polynomial, extend it by interpolation over a larger domain, and produce \$2n\$ encoded points. The encoded data can be recovered from any \$n\$ of these \$2n\$ points. Reed-Solomon encoding is a classical example of this method.

However, if more than half the data in a row is lost or corrupted, the row becomes unrecoverable. To hide a single data point, an adversary must corrupt at least 50% of the row. This gives 1D encoding some fault tolerance, but since rows are encoded independently, sampling only reflects the availability of individual rows, not the dataset as a whole.

## 2D Extension

In 2D extension, the original data is arranged as an \$m \times n\$ matrix. First, each row is extended to form a \$2m \times n\$ matrix; then each column is extended to produce a \$2m \times 2n\$ matrix. This yields a dataset four times the original size. Each cell in the 2D matrix gains redundancy from both row and column directions, allowing for recovery in either axis.

![image.png](/en/2d.png)

### Sampling Efficiency

To hide a single original data point in a 2D matrix, an adversary must corrupt at least 25% of the data. Compared to 1D extension, 2D encoding introduces correlation across rows and columns. Sampling reflects the availability of the entire dataset, not just one dimension. Although the data size increases, the sampling efficiency improves.

We can estimate the required number of samples. Suppose an attacker corrupts more than 25% of the data, rendering the matrix unrecoverable. The worst-case probability that a random sample hits a corrupted cell is at least \$0.25\$. Then, the probability that \$k\$ independent samples all miss corrupted cells is:

$$
P_{\text{undetected}} \le (1 - 0.25)^k = 0.75^k
$$

To ensure that the undetected failure probability is less than \$10^{-9}\$, we solve:

$$
0.75^k < 10^{-9}
\quad \Rightarrow \quad
k > \frac{\log(10^{-9})}{\log(0.75)} \approx 73
$$

So, by randomly sampling about \$73\$ cells, a sampling node can detect with more than \$99.9999999%\$ confidence whether 25% of the matrix has been corrupted. This required sample size is constant—it does not depend on the size of the dataset. This constant complexity is one of the elegant properties of DAS.

### Linearity of Extension

2D extension raises an interesting question. There are two ways to perform the extension:

1. First extend rows, then extend columns.
2. First extend columns, then extend rows.

Are the final matrices from both approaches the same?

\[Intuition illustration: two extension orders]

Intuitively, they should be equal—and indeed they are. This is due to the linearity of the extension. In fact, KZG commitments and proofs can also be viewed as a form of linear extension. While this can be proven via matrix theory or multidimensional interpolation, we can illustrate it here using simple Lagrange interpolation.

The key idea is this: given a set of \$x\_0, ..., x\_{m-1}\$ and corresponding values \$f\_0, ..., f\_{m-1}\$, the Lagrange interpolation at \$x\$ is:

$$
I(x) = \sum_{j=0}^{m-1} f_j \cdot \ell_j(x)
$$

where the Lagrange basis polynomials are:

$$
\ell_j(x) = \prod_{k \ne j} \frac{x - x_k}{x_j - x_k}
$$

Now consider interpolating in two different orders.

First, interpolate columns, then rows:

$$
f_i(x) = \sum_{j=0}^{m-1} a_{i,j} \cdot \ell_j(x)
\quad \Rightarrow \quad
r_i = f_i(x')
$$

Then interpolate the \$r\_i\$ values along \$y\$:

$$
a^{(1)}_{i',j'} = \sum_{i=0}^{n-1} \left( \sum_{j=0}^{m-1} a_{i,j} \cdot \ell_j(x') \right) \cdot L_i(y')
$$

Alternatively, first interpolate rows, then columns:

$$
g_j(y) = \sum_{i=0}^{n-1} a_{i,j} \cdot L_i(y)
\quad \Rightarrow \quad
c_j = g_j(y')
$$

Then interpolate \$c\_j\$ along \$x\$:

$$
a^{(2)}_{i',j'} = \sum_{j=0}^{m-1} \left( \sum_{i=0}^{n-1} a_{i,j} \cdot L_i(y') \right) \cdot \ell_j(x')
$$

Now compare the two results:

$$
\sum_{i=0}^{n-1} \sum_{j=0}^{m-1} a_{i,j} \cdot \ell_j(x') \cdot L_i(y')
\quad \text{vs.} \quad
\sum_{j=0}^{m-1} \sum_{i=0}^{n-1} a_{i,j} \cdot L_i(y') \cdot \ell_j(x')
$$

Clearly, the expressions are equivalent due to the commutativity of summation and multiplication. While FFT-based methods are used in practice instead of Lagrange interpolation, the results are identical due to linearity.

## 1.5D Extension

![image.png](/en/1_5d.png)

In addition to 1D and 2D, there are hybrid approaches referred to as “1.5D” extensions. For example, the data may be extended only in the row direction, but polynomial commitments are applied in both row and column directions. These methods offer interesting trade-offs and are being actively explored.
