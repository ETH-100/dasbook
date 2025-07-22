# Elliptic Curve Cryptography

::: tip
This content was greatly inspired by [**Elliptic Curve Cryptography: a gentle introduction**](https://andrea.corbellini.name/2015/05/17/elliptic-curve-cryptography-a-gentle-introduction/). The original article includes some helpful animations to aid understanding — we recommend reading it alongside this text.
:::

Cryptography is built on the principle of **easy encryption and hard decryption**. Elliptic curve cryptography originates from a seemingly simple multiplication:

$$
P = hG
$$

That is, $P$ is the product of $h$ and $G$. This may seem unremarkable—we perform multiplication and division on calculators all the time. But can we make multiplication easy, while division is hard? Given $h$ and $G$, computing $P$ is straightforward. However, given $P$ and $G$, finding $h$ is believed to be computationally infeasible.

## Elliptic Curves

Let’s “invent” such a mathematics. It’s a self-contained kingdom with its own understanding of “numbers” and “addition.” The “numbers” here are special points that must satisfy a certain condition:

$$
y^2 = x^3 + ax + b
$$

These points can be visualized geometrically—forming what looks like an ellipse:

![image.png](/en/ecc1.png)

Observing this curve, we can notice a few features:

1. It is symmetric with respect to the x-axis.
2. A straight line connecting two points on the curve intersects it at a third point.

These features are useful, as they help us define addition:

* To compute $A + B$, draw a line through points $A$ and $B$;
* The line intersects the curve at a third point $C$.

With these three elements, we can define addition as: $A + B = C$. Since $A$ and $B$ lie on the same line, we also get **commutativity**: $A + B = B + A$. But then $C$ is also on the same line, so $B + C = A$ and $A + C = B$. Clearly, this leads to contradictions unless all three are zero. Our mathematical kingdom collapses before it begins.

To resolve this, we reflect point $C$ over the x-axis to get point $R$, and define:

$$
R = A + B
$$

![image.png](/en/ecc2.png)

This reflection of $C$ carries deeper meaning. The line connecting $R$ and $C$ is vertical and intersects the curve at a point at infinity. We define this **point at infinity** as the **identity element** $O$, such that $C + R = 0$, and hence $A + B + C = 0$.

There’s also a special case when $A = B$, meaning we’re taking a **tangent** at that point. We get $A + A = R$, and drawing a line through $R$ and $A$ again gives $A + A + A$, or:

$$
hA = \underbrace{A + A + \cdots + A}_{h}
$$

This is similar to ordinary multiplication, but here it's defined geometrically using point addition. The “division” would mean solving $P = hA$ for $h$—easy for regular integers, but “hard” on elliptic curves.

In summary, we've defined a set of "numbers" and their addition and multiplication operations with specific properties. Congratulations—you've just invented an important mathematical abstraction: a **group**.

## Groups

Formally, a group must satisfy four properties:

* **Closure**: The sum of any two elements in the group remains in the group;
* **Associativity**: $(a + b) + c = a + (b + c)$;
* **Identity element**: There exists a "zero point" $O$ such that $a + O = a$;
* **Inverse element**: For every $a$, there exists $-a$ such that $a + (-a) = O$.

All points satisfying the elliptic curve equation (including $O$) form a group under the point addition defined above. If this group satisfies **commutativity** ($a + b = b + a$), it's called an **Abelian group**, and elliptic curve groups are indeed Abelian.

So far we've defined curves over the real numbers:

$$
E(\mathbb{R}):\quad y^2 = x^3 + ax + b,\quad a, b \in \mathbb{R},\quad 4a^3 + 27b^2 \ne 0
$$

The condition $4a^3 + 27b^2 \ne 0$ ensures the curve is **smooth**, avoiding cusps or self-intersections.

But real numbers are inconvenient in practice. Integers might also be too large. In cryptography, we work over **finite fields** using **modular arithmetic**. For example:

$$
E: y^2 = x^3 + ax + b \mod p
$$

This “clock arithmetic” ensures all values are constrained between $0$ and $p - 1$. This finite field is denoted as $\mathbb{F}_p$. The curve is no longer smooth, but consists of **discrete points**.

Despite rounding and modulo operations, $\mathbb{F}_p$ still satisfies group properties. Hence, this is a legitimate mathematical kingdom:

$$
E(\mathbb{F}_p):\quad y^2 \equiv x^3 + ax + b \pmod{p},\quad a, b \in \mathbb{F}_p,\quad 4a^3 + 27b^2 \not\equiv 0 \pmod{p}
$$

In the real-number case, multiplication still leaks structural clues. But in $\mathbb{F}_p$, **finding $h$ from $P = hG$ is truly hard**—this is the **elliptic curve discrete logarithm problem (ECDLP)**. Now, back to our original intention:

$$
P = hG
$$

Given $h$ and $G$, we can compute $P$ by adding $G$ $h$ times. But for large $h$ (e.g., $2^{256}$), this is computationally expensive. Fortunately, we have optimizations like:

* **Double-and-add algorithm**
* **Sliding window (wNAF)**

For example, using double-and-add, we can compute $13G$ in logarithmic steps:

1. $2G = G + G$
2. $3G = 2G + G$
3. $6G = 3G + 3G$
4. $12G = 6G + 6G$
5. $13G = 12G + G$

Now we have **easy multiplication** and **hard division**. We just need to select a curve and a base point. But since $\mathbb{F}_p$ is finite, poor choices can be insecure. So what kind of curve and point should we choose?

## Order

For a given elliptic curve, we can compute the number of points (the **group order**), though exhaustively enumerating is impractical. Fortunately, **Schoof's algorithm** allows efficient computation.

Given a point $P$, how many distinct results can $hP$ produce? Let’s explore this on:

$$
E: y^2 \equiv x^3 + x + 1 \mod 5
$$

Pick a point:

$$
P = (0,1)
$$

Now compute successive multiples:

* $P = (0,1)$
* $2P = (4,2)$
* $3P = (2,1)$
* $4P = (3,4)$
* $5P = (3,1)$
* $6P = (2,4)$
* $7P = (4,3)$
* $8P = (0,4)$
* $9P = O$
* $10P = P$

At $9P$, we return to the identity $O$, meaning the results **cycle**. So all values of $kP$ satisfy:

$$
kP = (k \mod 9)P
$$

This holds for all points on the curve. Since there are finitely many $hP$, but infinitely many $h \in \mathbb{Z}^+$, there must exist $h_1 \ne h_2$ such that $h_1P = h_2P$, i.e.:

$$
(h_1 - h_2)P = O
$$

Thus, for some smallest $n$, we have:

$$
nP = O
$$

and $kP$ becomes **cyclic**. The smallest such $n$ is the **order** of point $P$.

By **Lagrange's theorem**, the order of any subgroup divides the order of the full group. That is, if $G$ has order $N$, and a subgroup has order $n$, then:

$$
n \mid N
$$

Let $H \subset G$ be a subgroup, and $g \in G \setminus H$. Then:

$$
g + H := \{ g + h \mid h \in H \}
$$

Each **coset** $g + H$ is disjoint, and since $O \in H$, $g \in g + H$.

![image.png](/en/gh.png)

If Lagrange’s theorem didn’t hold, we would have leftover elements, contradicting group closure. Hence, the group can be partitioned into disjoint cosets of size $n$.

Now we just need to choose a curve with large order $N$ and a large factor $n$. How do we find a point of order $n$?

## Finding the Base Point

We use the **cofactor method**. Let the curve have order $N$, and we want a subgroup of prime order $n$. Define the **cofactor**:

$$
h = \frac{N}{n}
$$

Randomly select a point $P$ on the curve, and compute:

$$
G = hP
$$

This $G$ is likely to be a point of order $n$:

$$
nG = nhP = NP = O
$$

Unless $G = O$, in which case retry with a new $P$. Also, $n$ should be a **prime** to avoid factorization issues and because prime-order subgroups are needed in cryptographic applications.

## Summary

We’ve built our mathematical kingdom:

1. Choose a secure elliptic curve;
2. Use Schoof’s algorithm to compute the group order $N$;
3. Select a prime order $n$;
4. Compute cofactor $h = N / n$;
5. Pick a random point $P$ and compute $G = hP$;
6. If $G \ne O$, it is the base point. Use it to build cryptographic systems.

Now, with base point $G$, we can generate **key pairs**, perform **public-key encryption**, and **digital signatures**. This is the foundation of **modern elliptic curve cryptography**.

## References

- [**A (Relatively Easy To Understand) Primer on Elliptic Curve Cryptography**](https://blog.cloudflare.com/a-relatively-easy-to-understand-primer-on-elliptic-curve-cryptography)
- [**Elliptic Curve Cryptography: a gentle introduction** – Andrea Corbellini](https://andrea.corbellini.name/2015/05/17/elliptic-curve-cryptography-a-gentle-introduction/)
- [**SEC 2: Recommended Elliptic Curve Domain Parameters** (SECG)](https://www.secg.org/sec2-v2.pdf)
- [**OpenSSL ECC Tutorial**](https://wiki.openssl.org/index.php/Elliptic_Curve_Cryptography)