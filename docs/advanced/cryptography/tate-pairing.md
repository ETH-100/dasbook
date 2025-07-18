

# Tate Pairing

Although the Weil pairing is elegant, it is computationally expensive and has various limitations that reduce its practicality. The Tate pairing follows a similar idea. We first define the divisor of $f_P$:

$$
\operatorname{div}(f_P) = m[P] - m[O]
$$

Next, we construct a function $f_{P+Q}$ using the point $P + Q$, such that:

$$
\operatorname{div}(f_{P+Q}) = m[P+Q] - m[O]
$$

Then we define a composite function $f_P'(x) = f_P(x + Q)$, whose divisor is:

$$
\operatorname{div}(f_P'(x)) = m[P+Q] - m[Q]
$$

Therefore:

$$
\operatorname{div}\left(\frac{f_P'}{f_P}\right) = m[P+Q] - m[Q] - m[P] + m[O]
$$

Now we construct a function $g$ with the following divisor:

$$
\operatorname{div}(g) = [Q] + [P] - 2[O]
$$

Thus, the divisor of $\frac{f_P' \cdot g^m}{f_P}$ becomes:

$$
\operatorname{div}\left(\frac{f_P' \cdot g^m}{f_P}\right) = m[P+Q] - m[Q] - m[P] + m[O] + m[Q] + m[P] - 2m[O]
$$

$$
= m[P+Q] - m[O]
$$

$$
= \operatorname{div}(f_{P+Q})
$$

In summary, we can find a function $g$ such that:

$$
\operatorname{div}(f_{P+Q}) = \operatorname{div}\left(\frac{f_P' \cdot g^m}{f_P}\right)
$$

Congratulations! You've created the Tate pairing. Ignoring the $g^m$ and constant terms, we can now verify bilinearity directly through divisor calculations. Based on what we know, we attempt to express the pairing as:

$$
\hat{e}(P, Q) = \frac{f_P(x + Q)}{f_P(x)}
$$

Now consider:

$$
\hat{e}(P + R, Q) = \frac{f_{P+R}(x + Q)}{f_{P+R}(x)}
$$

From earlier derivations, ignoring $g$ and constants for now:

$$
f_{P+R}(x) = \frac{f_P(x + R)}{f_P(x)}
$$

Substituting in:

$$
\hat{e}(P + R, Q) = \frac{f_P(x + Q + R)}{f_P(x + Q)} \cdot \frac{f_P(x)}{f_P(x + R)} \cdot \left( \frac{g(x + Q)}{g(x)} \right)^m
$$

Which is essentially:

$$
e(P, Q) \cdot e(R, Q)
$$

However, we cannot ignore the function $g$ and constant terms. To address this, we raise the result to a power in an **extension field**, a process known as **final exponentiation**. This step resolves a more fundamental issue: pairings are essentially a kind of multiplication between points, so the result must lie in a field that supports exponentiation.

### Extension Field

To define the pairing completely and unambiguously, and to eliminate constant factors and the influence of $g$, we introduce an extension field $\mathbb{F}_{q^k}$, where $k$ is the **embedding degree** of the curve with respect to $m$—the smallest $k$ such that $m \mid (q^k - 1)$. The Tate pairing is formally defined as:

$$
\tau(P, Q) = f_P(Q)^{(q^k - 1)/m}
$$

Where:

* $f_P$ is a rational function with $\operatorname{div}(f_P) = m[P] - m[O]$;
* $Q \in E[m]$, but the evaluation is only defined when $Q \notin \text{supp}(f_P)$;
* The result lies in a subgroup of order $m$ within the multiplicative group of $\mathbb{F}_{q^k}^*$ (also known as the target group $G_T$);
* The exponent $(q^k - 1)/m$ is known as the **final exponentiation**.

To ensure the pairing result lies in the target group $\mu_m$, we extend the field $\mathbb{F}*q$ to $\mathbb{F}*{q^k}$ such that:

$$
m \mid (q^k - 1)
$$

If $k$ is too small, the result may not lie in the extension field (i.e., no $m$-th roots of unity exist). If $k$ is too large, the computation becomes inefficient. Hence, curve selection must balance both constraints. The minimal such $k$ is the **embedding degree**, which guarantees that $\mu_m \subseteq \mathbb{F}_{q^k}^*$.

Our most familiar example of an extension field is the complex numbers, which extend the real numbers by introducing an imaginary unit to express richer structures. Similarly, we extend a base finite field $\mathbb{F}*q$ (say $q = p$ is prime, containing $q$ elements) to a larger field $\mathbb{F}*{q^k}$, which includes a primitive $m$-th root of unity $\omega$:

$$
\omega^m = 1,\quad \omega \notin \mathbb{F}_q,\quad \omega \in \mathbb{F}_{q^k}
$$

As with adding $i$ to the real numbers, we introduce a root $\omega$ of a previously unsolvable equation into $\mathbb{F}*q$, forming a larger field $\mathbb{F}*{q^k}$. For example, we choose an irreducible degree-$k$ polynomial over $\mathbb{F}_q$, such as $f(x) = x^k - \theta$, which geometrically has no intersection with the original elliptic curve.

We then define an “imaginary unit” $\omega$ satisfying $\omega^k = \theta$. Elements of $\mathbb{F}_{q^k}$ are then expressions of the form:

$$
a_0 + a_1 \omega + a_2 \omega^2 + \dots + a_{k-1} \omega^{k-1}
$$

Where $a_i \in \mathbb{F}_q$. Just like complex numbers of the form $a + bi$, here each element is a linear combination of $k$ elements over $\mathbb{F}_q$, with basis ${1, \omega, \omega^2, \dots, \omega^{k-1}}$. The total number of elements is $q^k$.

Finally:

$$
\mathbb{F}_{q^k} = \mathbb{F}_q[\omega] = \mathbb{F}_q[x]/(f(x))
$$

By Fermat’s Little Theorem, any element in $\mathbb{F}*{q^k}$ satisfies $x^{q^k - 1} = 1$. To eliminate the effect of $g$ and all constant terms, and to ensure the result lies in $\mathbb{F}*{q^k}$, we raise the result to the power of $(q^k - 1)/m$. The final version of the Tate pairing is:

$$
\hat{e}_m(P, Q) := \left( \frac{f_P(Q + X)}{f_P(X)} \right)^{(q^k - 1)/m}
$$

Congratulations—you’ve now invented the complete Tate pairing. But there’s one last critical question: **how can we compute it efficiently?** Without efficient computation, everything else is meaningless.
