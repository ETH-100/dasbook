# Tate 配对

Weil 配对虽然很优雅，当计算相当麻烦，还有其他诸多使得实用性降低。Tate 配对的思路与其类似，我们首先确定 $f_P$ 的除子：

$$
div(f_P)=m[P]−m[O]
$$

并利用椭圆曲线上点 $P+Q$ 构造函数 $f_{P+Q}$ 使其除子为

$$
div(f_{P+Q})=m[P+Q]−m[O]
$$

接着我们构造一个复合函数 $f_P'(x)=f_P(x+Q)$，其除子为：

$$
div(f_P'(x))=m[P+Q]−m[Q]
$$

因此：

$$
div(\frac{f_P'}{f_P})=m[P+Q]−m[Q]-m[P]+m[O]
$$

我们可以构造一个函数 $g$ 使其除子为：

$$
div(g)=[Q]+[P]-2[O]
$$

因此 $\frac{f_P'g^m}{f_P}$ 的除子为：

$$
div(\frac{f_P'\cdot g^m}{f_P})=m[P+Q]−m[Q]-m[P]+m[O]+m[Q]+m[P]-2m[O]
$$

$$
=m[P+Q]-m[O]
$$

$$
=div(f_{P+Q})
$$

总结一下，我们可以找到这样一个函数 $g$，使得：

$$
div(f_{P+Q}) = div(\frac{f_P' \cdot g^m}{f_P})
$$

恭喜你，你创造了 Tate 配对，在不考虑 $g^m$ 和常数的情况下，我们现在就可以通过除子计算来验证双线性。运用我们目前所知，可以试着将配对表示如下：

$$
\hat{e}(P, Q) = \frac{f_P(x+Q)}{f_P(x)}
$$

我们需要考量：

$$
\hat{e}(P+R, Q) = \frac{f_{P+R}(x+Q)}{f_{P+R}(x)}
$$

根据我们前面的推导，我们暂不考虑 $g$ 和常数的影响：

$$
f_{P+R}(x) = \frac{f_P(x+R) }{f_P(x)}
$$

代入后得到：

$$
\hat{e}(P+R, Q) = \frac{f_{P+R}(x+Q)}{f_{P+R}(x)} = {\frac{f_P(x+Q+R)}{f_P(x+Q)} }\Big/{\frac{f_P(x+R)}{f_P(x)}}
$$

$$
= \left( \frac{f_P(x+Q+R)}{f_P(x+Q)} \cdot \frac{f_P(x)}{f_P(x+R)} \right) \cdot \left( \frac{g(x+Q)}{g(x)} \right)^m
$$

这实际上就是：

$$
e(P,Q)⋅e(R,Q)
$$

然而，我们并不能忽略 $g$ 函数和常数项，通过将函数压入到扩展域可以解决这个问题，这个步骤被称为最终指数化。这个步骤实际上是为了解决另一个更为根本的问题：椭圆曲线配对本质上是形成一种点和点的乘法，因此结果最终落入的域需要支持幂运算。

### 扩展域

为了得到一个完全定义良好、值唯一、并消除常数项和 $g$ 函数影响的配对函数，我们引入扩展域 $\mathbb{F}_{q^k}$，其中 $k$ 是椭圆曲线相对于 $m$ 的嵌入度（即最小的 $k$ 使得 $m \mid q^k - 1$）。Tate 配对正式定义为：

$$
\tau(P, Q) = f_P(Q)^{(q^k - 1)/m}
$$

其中：

- $f_P$ 是一个有理函数，满足 $\text{div}(f_P) = m[P] - m[O]$；
- $Q \in E[m]$，但我们只在 $Q \notin \text{supp}(f_P)$ 的情况下取值；
- 取值在有限域 $\mathbb{F}_{q^k}^*$ 中的一个 $m$ 阶子群（也称为目标群 $G_T$）；
- 这个幂次 $(q^k - 1)/m$ 被称为最终压入（final exponentiation）。

为了让配对值落入目标群 $\mu_m$，我们引入一个扩展域 $F_{q^k}$，其中 $k$ 满足：

$$
m \mid (q^k - 1)
$$

如果 $k$ 过小，则结果则不一定存在于扩展域中，因为不存在 $m$ 阶单位根，而过大又不方便计算，所以在选择曲线时我们需要重新考量。这个最小的 $k$ 被称为嵌入度（embedding degree），它保证 $F_{q^k}$ 中存在 $m$ 阶单位根，从而 $\mu_m \subseteq F_{q^k}^*$。

我们最熟悉的扩展域是复数，通过人为地在实数的基础上添加一个原本不存在的数，从而扩大原本数域，以表达更丰富的内容。与复数类似，我们原本的有限域是 $\mathbb{F}_q$ ，比如 $q = p$ 是一个素数，包含了 $q$ 个元素。如果我们需要计算某个 $m$ 阶单位根 $\omega$（使得 $\omega^m = 1$），而 $\mathbb{F}q$ **中并没有这样的元素，这时我们需要引入一个扩展域 $\mathbb{F}{q^k}$，满足：

$$
\omega^m = 1,\quad \omega \notin \mathbb{F}_q,\quad \omega \in \mathbb{F}_{q^k}
$$

与 $i$ 加入实数域类似，我们将某个不可解的方程的根 $\omega$ 加入 $\mathbb{F}q$*，*构造了一个更大的域 $\mathbb{F}{q^k}$。我们找一个在 $\mathbb{F}_q$ 上不可约的 $k$ 次多项式，例如 $f(x) = x^k - \theta$ ，在几何上这个曲线和原本的椭圆曲线没有交点。接下来我们就可以定义一个“虚数单位”  $\omega$，满足 $\omega^k = \theta$ 。它的成员将是这样的形式：

$$
a_0 + a_1 \omega + a_2 \omega^2 + \dots + a_{k-1} \omega^{k-1}
$$

其中 $a_i \in \mathbb{F}_q$，如同复数的 $a + bi$ 的形式一样，这里每个元素是 $k$ 个 $\mathbb{F}_q$ 元素的线性组合，基底是 ${1, w, w^2, \dots, w^{k-1}}$。很明显，成员数量一共为 $q^k$ 个。最终：

$$
\mathbb{F}_{q^k} = \mathbb{F}_q[w] = \mathbb{F}_q[x]/(f(x))
$$

根据费马小定理可知， $\mathbb{F}{q^k}$ 中元素的 $q^k - 1$ 总是为 $1$ ，为了消除了 $g$ 函数和所有常数干扰项，并把值压入到 $\mathbb{F}{q^k}$ 中，我们把结果提升为 $e^{(q^k - 1)/m}$，最终版本的 Tate 配对为：

$$
\hat{e}_m(P, Q) := \left(\frac{f_P(Q+X)}{f_P(X)}\right)^{(q^k - 1)/m}
$$

恭喜你，你完整地发明了 Tate 算法。但还有一个终极问题，我们该怎么高效地计算它，如果不具备可计算性，则一切都失去意义。

## 参考

- [“The Tate Pairing” – Stanford PBC Library](https://crypto.stanford.edu/pbc/notes/ep/tate.html)