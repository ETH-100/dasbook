# 分布式构建

在 2D 数据矩阵中，原始数据由交易发起者提交，最终通过行方向和列方向的扩展形成。天真的方案是由一个构建者，获取所有数据并在确定所有交易顺序后，进行扩展形成 2D 矩阵，并对扩展后的行生成承诺和见证。但如此一来将提高对构建者的要求，增加了中心化程度，并且这将成为系统瓶颈。

实际上我们可以利用 KZG 承诺的同态性，即可在无需列扩展数据的基础上，直接生成新的承诺和见证。

![image.png](/zh/decentralized-building.png)

## 基本原理

我们首先回顾一下 KZG 承诺： $f(X), g(X)$ 为定义在有限域 $\mathbb{F}_q$ 上的两个多项式，最大次数为 $< d$，它们的 KZG 承诺分别为：

- $C_f = \text{comm}(f) = f(s) \cdot G$
- $C_g = \text{comm}(g) = g(s) \cdot G$

其中：

- $s$ 是一个设置阶段中选定的秘密（SRS）
- $G$ 是椭圆曲线上的生成元

那么对于多项式加法 $h(X) = f(X) + g(X)$，我们有：

$$
C_h = \text{comm}(h) = h(s) \cdot G = (f(s) + g(s)) \cdot G = f(s)\cdot G + g(s)\cdot G = C_f + C_g
$$

这表明 KZG 承诺具备加法同态性：

$$
\text{comm}(f + g) = \text{comm}(f) + \text{comm}(g)
$$

这可以轻松扩展到标量乘法中，对于标量乘法 $h(X) = a \cdot f(X)$，有：

$$
\text{comm}(a \cdot f) = (a \cdot f(s)) \cdot G = a \cdot (f(s) \cdot G) = a \cdot \text{comm}(f)
$$

$$
\text{comm}(af + bg) = a \cdot \text{comm}(f) + b \cdot \text{comm}(g)
$$

我们可以将承诺视为多项式在 $s$ 的评估，之后进行的线性扩展。正如同在数据矩阵中描述的一样，我们可以在列方向上扩展，其结果与行方向上扩展一致。因此我们可以对承诺向量 ****$C_1, \dots, C_n$ ****本身进行拉格朗日插值扩展，其结果对应于扩展数据的承诺（即 $C_{n+1}, \dots, C_{2n}$）。

对于见证来说同样如此。我们先回顾一下见证的定义：

$$
W_{i,j} = \frac{f_i(\tau) - f_i(\omega^j)}{\tau - \omega^j} \cdot G
$$

其中， $f_i(\tau)$ 是承诺中已有的值，$f_i(\omega^j)$ 是数据 $D_i[j]$，所以整个表达式是线性于 $f_i$ 的。也就是说，我们可以把这个表达式视为一个线性函数作用于 $f_i$：

$$
\phi_j(f_i) := \frac{f_i(\tau) - f_i(\omega^j)}{\tau - \omega^j}

$$

可以简化为如下表示：

$$
W_{i,j} = \phi_j(f_i) \cdot G
$$

我们对每列 $j$ 的 $W_{i,j}$ 做 “in-the-exponent interpolation”：

$$
W_{n+1,j} = \sum_{k=1}^n \lambda_k \cdot W_{k,j} = \sum_{k=1}^n \lambda_k \cdot \phi_j(f_k) \cdot G = \phi_j\left( \sum_{k=1}^n \lambda_k f_k \right) \cdot G
$$

而 $\sum \lambda_k f_k$ 恰好是列 $j$ 上的 $D_1[j], \dots, D_n[j]$ 的拉格朗日插值所得到的列多项式 $f^{\text{col}}(X)$ 的扩展点 $f^{\text{col}}_{n+1}$ 。

因此：

$$
W_{n+1,j} = \phi_j(f^{\text{col}}_{n+1}) \cdot G = \text{KZG 见证 for } D_{n+1}[j]
$$

即我们在指数域中对 $W_{1,j},\dots,W_{n,j}$ 进行线性插值扩展，可以得到合法的 $D_{n+1}[j]$ 的 KZG 见证。

KZG 见证 $W_{i,j}$ 是数据多项式 $f_i(X)$ 的线性函数，因此与承诺 $C_i$ 一样支持“in-the-exponent interpolation”：我们可以在不知底层数据的前提下，直接对 $[W_{1,j}, \dots, W_{n,j}]$ 进行指数域插值扩展，生成合法的冗余见证 $[W_{n+1,j}, \dots, W_{2n,j}]$。

## 实现

对扩展后的完整数据实施 KZG 承诺，原始方案需要一个强大的节点获取所有数据之后进行各个方向的扩展，随后才能计算承诺和证明。KZG 承诺的同态性，使得分布式构建方案得以实施，消除了对中心化节点的依赖，不仅提高了去中心化程度，还增加系统效率。

一种可能的方案是，节点被分配到 $n$ 行和 $n$ 列，通过内存池获得 Blob ，并在列子网中交换数据，获得完整原始列数据后，可以直接构建出包括见证在内的完整列。

自此，系统中没有任何角色需要完整数据。另一方面，由于行方向和列方向都只需要 50% 的数据即可恢复。在理想状态下，点对点网络中实际上传输的数据为扩展后数据的 25% ，这极大地减少了带宽消耗。