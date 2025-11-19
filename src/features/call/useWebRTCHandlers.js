import { useEffect } from "react";

export function useWebRTCHandlers({
  user,
  on,
  off,
  send,
  callState,
  pcHooks,
  localMedia,
  screenShare,
  negotiation,
}) {
  useEffect(() => {
    if (!user) return;

    const incoming = (payload) => {
      callState.setState((s) => ({
        ...s,
        incoming: true,
        ringing: true,
        callId: payload.call_id,
        withUser: payload.from_user || payload.from,
        kind: payload.kind || "audio",
      }));
    };

    const start = (payload) => {
      callState.setState((s) => ({
        ...s,
        ringing: true,
        callId: payload.call_id,
        withUser: payload.to_user || payload.to,
        kind: payload.kind || "audio",
      }));
    };

    const accepted = async (payload) => {
      if (payload.from !== callState.stateRef.current.withUser?.id) return;

      callState.setState((prev) => ({ ...prev, ringing: false, active: true }));

      const stream = await localMedia.getMediaOnce(callState.stateRef.current.kind);
      stream.getAudioTracks().forEach((t) => (t.enabled = callState.stateRef.current.micOn));
      if (callState.stateRef.current.kind === "video") {
        stream.getVideoTracks().forEach((t) => (t.enabled = callState.stateRef.current.camOn));
      }

      pcHooks.createPeerConnection();
      localMedia.addLocalTracksOnce(stream);
      if (screenShare.localScreen.current) screenShare.addScreenTrackOnce(screenShare.localScreen.current);

      try {
        pcHooks.pc.current.addTransceiver("video", { direction: "recvonly" });
        if (callState.stateRef.current?.remoteScreenOn)
          pcHooks.pc.current.addTransceiver("video", { direction: "recvonly" });
      } catch (e) {}

      const offer = await pcHooks.pc.current.createOffer();
      await pcHooks.pc.current.setLocalDescription(offer);
      send("webrtc:offer", { call_id: callState.stateRef.current.callId, sdp: offer });
    };

    const rejected = () => callState.resetState();
    const ended = () => callState.resetState();

    const handleCamera = (payload) => {
      callState.setState((s) => ({ ...s, remoteCamOn: payload.enabled }));
      if (payload.enabled && callState.stateRef.current?.active) negotiation.renegotiate();
    };

    const handleScreen = (payload) => {
  callState.setState((s) => ({ ...s, remoteScreenOn: payload.enabled }));

  if (payload.enabled) {
    // remote enabled screen -> renegotiate to receive it if call is active
    if (callState.stateRef.current?.active) {
      negotiation.renegotiate();
    }
    return;
  }

  // remote disabled screen -> force cleanup local references and receiver tracks
  try {
    // 1) stop tracks in remoteScreen.current (if any)
    if (pcHooks.remoteScreen.current) {
      pcHooks.remoteScreen.current.getTracks().forEach((t) => {
        try { t.stop(); } catch (e) {}
      });
      pcHooks.remoteScreen.current = null;
    }

    // 2) stop receiver tracks that are video and appear live (force stop to remove last frame)
    if (pcHooks.pc.current && pcHooks.pc.current.getReceivers) {
      const receivers = pcHooks.pc.current.getReceivers();
      receivers.forEach((r) => {
        try {
          const rt = r.track;
          if (!rt) return;
          if (rt.kind === "video" && rt.readyState !== "ended") {
            try { rt.stop(); } catch (e) {}
          }
        } catch (e) {}
      });
    }

    // 3) remove extra recv-only transceivers that were added for screen
    try {
      if (pcHooks.pc.current && !callState.stateRef.current?.remoteScreenOn) {
        const transceivers = pcHooks.pc.current.getTransceivers().filter(t => t.receiver && t.receiver.track && t.receiver.track.kind === "video");
        if (transceivers.length > 1) {
          // keep one for camera, stop others
          transceivers.slice(1).forEach(t => {
            try { t.stop(); } catch (e) {}
          });
        }
      }
    } catch (e) {}

    // 4) update UI
    callState.setState((s) => ({ ...s, remoteStreamUpdatedAt: Date.now(), remoteScreenOn: false }));
  } catch (e) {
    console.warn("[useWebRTCHandlers] handleScreen cleanup failed", e);
  }
};


    on("call:incoming", incoming);
    on("call:start", start);
    on("call:accept", accepted);
    on("call:reject", rejected);
    on("call:end", ended);
    on("webrtc:offer", negotiation.handleOffer);
    on("webrtc:answer", negotiation.handleAnswer);
    on("webrtc:ice", negotiation.handleIce);
    on("call:camera", handleCamera);
    on("call:screen", handleScreen);

    return () => {
      off("call:incoming", incoming);
      off("call:start", start);
      off("call:accept", accepted);
      off("call:reject", rejected);
      off("call:end", ended);
      off("webrtc:offer", negotiation.handleOffer);
      off("webrtc:answer", negotiation.handleAnswer);
      off("webrtc:ice", negotiation.handleIce);
      off("call:camera", handleCamera);
      off("call:screen", handleScreen);
    };
  }, [
    user,
    on,
    off,
    send,
    callState,
    pcHooks,
    localMedia,
    screenShare,
    negotiation,
  ]);
}
