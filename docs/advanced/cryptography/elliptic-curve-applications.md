

# Applications of Elliptic Curves

## ECDH Key Exchange

We now have a pair of private and public keys, and others cannot derive the private key from the public key. But that alone isn’t very useful—while you could encrypt a message with your private key, how would the recipient decrypt it or verify that it hasn’t been tampered with?

If you and the recipient share the same key pair, the private key can be used to decrypt the message.

**ECDH (Elliptic Curve Diffie-Hellman)** is a key exchange algorithm that allows two parties to compute a shared key pair securely by exchanging public keys. Suppose Alice wants to send a message to Bob without it being intercepted. The message needs to be encrypted, and only Bob should be able to decrypt it. Alice obviously cannot send her private key to Bob directly, but they can exchange public keys to compute a shared secret key.

![image.png](/en/ecdh.png)

1. Alice chooses her private key $a$ and computes her public key $A = aG$
2. Bob chooses his private key $b$ and computes his public key $B = bG$
3. Alice sends $A$ to Bob, and Bob sends $B$ to Alice
4. Alice computes the shared key $K = aB$, and Bob computes $K = bA$. Since $aB = a(bG) = b(aG) = bA$, the shared key $K$ is identical for both

From then on, Alice and Bob can use this shared key to encrypt and decrypt secret information $S$. In TLS, a variation called **ECDHE** is used to generate **ephemeral keys**, enabling secure communication between clients and servers.

## ECDSA Signature

ECDH relies on the **commutativity** of elliptic curve scalar multiplication. It’s useful, but requires both parties to exchange keys. Suppose Alice publicly announces a message and wants to **prove to everyone** that the message truly came from her. In this case, everyone is a “Bob,” and key exchange isn’t feasible.

You might imagine that we can generate a **public key pair** for everyone, such that no one knows the private key, and the verification process doesn’t require the private key at all.

This is the core idea behind **ECDSA (Elliptic Curve Digital Signature Algorithm)**.

We first generate a temporary key pair:

1. **Private key $k$**: Select a random number $k$ such that $0 < k < n$
2. **Public key**: $P = kG$

Alice's long-term private key is $d_A$, with corresponding public key $H_A$. Since we’re only verifying the message, not decrypting it, we hash the message and truncate it to form $z$. To bind the message to the private key while hiding the private key, we add $z + d_A$.

To eliminate $k$, we intuitively need a division step, leading to:

$$
s = (z + d_A)k^{-1}
$$

Alice publishes $s$, her public key $H_A$, and the hash $z$. Anyone can verify the signature via:

$$
P = s^{-1}zG + s^{-1}H_A
$$

Substituting $H_A = d_A G$, we verify:

$$
s^{-1}zG + s^{-1}H_A = s^{-1}zG + s^{-1}d_A G = G(z + d_A)s^{-1} = Gk(z + d_A)k^{-1}s^{-1}
$$

Since:

$$
s = k^{-1}(z + d_A)
$$

Then:

$$
kGss^{-1} = kG = P
$$

Congratulations—you’ve just invented ECDSA. However, this version is insecure because the signature can be forged. An attacker could:

* Know the public key $H_A = d_A G$
* Know the message hash $z$
* See the signature $s$

Then forge a signature $s'$ such that:

$$
P = s'^{-1}zG + s'^{-1}H_A = s'^{-1}(zG + H_A)
$$

The attacker can choose any $s'$ and compute $P$ accordingly. This results in a “valid” looking signature. To prevent this, we introduce a **random value $r$**:

$$
r = P.x \mod n
$$

That is, we use the x-coordinate of $P$, modulo $n$, and ensure it’s not zero. There are other considerations around choosing $r$ (discussed later). The new $s$ becomes:

$$
s = k^{-1}(z + r d_A)
$$

### Final ECDSA Signing Steps:

1. Choose random $k$, $0 < k < n$
2. Compute $P = kG$
3. Compute $r = P.x \mod n$

   * If $r = 0$, restart
4. Compute $s = k^{-1}(z + r d_A)$

   * If $s = 0$, restart

### Signature Verification:

1. Compute $u_1 = s^{-1}z \mod n$
2. Compute $u_2 = s^{-1}r \mod n$
3. Check $P = u_1G + u_2H_A$

Verification proof:

$$
u_1G + u_2H_A = s^{-1}zG + s^{-1}r d_A G = s^{-1}(z + r d_A) G = s^{-1}(z + r d_A)k^{-1}kG
$$

Since $s = k^{-1}(z + r d_A)$:

$$
s^{-1}(z + r d_A)k^{-1}kG = s^{-1}s kG = kG = P
$$

## Schnorr Signature

You may wonder why $r$ must be extracted from the x-coordinate. Couldn’t we use a more **symmetric and elegant** method?

That’s exactly what **Schnorr signatures** aim for—more elegant in theory and easier to formally prove secure.

Instead of extracting a coordinate from a point, Schnorr **hashes the point directly** with the message to generate a **challenge value $e$**, combining the message and private key.

### Signing:

Alice has private key $d_A$ and public key $H_A = d_A G$, and wants to sign message $m$.

1. Select random $k$, compute commitment point $R = kG$
2. Compute challenge $e = \text{Hash}(R \parallel m)$
3. Compute response $s = k + e d_A$

Signature is the tuple $(R, s)$.

### Verification:

Given public key $H_A$ and message $m$:

1. Recompute $e = \text{Hash}(R \parallel m)$
2. Verify: $sG \stackrel{?}{=} R + eH_A$

**Verification:**

$$
sG = (k + e d_A)G = kG + e d_A G = R + e H_A
$$

So the signature is valid.

Compared to other signature schemes, Schnorr is elegant and supports:

* **Multisignatures**
* **Distributed key generation**

The process is similar to ECDH: participants combine public keys into an aggregate public key $H$, generate commitments $R_i$, responses $s_i$, and aggregate to $R$ and $s$. The challenge is $e = \text{Hash}(R \parallel H \parallel m)$, and verification is the same:

$$
sG \stackrel{?}{=} R + eH
$$

Schnorr signatures are symmetric, aggregatable, and provably secure. However, they were **patented**, and thus not widely adopted until the patent expired in 2008. Bitcoin introduced Schnorr in the **Taproot upgrade**, enabling signature aggregation and other powerful features.

### Schnorr vs. ECDSA: Recoverability

One downside of Schnorr is that it **doesn’t support signature recovery**.

ECDSA signatures are pairs $(r, s)$:

* $r$ is derived from the x-coordinate of $R = kG$: $r = R.x \mod n$
* Since $R$ and $-R$ share the same $x$ coordinate, knowing $r$ allows inferring **two possible points** $R$
* Given $(r, s, z)$, a verifier can **recover** the signer’s public key $H_A$

This leads to **ECDSA-recoverable signatures**, which add a **recovery id** (usually 0–3), indicating:

* Whether the original point was $R$ or $-R$
* Whether it belongs to a subgroup or its multiple

With these 2 bits and $(r, s)$, the signer’s public key can be reconstructed. That’s why Ethereum signatures are represented as $(v, r, s)$, where $v$ is the recovery id (and may include chain ID), allowing **address recovery**.

## References

- [**Elliptic Curve Cryptography: ECDH and ECDSA**](https://andrea.corbellini.name/2015/05/30/elliptic-curve-cryptography-ecdh-and-ecdsa/)
- [**Schnorr Digital Signature**](https://www.geeksforgeeks.org/computer-networks/schnorr-digital-signature/)
- [**Schnorr Signatures, Commitments** – UIUC Cryptography Lecture Notes](https://courses.grainger.illinois.edu/cs498ac3/fa2020/Files/Lecture_13_Scribe.pdf)
- [**To Schnorr and beyond (Part 2)** – Cryptography Engineering Blog](https://blog.cryptographyengineering.com/2023/11/30/to-schnorr-and-beyond-part-2)