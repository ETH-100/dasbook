
# Miller's Algorithm

Miller's algorithm is similar to the previously mentioned **double-and-add** method. Instead of computing all products step by step, it proceeds by doubling, reducing complexity to logarithmic scale. However, Miller's algorithm deals with **functions**, not concrete values. This requires additional techniques: although we cannot explicitly write out a function’s formula, we can iteratively approximate the final result.

Now we want to compute the function:

$$
f_P(Q + X)/f_P(X)
$$

Here, $f_P$ is a rational function whose explicit expression we don’t know, but we know its divisor is $\text{div}(f_P) = m[P] - m[O]$. We can iteratively multiply by a function $\ell$, each time increasing the order at $[P]$ and $[O]$ by one. Specifically, the divisor of each intermediate function $f_i$ satisfies:

$$
\operatorname{div}(f_i) = i[P] - [iP] - (i - 1)[O]
$$

We use the point $T = iP$ obtained at each iteration, along with $P$ itself, to construct the next $f_i$. This process can be interpreted geometrically:

**Addition Step**

![image.png](/zh/miller1.png)

$$
f_{i+1} = f_i \cdot g_{T,P} / g_{T+P}
$$

Where:

* $g_{T,P}$ is the line through points $T$ and $P$
* $g_{T+P}$ is the vertical line through $T + P$

Their respective divisors are:

$$
\operatorname{div}(g_{T,P}) = [T] + [P] + [- (T + P)] - 3[O]
$$

$$
\operatorname{div}(g_{T+P}) = [T + P] + [- (T + P)] - 2[O]
$$

So the divisor of their ratio is:

$$
\operatorname{div}(g_{T+P}/g_{T,P}) = [T] + [P] - [T + P] - [O]
$$

Now let’s verify the updated divisor after one iteration:

$$
\operatorname{div}(f_{i+1}) = i[P] - [T] - (i - 1)[O] + [T] + [P] - [T + P] - [O]
$$

$$
= (i + 1)[P] - [T + P] - i[O]
$$

Which confirms the correctness.

**Doubling Step**

![image.png](/zh/miller2.png)

$$
f_{i+1} = f_i \cdot g_{T,T} / g_{2T}
$$

Where:

* $g_{T,T}$ is the tangent line at point $T$
* $g_{2T}$ is the vertical line through $2T$

Their divisors are:

$$
\operatorname{div}(g_{T,T}) = 2[T] + [-2T] - 3[O]
$$

$$
\operatorname{div}(g_{2T}) = [2T] + [-2T] - 2[O]
$$

Thus:

$$
\operatorname{div}(g_{T+T} / g_{2T}) = 2[T] - [2T] - [O]
$$

Now verify the new divisor after the doubling:

$$
\operatorname{div}(f_{2i}) = 2i[P] - 2[iP] - 2(i - 1)[O] + 2[T] - [2T] - [O]
$$

$$
= 2i[P] - (2i - 1)[O] - [2T]
$$

Which also checks out.

When we reach $i = m$, we get $iP = mP = O$, and the final function is:

$$
f_m = m[P] - m[O]
$$

—at which point the iteration stops. Here's a summary of the steps:

1. Construct the next function $f_i$
2. Evaluate the line function $\ell(x, y) = y - y_T - \lambda(x - x_T)$ at point $Q$ (i.e., substitute $Q$ into the function)
3. Multiply the evaluated result into the accumulated pairing value
4. Continue the next iteration until complete

While the **Tate pairing** benefits greatly from Miller’s algorithm by reducing computational cost, it is still expensive. For a 256-bit computation (e.g., $2^{256}$), we need 256 iterations. In practice, we often use the **Ate pairing**, which brings the complexity down to just a few iterations.
