# 数据可用性层的分布式播种与调度优化

数据可用性层的首要任务是将数据高效地分发到网络中，以确保数据以过饱和的方式存在于网络中，随后确保抽样结果的正确性和一致性。在最初的方案中，数据分散由区块构建者完成，这要求其拥有大量资源。这不仅增加了系统的中心化程度，同时也成为系统瓶颈。另一种更好的方式是使用去中心化播种，数据的分散、重构不再依赖于某个大型节点，从而安全地增加系统吞吐量。

## 分布式播种

分布式播种目前有不同相交的思路在推进中，一种是对 mempool 进行水平分片，并采用分段列传播，另一种是 FullDAS 提出的 Cell 级别传播。

### Cell 级传播

在 FullDAS 的设计中，节点同样根据其 NodeID 被确定其 custody 职责，负责维护一个或多个完整的列或行。这些 custody 映射是公开、确定性的，便于其他节点在采样时快速定位。不同的是，数据被编码为二维矩阵，其中每个最小单元称为 cell，对应着某一行与某一列的交叉点。

在新的版本中，当 blob-carrying 交易进入执行层内存池时，节点即可对其进行行方向的编码。这不仅减少了构建者的开销，同时在某节点响应 `getBlobs` 请求时，也可直接返回编码后的行片段，而无需重新处理。

更重要的是，节点可以从执行层提取 blob 后，直接传播列数据。若单元正好位于订阅的列中，则直接推送至邻居，否则更好的选择是首先 gossip 其可用性。在传播过程中，当某节点收集到某列超过阈值数量，即可恢复该列，而无需所有 Blob。完成重建的节点可继续作为新的播种源，向其他节点传播该列或行的剩余 cell。通过这种 **cross-forwarding** 机制，行与列之间可协同传播与修复缺失片段，从而实现数据可用性的“放大”效应。

### Mempool 水平分片

在共识层和执行层分离的环境下，Blob 不仅作为交易存在于执行层中，也存在于共识层的数据可用性网络中，从源头上优化播种需要对 mempool 作出优化。

mempool 水平分片方案试图在数据进入区块之前就进行职责划分，将 Blob 分别分配给不同的节点。其做法是将 blob-carrying type3 交易根据某种规则划分到多个 shard，节点只需下载与其 nodeID 匹配 shard 的交易及 blob 数据。

这一机制将执行层（EL）的 blob 下载职责与共识层（CL）的 行 custody 职责绑定，从而避免了区块构建完成后在 CL 层重新上传行的冗余。

在进行水平分片后，由于列数据是 Blob 的纵向切片，节点从而拥有了部分列数据，并有职责将这些部分列数据传播出去。

### 分段列传播（**Partial Column Dissemination）**

节点被确定性、固定性地分配到不同的列，并将在 mempool 水平分片的行数据中相应的列数据传播出去。同时，节点将从其他节点获得其他的列数据，共同拼接出完整的列。

mempool 水平分片结合分段列传播的策略，不仅极大缓解了构建者与 CL 节点的上传负担，还提升了网络中列数据的可用性与冗余度，是在不引入超级节点的前提下实现列级分布扩散的关键。

这一方案在带宽节约方面效果显著，尤其适用于 home-staker。但它也引入了新的系统复杂性，最典型的问题是 sender 的多笔交易可能被分配到不同分片，从而导致 nonce-gap 破坏执行顺序。

![image.png](/shared/partial-column-dissemination.png)

## 调度优化

除了去中心化分发外，另一个重要的优化领域是调度优化。由于 DAS 是一个具有特殊需求，并且具有一些特殊性质的应用，而 GossipSub 等协议并非特别为此设计，因此存在多个针对性的优化方案。其中有些方案是正交的，可以叠加它们的优化效果，从而形成乘数效应的优化效果。

### 批量发布（Batch Publishing）

传统 GossipSub 实现中，每条消息都需要排队通过 `publish` API 发送到所有邻居节点。先发布的消息可迅速扩散，而队列尾部的消息则面临较长时间的等待。这导致前面的数据在网络中有较高的覆盖率，而另一些数据严重滞后，从而使得数据可用性采样不得不延迟。

批量发布（Batch Publishing）显示地告知网络栈：一组消息属于同一个批次，应在调度层面统一优化发送顺序。它采用交错式（interleaved）调度，类似于一种并发技术，首先确保批次中所有消息至少向随机邻居发送过一次，以便触发点对点网络的自然传播效应，之后再进行下一轮的多副本发送。

### Rarest-First

Rarest-First 策略借鉴了 BitTorrent 的分片下载模型，优先传播网络中最少节点拥有的 cell 或列。其逻辑是优先增加稀缺数据的冗余度，提前避免未来传播瓶颈的出现。

数据的稀缺性是通过本地观测估算出来的，例如对本地接受到的 IHAVE 消息的统计。接着在 push 阶段优先发送这些数据。

该策略在初始播种阶段尤为有效，可快速提升全网覆盖率并促进重构路径多样化。可以配合批量发布来使用，在发送多个副本前，优先选择那些稀缺度高的，进一步提升调度效率。

### 节点着色

节点着色（Node Coloring）是一种静态职责划分机制，将一组节点分成若干“颜色”组，每组负责不同的数据子集。最常见的用法是：同色节点间传播不重叠的数据，异色节点间建立桥接转发路径。

例如在 DAS 中，节点颜色可通过 NodeID 与数据坐标的关系确定。节点通过着色确定自身托管的子集，优先处理它们。这将形成更为细粒度的并发传播，同时避免不必要的热点，加快分发速度。

### PPPT（Push-Pull Phase Transition）

通过 GossipSub 协议，DA 数据可以快速地传播，但也带来了重复传播（duplicate overhead）的问题，大幅浪费带宽。GossipSub 基于两种传播机制：

- **PUSH 模式**：构建一个度数为 $D$ 的 mesh 网络，每个节点主动将接收到的消息向其他 $D-1$ 个 mesh 邻居广播。
- **PULL 模式**：在更大的网络范围内，通过 `IHAVE/IWANT` 消息恢复丢失的消息。

在基础的 GossipSub 协议中，PUSH 是默认传播方式，PULL 仅用于补漏。在传播后期，随着网络中数据的饱和度越来越高，重复消息也随之快速增长。
Push-Pull Phase Transition（PPPT）是一种动态调度策略，通过跳数（hop-count）来让节点获得传播阶段的知识，在前期采用 PUSH 保证快速扩散，后期逐渐切换为 PULL 以减少重复传播。

具体来说，节点首先会读取该消息携带的 hop-count 值 $h$，再根据预设参数 $d$ 计算应执行的传播策略：

- 若 $h < d$，则执行 $max(0, d - h)$ 次 PUSH，将消息继续转发给 $d - h$ 个邻居；
- 若 $h \ge d$，则不再 PUSH，而是向剩余邻居发送 IHAVE，等待 IWANT 请求，从而切换为 PULL 模式。

这一“渐进式切换”显著减少了网络后期重复副本的生成，同时保持了前期的低延迟传播优势。实验结果表明，PPPT 在仅轻微增加整体延迟的前提下，几乎完全消除了副本冗余，实现了 GossipSub 在高吞吐场景下的带宽优化。

## 参考

- [**Accelerating blob scaling with FullDASv2 (with getBlobs, mempool encoding, and possibly RLC)**](https://ethresear.ch/t/accelerating-blob-scaling-with-fulldasv2-with-getblobs-mempool-encoding-and-possibly-rlc/22477)
- [**PPPT: Fighting the GossipSub Overhead with Push-Pull Phase Transition**](https://ethresear.ch/t/pppt-fighting-the-gossipsub-overhead-with-push-pull-phase-transition/22118)
- [**Improving DAS performance with GossipSub Batch Publishing**](https://ethresear.ch/t/improving-das-performance-with-gossipsub-batch-publishing/21713)
- [**FullDAS: towards massive scalability with 32MB blocks and beyond**](https://ethresear.ch/t/fulldas-towards-massive-scalability-with-32mb-blocks-and-beyond/19529)
- [**From 4844 to Danksharding: a path to scaling Ethereum DA**](https://ethresear.ch/t/from-4844-to-danksharding-a-path-to-scaling-ethereum-da/18046)
- [**Doubling the blob count with Gossipsub v2.0**](https://ethresear.ch/t/doubling-the-blob-count-with-gossipsub-v2-0/21893)
- [**A new design for DAS and Sharded Blob Mempools**](https://ethresear.ch/t/a-new-design-for-das-and-sharded-blob-mempools/22537)