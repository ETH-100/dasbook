
# Weil Pairing

With the tool of divisors in hand, we are now ready to search for a pairing function. Let’s define an elliptic curve $E(K)$ over a field $K$. In the pairing $e_m(P, Q)$, both points $P$ and $Q$ lie in $E[m]$, i.e.,

$$
mP = mQ = O
$$

As mentioned earlier, we begin by constructing a related family of functions from point $Q$, with a divisor requirement:

$$
\operatorname{div}(f_Q) = m[Q] - m[O]
$$

This means $f_Q$ has a zero of order $m$ at $Q$ and a pole of order $m$ at the point at infinity $O$. This divisor structure is straightforward, tightly bound to point $Q$, and by the **Principal Divisor Theorem**, such a function must exist.

However, we do not use this function directly. Instead, we apply a transformation to the input before feeding it into $f_Q$. This is called function composition, and we denote it as:

$$
f_Q \circ [m](X) := f_Q([m]X)
$$

Since $f$ has a zero of order $m$ at $Q$, the composite function $f \circ [m]$ has zeros at all $X$ satisfying $[m]X = Q$, each with multiplicity $m$. Therefore, the zero part of the divisor of $f \circ [m]$ is:

$$
\sum_{[m]X = Q} m[X]
$$

Similarly, $f \circ [m]$ has poles of order $m$ at all $X$ satisfying $[m]X = O$. The set of all such $X$ mapping to $Q$ under $[m]$ is denoted $[m]^\*Q$ (i.e., the preimage of $Q$ under multiplication-by-$m$).

These preimage points have a remarkable property, and it's the key to why the Weil pairing works. Let’s denote one such point as $Q'$, so that:

$$
[m]Q' = Q
$$

Now, take any $R \in E[m]$, so clearly $[m]R = O$. Then:

$$
[m](Q' + R) = [m]Q' + [m]R = Q + O = Q
$$

Here’s the magic: no matter which $R$ you add to $Q'$, the result is another zero of $f \circ [m]$. That is, every solution to $[m]X = Q$ can be written as $Q' + R$ for some $R \in E[m]$.

Similarly, all $X$ satisfying $[m]X = O$ are just:

$$
\{R \mid R \in E[m]\}
$$

So the full divisor of $f \circ [m]$ can be written as:

$$
\operatorname{div}(f \circ [m]) = \sum_{R \in E[m]} m[Q' + R] - \sum_{R \in E[m]} m[R]
$$

Now, suppose there exists a function $g$ that has simple zeros at each $Q' + R$ and simple poles at each $R$ for $R \in E[m]$. Then the divisor of $g$ is:

$$
\operatorname{div}(g) = \sum_{R \in E[m]} [Q' + R] - \sum_{R \in E[m]} [R]
$$

This means $g$ shifts every point $R$ in $E[m]$ by $Q'$ and introduces a zero at $Q' + R$. You can think of $g$ as a kind of interpolation function between $Q' + R$ and $R$. It’s not hard to see that:

$$
g^m = f_Q \circ [m]
$$

(Up to a multiplicative constant, they are the same function.)

Now we can finally define the **Weil pairing function**. Let $X$ be any point on the elliptic curve. Then:

$$
e_m(P, Q) := \frac{g(X + P)}{g(X)}
$$

That is, evaluate the function $g$ at $X$ and at $X + P$, and take the ratio. Raising this to the $m$-th power:

$$
\left( \frac{g(X + P)}{g(X)} \right)^m = \frac{g^m(X + P)}{g^m(X)} = \frac{f_Q([m](X + P))}{f_Q([m]X)} = \frac{f_Q([m]X)}{f_Q([m]X)} = 1
$$

Since $[m]P = O$, then $[m](X + P) = [m]X$, making numerator and denominator equal. No matter which $X$ you choose, as long as $P$ and $Q$ are fixed, $e_m(P, Q)$ has the same value. This shows that $e_m(P, Q)^m = 1$—it lies in the group of **$m$-th roots of unity**, denoted $\mu_m$.

Formally:

$$
e_m(P, Q):\ E[m] \times E[m] \to \mu_m
$$

The Weil pairing is **bilinear**, which means:

$$
e_m(P + R, Q) = e_m(P, Q) \cdot e_m(R, Q)
$$

Substitute the definition of $g$:

$$
e_m(P + R, Q) = \frac{g_Q(X + P + R)}{g_Q(X)}
$$

Now multiply numerator and denominator by $g_Q(X + P)$:

$$
= \frac{g_Q(X + P + R)}{g_Q(X + P)} \cdot \frac{g_Q(X + P)}{g_Q(X)}
$$

Let $Y = X + P$, then:

$$
= \frac{g_Q(Y + R)}{g_Q(Y)} \cdot \frac{g_Q(X + P)}{g_Q(X)} = e_m(R, Q) \cdot e_m(P, Q)
$$

The other direction, $e_m(P, Q + R) = e_m(P, Q) \cdot e_m(P, R)$, also holds, though the proof is more involved.

Although the original definition of the Weil pairing is elegant and concise, constructing the function $g_Q$ with the appropriate divisor is difficult in practice. Therefore, we often use a more practical alternative:

$$
e_m(P, Q) = \frac{f_P(Q + X)}{f_P(X)} \Big/ \frac{f_Q(P - X)}{f_Q(-X)}
$$

This formula looks different, but is mathematically equivalent. It only requires constructing the functions $f_P$ and $f_Q$, both of which we have already constructed explicitly.
