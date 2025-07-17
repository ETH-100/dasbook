# Gossip Protocol and GossipSub

If you want to deliver a message to thousands of nodes in a very short time, the most direct approach is to broadcast it to all your known peers—and let each of them do the same. This resembles how rumors spread in human society, which is precisely what the Gossip protocol models. While traditional DHTs provide a well-structured querying mechanism, they fall short in broadcast performance—especially in time-sensitive and reliability-critical scenarios like Data Availability Sampling (DAS).

However, this kind of rapid diffusion comes at a cost. Traditional Gossip is unstructured, highly redundant, and leads to significant bandwidth waste and an uncontrollable topology. To retain its speed while introducing more structure and efficiency, we need a more organized overlay. And this is where GossipSub comes in.

GossipSub is a publish-subscribe (pub/sub) protocol. You can think of it as a structured gossip network: each node subscribes only to topics it is interested in and connects to a small set of peers that share the same interest. This subnet-style topology maps naturally to the row/column layout of DAS data and enables efficient data propagation.

In current DAS networks, GossipSub has become the primary communication protocol.

## Network Structure

![image.png](/en/gossipsub-network.png)

### Mesh Network

Nodes that subscribe to a particular topic discover and connect to others who have subscribed to the same topic. These nodes form the **mesh** for that topic. When a node publishes a message, it only needs to send it to a few of its peers, who then forward it to their peers, and so on—allowing for low-cost propagation within the mesh.

Each node maintains only a small number of connections yet achieves broad message coverage. To keep these meshes healthy and adaptive, GossipSub employs a periodic heartbeat mechanism that automatically performs `GRAFT` (adding missing connections) and `PRUNE` (removing excess peers), ensuring propagation paths remain stable and responsive.

This mesh forms a **full-message** network: the messages exchanged between peers contain full message content, not just metadata.

### Metadata-only Network

From a global perspective, different subnets (meshes) still need to communicate. In addition to full-message communication, each node also maintains a **metadata-only** overlay network. These connections do not transmit message payloads; instead, they exchange lightweight control messages:

* `IHAVE`: notifies neighbors that the sender has certain messages;
* `IWANT`: requests specific messages that the recipient lacks;
* `IDONTWANT`: declares that certain messages are not desired, preventing redundant transmission.

This control plane becomes crucial under heavy load or in unreliable network conditions. It ensures that nodes can recover from missed messages while conserving bandwidth and maintaining robustness.

### Fan-out

In some cases, a node may need to send a full message to a topic it hasn’t subscribed to. For instance, if a node samples a piece of data but isn’t responsible for storing it, it still needs to publish that data fragment. GossipSub accommodates this through the **fanout peers** mechanism:

* When a node publishes to an unsubscribed topic for the first time, it randomly selects a few peers subscribed to that topic as fanout peers;
* The message is forwarded to those peers, who then propagate it through the mesh;
* Fanout peers are ephemeral. If the node stops sending messages to that topic for a short period (e.g., two minutes), the fanout group is automatically discarded.

To further prevent flooding, each message typically carries a **Time-To-Live (TTL)** field. For example, TTL = 5 means the message may be propagated at most five times, with the counter decreasing on each hop.

## DAS Applications

In DAS systems, block data is encoded into a two-dimensional matrix, where each row or column corresponds to a logical **topic**. Data publishers broadcast fragments by rows or columns to the respective topics.

Each node, depending on its **custody** responsibilities, subscribes to the relevant topics and joins the corresponding mesh networks to receive and exchange data. After data is published:

* Nodes use `IHAVE` to announce which fragments they possess;
* Peers request missing fragments using `IWANT`;
* If a node is uninterested in a message or already has it, it can send `IDONTWANT` to suppress further delivery, saving bandwidth.

These mechanisms ensure that DAS networks can achieve both completeness in sampling and efficiency in data dissemination—making GossipSub an ideal protocol for this environment.
