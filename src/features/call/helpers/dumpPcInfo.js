export async function dumpPcInfo(pc, label = "") {
  try {
    if (!pc) return;
    console.log(`[dumpPcInfo] ${label} getSenders:`, pc.getSenders().map(s => ({ id: s.track?.id, kind: s.track?.kind })));
    console.log(`[dumpPcInfo] ${label} getTransceivers:`, pc.getTransceivers().map(t => ({ mid: t.mid, direction: t.direction, sender: t.sender?.track?.id, receiver: t.receiver?.track?.id })));
    if (pc.getStats) {
      const stats = await pc.getStats();
      const rows = [];
      stats.forEach((r) => {
        if (r.type === "outbound-rtp" || r.type === "inbound-rtp" || r.type === "candidate-pair") {
          rows.push({
            id: r.id,
            type: r.type,
            kind: r.kind || "",
            mediaType: r.mediaType || "",
            bytesSent: r.bytesSent,
            bytesReceived: r.bytesReceived,
            timestamp: r.timestamp,
          });
        }
      });
      console.log(`[dumpPcInfo] ${label}`, rows);
    }
  } catch (e) {
    console.warn("[dumpPcInfo] error", e);
  }
}
