import { useCallback } from "react";

export function useNegotiation({ callState, pcHooks, send, localMedia, screenShare }) {
  const renegotiate = useCallback(async () => {
    if (!pcHooks.pc.current || !callState.stateRef.current?.active) return;
    try {
      const transceivers = pcHooks.pc.current.getTransceivers();
      const recvVideoCount = transceivers.filter(
        (t) =>
          t.receiver && t.receiver.track && t.receiver.track.kind === "video"
      ).length;
      if (recvVideoCount < 1) {
        try { pcHooks.pc.current.addTransceiver("video", { direction: "recvonly" }); } catch { /* ignore */ }
      }
      if (callState.stateRef.current?.remoteScreenOn) {
        try { pcHooks.pc.current.addTransceiver("video", { direction: "recvonly" }); } catch { /* ignore */ }
      }

      const offer = await pcHooks.pc.current.createOffer();
      await pcHooks.pc.current.setLocalDescription(offer);
      send("webrtc:offer", { call_id: callState.stateRef.current.callId, sdp: offer });
    } catch (e) {
      console.error("[useNegotiation] Error during renegotiate:", e);
    }
  }, [callState, pcHooks, send]);

  const handleOffer = useCallback(async (payload) => {
    if (!payload?.sdp || !callState.stateRef.current?.callId) return;

    pcHooks.createPeerConnection();
    const stream = await localMedia.getMediaOnce(callState.stateRef.current.kind);
    localMedia.addLocalTracksOnce(stream);
    if (screenShare.localScreen.current) screenShare.addScreenTrackOnce(screenShare.localScreen.current);

    await pcHooks.pc.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));

    try {
      pcHooks.pc.current.addTransceiver("video", { direction: "recvonly" });
      if (callState.stateRef.current?.remoteScreenOn)
        pcHooks.pc.current.addTransceiver("video", { direction: "recvonly" });
    } catch { /* ignore */ }

    const answer = await pcHooks.pc.current.createAnswer();
    await pcHooks.pc.current.setLocalDescription(answer);
    send("webrtc:answer", { call_id: callState.stateRef.current.callId, sdp: answer });
  }, [callState, pcHooks, localMedia, screenShare, send]);

  const handleAnswer = useCallback(async (payload) => {
    if (!payload?.sdp || !pcHooks.pc.current) return;
    await pcHooks.pc.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
  }, [pcHooks]);

  const handleIce = useCallback(async (payload) => {
    if (!payload?.candidate || !pcHooks.pc.current) return;
    try {
      await pcHooks.pc.current.addIceCandidate(payload.candidate);
    } catch (e) {
      console.error("[useNegotiation] Error adding ICE candidate:", e);
    }
  }, [pcHooks]);

  return {
    renegotiate,
    handleOffer,
    handleAnswer,
    handleIce,
  };
}
