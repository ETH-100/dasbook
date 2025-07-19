# Threat Model

After introducing Data Availability Sampling (DAS), two types of threats emerge:

1. Those inherent to the DA layer itself, and
2. **Amplified threats**, where attackers exploit DAS to exacerbate existing protocol vulnerabilities, ultimately undermining chain security or liveness.

## **Selective Share Disclosure Attack**

Selective share disclosure is an advanced **data withholding strategy** targeting DAS. In this attack, an adversary intentionally withholds a portion of the block data, rendering it unreconstructable by the network, **while selectively responding to sampling requests from targeted nodes**. The attacker must identify which requests originate from the same victim and respond only to them while withholding data from the rest of the network. As a result, the victim node is **tricked into accepting an unavailable block** without realizing it has been selectively served.

## **Data Withholding Attack**

Broadly speaking, data withholding is one of the core threats that DAS is designed to mitigate: an adversary hides parts of the data to compromise the **security or liveness** of the blockchain.

In a **narrower sense**, a data withholding attack occurs when the adversary **acts honestly during sampling**, allowing clients to verify availability, but **hides the data afterward**—ultimately causing the data to be unavailable.

Such an attack is only successful if:

* Honest nodes **lack redundancy** (i.e., do not store the full data set);
* Sampled fragments **are not retained** or **are inaccessible** after sampling.

This scenario becomes especially dangerous in DHT networks when a large-scale **Sybil attack** enables adversaries to control significant portions of the data space.

## **Sybil Attack**

Sybil attacks are among the most prevalent threats in distributed networks. An adversary forges many fake identities to manipulate the protocol.

In the DAS context, a Sybil attacker may:

* Fill a victim's neighbor set with malicious nodes to manipulate sampling results, facilitating **selective disclosure** and **data withholding**;
* Consume network resources (bandwidth, connection slots) to marginalize honest nodes;
* In DHT-based designs:

  * Hijack routing paths (drop, delay, or reroute requests to other Sybil nodes);
  * Withhold data (classic data withholding);
  * Perform keyspace occupation attacks to control sampling;
* In Gossip-based designs:

  * Launch **eclipse attacks** against specific subnets.

Depending on the network topology, **mitigating Sybil attacks can be challenging**. Even increasing identity costs (e.g., PoW or stake) may be insufficient compared to consensus-layer attack costs—though using blockchain validators as a trusted backbone can help.

Moreover, **Sybil nodes may behave honestly for extended periods**, accumulating high trust scores before launching an attack—**delayed betrayal**.

## **Ex-Ante Reorganizations**

An **ex-ante reorg** is a well-known class of consensus-layer attacks where the adversary privately builds an alternative chain and publishes it strategically to overwrite the canonical chain.

With DAS, this attack evolves into a **“partial data publishing” ex-ante reorg**. The attacker exploits DAS’s **sampling lag** and **incompleteness**, constructing a sequence of blocks with missing data that mislead validators into mistakenly finalizing an invalid chain.

Typical attack steps:

![image.png](/shared/ex-ante-reorgs.png)

1. The attacker controls a fraction of validators $\beta$, not necessarily a majority but with significant weight. In their proposed block $B$, they **withhold parts of the data**, but still **broadcast a valid block header**.
2. A portion of honest validators sample $B$ using light or partial DAS. By **carefully selecting which data to withhold**, the attacker ensures that **up to $\delta$** of honest validators mistakenly believe $B$ is available and vote to finalize it.
3. The attacker **continues building blocks** $C$, $D$, etc., using the same tactic, ensuring each block receives **$\delta + \beta$** voting support.
4. When an honest proposer attempts to introduce a competing fork (after discovering the original chain is unavailable), the attacker **reveals the withheld data**, making the previous blocks appear valid and already finalized. The honest fork gets discarded, and the attacker’s fork wins.

Compared to classic reorgs, this variation **exploits DAS-specific timing** and **error tolerance $\delta$**, allowing the attacker to **accumulate excess votes per block** that wouldn’t be possible under full availability verification. The result is an amplified risk of reorganization and a serious **threat to chain safety and finality**. A successful attack leads to the replacement of an honest chain by a malicious one.

## References

* [**Eth2book: LMD Ghost Consensus**](https://eth2book.info/latest/part2/consensus/lmd_ghost/)
* [**Recent Latest Message Driven GHOST: Balancing Dynamic Availability With Asynchrony Resilience**](https://arxiv.org/pdf/2302.11326)
* [**DAS Fork-Choice**](https://ethresear.ch/t/das-fork-choice/19578)
