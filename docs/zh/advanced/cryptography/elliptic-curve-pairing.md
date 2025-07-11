<!--
 Copyright 2025 ZeroDAO
 
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 
     https://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-->

虽然 Schnorr 可以原生地支持多重签名，但需要成员之间多轮协商，这不仅增加了通信成本，并且非常不利于在复杂的应用环境中应用。Schnorr 之所以需要多轮签名，是因为虽然它是结构对称的，但仍然依赖于随机数生成，我们能不能寻找到一种完全对称的数学结构？

实际上乘法本身就满足我们需要的对称性：

$$
3*(5+4) =3*9 = 27
$$

同时：

$$
3*(5+4)=3*5+3*4=15+12=27
$$

现在 $Alice$ 的私钥为 $k$ ，公钥 $P=kG$ ，消息为 $H$ ，我们通过乘法获得签名 $S$ ：

$$
S=kH
$$

验证签名只需要计算 $G*S$ 与 $P*H$ 是否相等，因为：

$$
G*S=G*k*H=P*H
$$

一切都很完美，但目前为止椭圆曲线上的乘法建立在一个值和点的乘法，我们称之为标量乘法。点和点之间的乘法并没有被定义，因此无法计算  $G*S$ 和 $P*H$ 。好消息是可以设法绕过这一点，实际上我们需要的不是一个乘法，而是满足分配率的某种计算。如同虽然在这个小王国中，没有人会乘法，但却有人能直接计算 $2^{3*9}$ 的值，并且：

$$
2^{3*(5+4)}=2^{3*5}*2^{3*4}
$$

这完全满足要求，我们把这种给出 $3$ 和 $9$ 直接得出 $2^{3*9}$ 值的算法称为配对。但显然这个幂函数无法被应用到椭圆曲线加密中，我们需要再次建设这个小王国，寻找到满足条件的函数。正式地，我们将配对定义为一个映射：

$$
e: G1 × G2 → GT
$$

并且：

$$
e(P + Q, R) = e(P, R) · e(Q, R)

$$

$$
e(P, Q + R) = e(P, Q) · e(P, R)
$$

同时它还必须满足非退化性(non-degeneracy)，因为虽然 $e(P,Q)=1$ 满足条件，但没有任何价值。另外，它还需要满足可计算性。

不太严谨地讲，实际上我们寻找的并非某个可以简单表示的单一函数，而是一个函数族。如同并非小王国中的某个英雄，而是王国中的一个家族。我们可以通过 $P$ 点来构造函数，例如椭圆曲线中 $P$ 点的切点，当 $P$ 发生变化时，这个函数也发生了变化。之后我们把 $Q$ 点作为函数的输入，计算最终结果，把这个过程记为：

$$
f_P(Q)
$$

同样的，我们还可以以 $Q$ 点作为基点来评估 $P$ 的值： $f_Q(P)$ 。于是，上面提到的映射函数 $e(P + Q, R) = e(P, R) · e(Q, R)$ 可以表示为：

$$
f_{P+Q}(R)=f_P(R)*f_Q(R)
$$

## 除子

如同每个家族都有着代表自己的规则一样，我们要使用到一个叫做除子的数学工具，它代表了函数的骨架。虽然我们无法通过骨架来判断一个人的胖瘦，但能知道身高、臂展等属性。由于我们需要对函数做乘法，而除子在这方面非常好用，我们通过计算除子，从而确定我们需要构造怎样的函数族。在当前语境下，除子代表了函数在零和无穷大上的表现。例如，我们用 $div(f_P)$ 来表示 $f_P$ 的除子：

$$
div(f_P)=(P)+(−P)−2(O)
$$

这个除子结构是：

- 在 $P$ 和 $-P$ 有零点；
- 在无穷远点 $O$ 有二阶极点；
- 在其他点没有零点或极点（阶为 0）；
- 总的次数是 0（满足主除子条件）。

这就像赛车一样，评估一个选手的情况，观看完整的录像是非常低效的。我们只要知道起点在哪里，在起点是如何加速的；在哪里过弯的，以什么样的速度过弯；并且选手是如何驶向终点（无穷远点）的：如果选手是匀速行驶，则为 $(O)$ ；选手以某个加速度，则能更快到达终点，则为 $2(O)$ ；如果这个加速度本身有加速度，则为三阶 $3(O)$ ，以此类推。

我们就是通过这样的除子来构造函数，为了更直观地展示这种构造方法，函数可以表示为以下形式：

$$
f(x) = \frac{(x-3)^3}{(x-7)^2}
$$

- 在 $x = 3$ 有一个三阶零点；
- 在 $x = 7$ 有一个二阶极点；

我们令 $t = 1/x$ ，让 $x \to \infty$ 变成 $t \to 0$ ，代入函数：

$$
f(x) = \frac{(x - 3)^3}{(x - 7)^2} \sim \frac{1/t^3}{1/t^2} = \frac{1}{t}=t^{-1}
$$

因此函数在 $t = 0$（也就是 $x \to \infty$ ）时像 $1/t$ 发散，很明显，阶数为 $-1$ 。所以 $f(x)$ 的除子是：

$$
\operatorname{div}(f) = 3(3)−2(7)−(O)
$$

当两个函数相乘时，我们该如何计算新函数的除子？例如 $g(x) = x - 3$，它的除子是 $\operatorname{div}(g) = (3) - (O)$ 。

$$
f(x)*g(x) = \frac{(x - 3)^4}{(x - 7)^2}
$$

在无穷远点：

$$
\frac{(x - 3)^4}{(x - 7)^2} \sim \frac{1/t^4}{1/t^2} = \frac{1}{t^2} =t^{-2}
$$

对应的除子为：

$$
\operatorname{div}(f*g) = 4(3) - 2(7) -2(O)
$$

实际上我们可以直接用 $f$ 和 $g$ 的除子相加即可： $\operatorname{div}(f) + \operatorname{div}(g)$ 

$$
\operatorname{div}(f*g)=\operatorname{div}(f) + \operatorname{div}(g)=3(3)−2(7)−(O) +(3) - (O) =4(3) - 2(7) -2(O)
$$

这并不难理解，乘数提高了不同点上的阶，我们还可以使用同样的步骤演示函数的除法，最终的除子为两个函数除子相减：

$$
\operatorname{div}\left( \frac{f}{g} \right) = \operatorname{div}(f)-\operatorname{div}(g)
$$