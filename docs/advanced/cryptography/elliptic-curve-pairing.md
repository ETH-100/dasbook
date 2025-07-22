
# Elliptic Curve Pairing

Although Schnorr signatures natively support multi-signatures, they require multiple rounds of communication between participants. This increases communication costs and makes it impractical for complex applications. The reason Schnorr requires multi-round signing is that while it's structurally symmetric, it still relies on random number generation. So, can we find a truly symmetric mathematical structure?

In fact, multiplication already provides the symmetry we need:

$$
3 \cdot (5 + 4) = 3 \cdot 9 = 27
$$

At the same time:
    
$$
3 \cdot (5 + 4) = 3 \cdot 5 + 3 \cdot 4 = 15 + 12 = 27
$$

Now suppose Alice's private key is \$k\$ and the public key is \$P = kG\$, and the message is \$H\$. We define the signature \$S\$ as:

$$
S = kH
$$

To verify the signature, we only need to check whether \$G \cdot S = P \cdot H\$, because:

$$
G \cdot S = G \cdot k \cdot H = P \cdot H
$$

Everything seems perfect. But so far, multiplication on elliptic curves has only been defined between a scalar and a point—what we call scalar multiplication. Multiplication between two points isn’t defined, so we can’t compute \$G \cdot S\$ or \$P \cdot H\$ directly. The good news is that there is a workaround. In fact, we don’t need multiplication itself, just something that satisfies the distributive property. It’s like, in this kingdom, no one knows multiplication, but someone can directly compute \$2^{3 \cdot 9}\$ and it holds that:

$$
2^{3 \cdot (5 + 4)} = 2^{3 \cdot 5} \cdot 2^{3 \cdot 4}
$$

That’s exactly what we need. This kind of mechanism that outputs \$2^{3 \cdot 9}\$ given \$3\$ and \$9\$ is called a **pairing**. Of course, this exponential function doesn’t apply directly to elliptic curves, so we must build a new mathematical kingdom and find a function that satisfies the required properties. Formally, we define pairing as a mapping:

$$
e: G_1 \times G_2 \rightarrow G_T
$$

That satisfies:

$$
e(P + Q, R) = e(P, R) \cdot e(Q, R)
$$

$$
e(P, Q + R) = e(P, Q) \cdot e(P, R)
$$

It must also satisfy **non-degeneracy**, because while \$e(P, Q) = 1\$ satisfies the formulas, it’s useless. Additionally, it must be **computable**.

Roughly speaking, we are not looking for a single, explicitly defined function, but rather a **family of functions**—like not a single hero in our kingdom, but a whole lineage. We can construct such a function from a point \$P\$, for example, by using the tangent at point \$P\$. As \$P\$ changes, so does the function. Then we use point \$Q\$ as the input to the function and compute the final value, denoted:

$$
f_P(Q)
$$

Similarly, we can reverse the roles and evaluate \$f\_Q(P)\$. The mapping function mentioned above:

$$
e(P + Q, R) = e(P, R) \cdot e(Q, R)
$$

Can thus be interpreted as:

$$
f_{P+Q}(R) = f_P(R) \cdot f_Q(R)
$$

## Divisors

Just as every family has its unique rules, we use a mathematical tool called a **divisor**, which represents the skeleton of a function. While we can’t infer someone’s weight from their skeleton, we can know their height and arm span. Since we need to multiply functions, and divisors are well-suited for that, we determine what kind of function family we need to construct by analyzing their divisors.

In this context, a divisor represents the behavior of a function at its zeros and poles (infinities). For example, we denote the divisor of \$f\_P\$ as:

$$
\operatorname{div}(f_P) = (P) + (-P) - 2(O)
$$

This divisor structure means:

* The function has zeros at \$P\$ and \$-P\$
* It has a second-order pole at the point at infinity \$O\$
* No other zeros or poles (degree 0 elsewhere)
* The total degree is 0 (satisfying the principal divisor condition)

Think of it like watching a race car driver—not by reviewing the whole race footage, but by analyzing their start (zero), how they accelerate, when and how they turn, and how they approach the finish line (infinity):

* If a car moves at constant speed: divisor is \$(O)\$
* If it accelerates: divisor is \$2(O)\$
* If the acceleration itself accelerates: \$3(O)\$
* And so on...

That’s how we construct functions using divisors. For example, a function can be written as:

$$
f(x) = \frac{(x - 3)^3}{(x - 7)^2}
$$

* It has a third-order zero at \$x = 3\$
* A second-order pole at \$x = 7\$

We make a change of variable \$t = 1/x\$, so \$x \to \infty\$ becomes \$t \to 0\$, and substitute:

$$
f(x) = \frac{(x - 3)^3}{(x - 7)^2} \sim \frac{1/t^3}{1/t^2} = \frac{1}{t} = t^{-1}
$$

So the function diverges at \$t = 0\$, i.e., \$x \to \infty\$, like \$1/t\$, which clearly has a **pole of order 1**. Thus, the divisor of \$f(x)\$ is:

$$
\operatorname{div}(f) = 3(3) - 2(7) - (O)
$$

Now suppose we multiply \$f(x)\$ by another function \$g(x) = x - 3\$, whose divisor is:

$$
\operatorname{div}(g) = (3) - (O)
$$

Then:

$$
f(x) \cdot g(x) = \frac{(x - 3)^4}{(x - 7)^2}
$$

At infinity:

$$
\frac{(x - 3)^4}{(x - 7)^2} \sim \frac{1/t^4}{1/t^2} = \frac{1}{t^2} = t^{-2}
$$

So the new divisor is:

$$
\operatorname{div}(f \cdot g) = 4(3) - 2(7) - 2(O)
$$

In fact, we can directly **add the divisors**:

$$
\operatorname{div}(f \cdot g) = \operatorname{div}(f) + \operatorname{div}(g) = 3(3) - 2(7) - (O) + (3) - (O) = 4(3) - 2(7) - 2(O)
$$

This is intuitive—multiplying the functions increases the orders of their zeros and poles. Likewise, division of functions corresponds to **subtracting divisors**:

$$
\operatorname{div}\left( \frac{f}{g} \right) = \operatorname{div}(f) - \operatorname{div}(g)
$$


## References

- [Vitalik Buterin：**Exploring Elliptic Curve Pairings**](https://vitalik.eth.limo/general/2017/01/14/exploring_ecp.html)