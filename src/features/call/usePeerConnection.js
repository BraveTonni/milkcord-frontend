import { useCallback, useRef } from "react";

export function usePeerConnection({ callState, send }) {
  const pc = useRef(null);
  const remoteStream = useRef(null);
  const remoteScreen = useRef(null);
  const tracksAdded = useRef({ audio: false, video: false, screen: false });

  const createPeerConnection = useCallback(() => {
    if (pc.current) return pc.current;

    pc.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    pc.current.onicecandidate = (e) => {
      if (e.candidate && callState.stateRef.current?.callId) {
        send("webrtc:ice", {
          call_id: callState.stateRef.current.callId,
          candidate: e.candidate,
        });
      }
    };

    pc.current.ontrack = (e) => {
  const stream = e.streams && e.streams[0];
  if (!stream) return;

  // Attach onended handlers to tracks so we react when sender stops/removes them
  stream.getTracks().forEach((track) => {
    if (!track.__onended_bound) {
      track.__onended_bound = true;
      track.onended = () => {
        if (track.kind === "video") {
          // Clean up appropriate remote stream references
          if (callState.stateRef.current?.remoteScreenOn) {
            if (remoteScreen.current) {
              remoteScreen.current.getTracks().forEach(t => { try { t.stop(); } catch { /* ignore */ } });
              remoteScreen.current = null;
            }
          } else {
            if (remoteStream.current) {
              remoteStream.current.getTracks().forEach(t => { try { t.stop(); } catch { /* ignore */ } });
              remoteStream.current = null;
            }
          }
          callState.setState((s) => ({ ...s, remoteStreamUpdatedAt: Date.now() }));
        }
      };
    }
  });

  const vidTracks = stream.getVideoTracks() || [];

  if (vidTracks.length === 0) {
    // audio-only stream
    if (remoteStream.current !== stream) {
      // stop previous audio stream tracks if different
      if (remoteStream.current && remoteStream.current.id !== stream.id) {
        remoteStream.current.getTracks().forEach(t => { try { t.stop(); } catch { /* ignore */ } });
      }
      remoteStream.current = stream;
    }
    callState.setState((s) => ({ ...s, remoteStreamUpdatedAt: Date.now() }));
  } else {
    // video present: decide if this is screen or camera
    if (callState.stateRef.current?.remoteScreenOn) {
      if (remoteScreen.current && remoteScreen.current.id !== stream.id) {
        remoteScreen.current.getTracks().forEach(t => { try { t.stop(); } catch { /* ignore */ } });
      }
      remoteScreen.current = stream;
      callState.setState((s) => ({ ...s, remoteStreamUpdatedAt: Date.now() }));
    } else {
      if (remoteStream.current && remoteStream.current.id !== stream.id) {
        remoteStream.current.getTracks().forEach(t => { try { t.stop(); } catch { /* ignore */ } });
      }
      remoteStream.current = stream;
      callState.setState((s) => ({ ...s, remoteStreamUpdatedAt: Date.now() }));
    }
  }

};


    pc.current.onconnectionstatechange = () => {
      if (
        pc.current?.connectionState === "failed" ||
        pc.current?.connectionState === "closed"
      ) {
        // leave cleanup to resetState
        console.warn("[usePeerConnection] connection failed/closed");
      }
    };

    tracksAdded.current = { audio: false, video: false, screen: false };
    return pc.current;
  }, [callState, send]);

  return {
    pc,
    createPeerConnection,
    remoteStream,
    remoteScreen,
    tracksAdded,
  };
}
