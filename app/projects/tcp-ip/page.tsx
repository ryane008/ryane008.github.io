import type { Metadata } from "next";
import { Figure, PageHeader, Section, Stat, StringsFooter } from "@/components/Article";
import { TcpDemo } from "@/components/demos/TcpDemo";

export const metadata: Metadata = { title: "TCP/IP in Rust" };

export default function TcpIp() {
  return (
    <>
      <PageHeader
        id="tcp-ip"
        dek="A virtual internet in Rust, built from IP forwarding and RIP routing up to a TCP that survives a lossy link. A two-person project for Brown's CSCI 1680, Computer Networks."
        meta="Rust · std::thread + mpsc channels · etherparse · Wireshark"
      />

      <div className="stats">
        <Stat value="2" label="layers: IP (vhost/vrouter) and TCP" />
        <Stat value="10" label="TCP states, SYN_SENT to TIME_WAIT" />
        <Stat value="2%" label="loss survived on a 1 MB transfer" />
        <Stat value="11×" label="slower than the reference (honestly)" />
      </div>

      <div className="prose">
        <p className="lede">
          Each &ldquo;host&rdquo; and &ldquo;router&rdquo; is a process, and each link is a UDP socket. On top of that
          fake wire we built the real thing: IP packets with checksums and TTLs, forwarding tables kept current by RIP,
          and a TCP that hands bytes across reliably and in order, no matter what the network drops.
        </p>
      </div>

      <Figure
        src="/media/projects/tcp-milestone.png"
        alt="Terminal panes for hosts h1, h2, h3 and routers r1, r2; h3 shows a received test packet"
        caption="The IP milestone: h1 sends a test packet across two routers, and h3 receives it with its TTL decremented along the way."
      />

      <Section title="No locks, just messages">
        <p>
          Our main design decision was that no thread shares state with another. One thread blocks on each
          interface&rsquo;s socket, one thread owns the forwarding table, and RIP and the CLI talk to the IP stack only
          through channel messages. TCP follows the same rule: a single manager thread owns every connection and serves
          requests from the CLI, from per-port accept threads, and from the packet-receive thread.
        </p>
        <pre className="diagram">{`IP stack  ──IpPacket──▶  packet-receive  ──Receive──▶  manager
CLI       ──TCPMessage──────────────────────────────▶  manager
manager   ──AcceptPacket──▶  accept thread (per port)
accept    ──AcceptedConn──────────────────────────▶  manager
manager   ──StackMessage──▶  IP stack (outgoing)`}</pre>
        <p>
          Blocking calls (read on an empty buffer, connect before the handshake finishes) stash a one-shot reply
          channel on the connection. When the condition is met, the manager fires it and the caller wakes up.
        </p>
      </Section>

      <Section title="Reliability, piece by piece">
        <ul>
          <li>
            <b>Sliding window.</b> The send buffer doubles as the retransmission queue: bytes stay there until
            they&rsquo;re acknowledged, capped at 64 KB and bounded by the peer&rsquo;s advertised window.
          </li>
          <li>
            <b>Out-of-order reassembly.</b> Early segments wait in a <code>BTreeMap</code>. When the gap fills, one pass
            merges everything contiguous.
          </li>
          <li>
            <b>Retransmission.</b> SRTT-based RTO with exponential backoff, and Karn&rsquo;s algorithm so we never time
            a retransmitted segment.
          </li>
          <li>
            <b>Zero-window probing.</b> When the receiver is full, we send a one-byte probe every second until the
            window opens.
          </li>
        </ul>
      </Section>

      <section className="section section--wide">
        <h2>Watch it recover</h2>
        <p className="prose">
          The course doesn&rsquo;t allow publishing solution code, so the demo is a small simulation of the same
          protocol logic, written fresh for this page.
        </p>
        <TcpDemo />
      </section>

      <Section title="What the packet capture showed">
        <p>
          We sent 1 MB with 2% loss on the router and captured it in Wireshark. By chance, the very first SYN was
          dropped and retransmitted. Frame 4615 starts the four-step teardown: our FIN, their ACK, their FIN, our ACK.
        </p>
      </Section>

      <Section title="Where it falls short">
        <p>
          A 25 MB file took about 11 seconds; the reference implementation took 1. Profiling put most of the cost in
          per-segment checksums and channel hops through a single-threaded manager. The fixes we&rsquo;d make are to
          batch-drain the message queue before each timer sweep and fold packet parsing into the manager. Other known
          gaps: no window update after a read, an unbounded out-of-order buffer, and a zero checksum on the initial SYN.
        </p>
      </Section>

      <StringsFooter id="tcp-ip" />
    </>
  );
}
