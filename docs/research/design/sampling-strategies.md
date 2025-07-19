# Data Availability Sampling Strategies

Once 2D-extended DAS is implemented, nodes only need to sample a small portion of the data to determine availability—making the **sampling strategy** critically important. Sampling is tightly coupled with the DAS network design, and beyond that, **probabilistic guarantees** are a core component of DAS security. Traditional 2D RS sampling requires each node to randomly sample a fixed number of fragments. If all succeed, the block is deemed available. However, this method ignores network factors—such as neighbor failures—that may cause some samples to fail. In addition, the **distribution of sample points** significantly affects security. Researchers have proposed enhanced strategies such as **LossyDAS**, **IncrementalDAS**, and **DiDAS** to make sampling safer and more efficient.

## **Lossy Data Availability Sampling (LossyDAS)**

In the original DAS design, nodes sample exactly $S$ fragments and require **all of them to succeed** for the block to be considered available. A single failed download causes the node to reject the block. In large-scale networks, however, it’s common for some nodes to be offline or for temporary packet loss to occur. Strict requirements like this can lead to **false negatives**—declaring available blocks as unavailable due to minor, transient issues.

LossyDAS mitigates this by allowing nodes to sample slightly more than $S$ fragments, while tolerating up to $M$ failures. This reduces the risk of false negatives caused by flaky nodes or minor packet loss. The idea is to increase $S$ slightly and permit up to $M$ failures, while maintaining the **same false positive probability** $P_{FP}$ as strict sampling.

For a 2D Reed-Solomon grid of 512×512 (original data size $K=256$, extended to $N=512$ per dimension), to achieve a false positive rate below $1×10^{-9}$, strict sampling requires about $S=73$ samples. Under LossyDAS, each additional 10 samples allow one more tolerated failure while preserving the same security margin. For example:

* $S = 84$, tolerate $M = 1$ failure;
* $S = 103$, tolerate $M = 3$ failures.

Thus, LossyDAS keeps the same worst-case security guarantee (same $P_{FP}$), but greatly reduces the false negative rate, making it more robust against minor or recoverable data loss.

## **Incremental Data Availability Sampling (IncrementalDAS)**

While LossyDAS introduces fault tolerance, it still requires **predefining** the sample count. If the selected sample set proves insufficient, the node might still abort verification. IncrementalDAS addresses this by **dynamically scaling** the sampling set.

Rather than immediately declaring a block unavailable after failure, a node incrementally increases its sample size. It begins with a failure tolerance level $L_1$ and uses LossyDAS analysis to compute the required sample size $S(L_1)$. If at least $S(L_1) - L_1$ samples are successfully retrieved, the test passes. If not, the node increases the tolerance to $L_2 > L_1$ and samples an additional $S(L_2) - S(L_1)$ fragments.

Each round builds on the previous one, making the **final sample set equivalent** to a larger one-time sample. Therefore, the original **false positive bounds** still apply.

This strategy provides both **resilience and adaptability**. It’s especially useful when individual nodes are unreachable or have delayed responses. IncrementalDAS prevents unnecessary rejection by adapting in response to observed failures. Crucially, it **does not allow re-rolling** or discarding prior samples, which ensures consistency and prevents manipulation.

Ultimately, IncrementalDAS converges to a large enough sample set to confidently verify availability with minimal bandwidth cost. It is especially well-suited to **light clients** or **bandwidth-constrained environments**.

## **DiDAS (Diagonal Sampling Strategy)**

Because 2D Reed-Solomon codes are not MDS, **recoverability depends on the erasure pattern**. There exists a worst-case **minimum erasure pattern**: an attacker can select $N-K+1$ rows and $N-K+1$ columns and erase their intersection. This guarantees that no row or column has enough intact fragments for recovery—rendering the entire block unrecoverable.

This pattern represents the **most efficient attack strategy**, and sampling methods must be able to detect it. If sample points are concentrated in just a few rows or columns, the detection probability drops significantly.

**DiDAS** mitigates this by enforcing that each sample lies in a **distinct row and column**, forming a diagonal-like pattern in the $N × N$ grid. This maximizes 2D coverage and increases the chance of hitting adversarial intersections, improving the ability to detect worst-case erasure patterns.

With small sample sizes, DiDAS performs similarly to uniform random sampling. But as $S$ increases (e.g., $S > 100$), the likelihood of repeated rows or columns in random sampling increases, while DiDAS ensures full dispersion. This results in a **faster decay in false positive probability**.

DiDAS is also **simple to implement**: shuffle row and column index arrays to ensure uniqueness, then pair them to form the sampling set. Since it introduces **no additional bandwidth cost** and significantly improves worst-case detection, it serves as a “**zero-cost enhancement**” and can be easily combined with other strategies.

For example, during each round of IncrementalDAS, one can enforce DiDAS-style row/column uniqueness for new samples, naturally incorporating its benefits.

## References

* [**LossyDAS: Lossy, Incremental, and Diagonal Sampling for Data Availability**](https://ethresear.ch/t/lossydas-lossy-incremental-and-diagonal-sampling-for-data-availability/18963)
