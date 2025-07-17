# Reed-Solomon Encoding

Reed-Solomon (RS) codes are a core component in data availability (DA) systems. The basic principle is to treat the data as values (or coefficients) of a polynomial and reconstruct the original polynomial via interpolation. As long as enough partial data points are received, the full original data can be recovered. Specifically, if the original data consists of $m$ points and is encoded into $n$ points ($n > m$), then any $k$ ($k \geq m$) of the $n$ points are sufficient to recover the original $m$ data points.

RS encoding operates over a finite field $\mathbb{F}\_q$, typically with $q = 2^m$.

* Original data blocks: $m = k$ elements, viewed as values in $\mathbb{F}\_q$
* Encoded data blocks: $n > k$
* Can tolerate up to $t = \frac{n - k}{2}$ errors, or $n - k$ erasures

## Encoding

1. Suppose the original data is $a\_0, a\_1, ..., a\_{k-1}$

2. Construct the polynomial:

   $$
   f(x) = a_0 + a_1 x + a_2 x^2 + \cdots + a_{k-1} x^{k-1}
   $$

3. Choose $n$ distinct points in the field, $x\_1, ..., x\_n$, and compute their values $f(x\_1), ..., f(x\_n)$, which are used as the encoded output.

## Decoding

To recover the data, only any $k$ points $(x\_i, f(x\_i))$ are needed. The original polynomial $f(x)$ can be reconstructed using Lagrange interpolation.

Lagrange interpolation reconstructs the polynomial by computing basis polynomials $L\_k(x)$ from the known data points. For example, the basis polynomial corresponding to point $(x\_0, y\_0)$ is:

$$
L_0(x) = \frac{(x - x_1)(x - x_2)\cdots(x - x_n)}{(x_0 - x_1)(x_0 - x_2)\cdots(x_0 - x_n)}
$$

The numerator is the product of terms $(x - x\_i)$ for all $x\_i \ne x\_0$, which ensures that $L\_0(x\_i) = 0$ for $i \ne 0$. The denominator is a normalizing factor to ensure $L\_0(x\_0) = 1$. The full polynomial is then reconstructed as:

$$
f(x) = y_0 \cdot L_0(x) + y_1 \cdot L_1(x) + \cdots
$$

If errors are present in the received data, decoding must use error-correction algorithms like Berlekamp-Massey or the Euclidean algorithm. However, in the context of DA, we typically only deal with erasures (missing data), so Lagrange interpolation suffices.

The computational complexity of Lagrange interpolation is $O(n^2)$, but in practice, Fast Fourier Transform (FFT) techniques can reduce this to $O(n \log n)$.

## Example

Let’s work over the finite field $\mathbb{F}\_7 = {0, 1, 2, 3, 4, 5, 6}$.

* Original data: 2 symbols $(a\_0, a\_1) = (3, 4)$
* Encoding goal: Generate 4 encoded points from 2 data points

### Step 1: Construct the Original Polynomial

We represent the original data as a polynomial over $\mathbb{F}\_7$:

$$
f(x) = 3 + 4x \in \mathbb{F}_7[x]
$$

### Step 2: Encode

We evaluate the polynomial at 4 distinct points: $x = 0, 1, 2, 3$

| $x$ | $f(x) = 3 + 4x \mod 7$        |
| ----- | ------------------------------- |
| 0     | $3 + 4 \cdot 0 = 3$           |
| 1     | $3 + 4 \cdot 1 = 7 \equiv 0$  |
| 2     | $3 + 4 \cdot 2 = 11 \equiv 4$ |
| 3     | $3 + 4 \cdot 3 = 15 \equiv 1$ |

So the 4 encoded points are:

$$
(0, 3),\ (1, 0),\ (2, 4),\ (3, 1)
$$

### Step 3: Recover

Suppose we receive only two points:

$$
(1, 0),\ (2, 4)
$$

We use Lagrange interpolation to recover the original polynomial $f(x) = a\_0 + a\_1 x$. Construct:

$$
f(x) = y_1 \cdot L_1(x) + y_2 \cdot L_2(x)
$$

Where:

$$
L_1(x) = \frac{x - x_2}{x_1 - x_2} = \frac{x - 2}{1 - 2} = -(x - 2)
$$

$$
L_2(x) = \frac{x - x_1}{x_2 - x_1} = \frac{x - 1}{2 - 1} = x - 1
$$

Working over $\mathbb{F}\_7$, we simplify:

* $-1 \equiv 6 \pmod{7}$
* $L\_1(x) = 6(x - 2) = 6x - 12 \equiv 6x + 2$
* $L\_2(x) = x - 1$

Substitute into the interpolation formula:

$$
f(x) = 0 \cdot (6x + 2) + 4 \cdot (x - 1) = 4x - 4 \equiv 4x + 3 \pmod{7}
$$

Thus, we recover:

$$
f(x) = 3 + 4x
$$

This matches our original data $a\_0 = 3$, $a\_1 = 4$ — recovery succeeded.
