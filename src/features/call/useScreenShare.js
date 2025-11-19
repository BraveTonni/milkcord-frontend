import { useCallback, useRef } from "react";

export function useScreenShare({ callState, pcHooks, send }) {
  const localScreen = useRef(null);

  const addScreenTrackOnce = useCallback((screenStream) => {
    if (!pcHooks.pc.current || !screenStream) return;
    const track = screenStream.getVideoTracks()[0];
    if (!track) return;
    const existingSender = pcHooks.pc.current
      .getSenders()
      .find((s) => s.track && s.track.id === track.id);
    if (existingSender) {
      pcHooks.tracksAdded.current.screen = true;
      pcHooks.tracksAdded.current.screenSender = existingSender;
      return;
    }

    try {
      pcHooks.pc.current.addTrack(track, screenStream);
      const sender = pcHooks.pc.current
        .getSenders()
        .find((s) => s.track?.id === track.id);
      if (sender) pcHooks.tracksAdded.current.screenSender = sender;
      pcHooks.tracksAdded.current.screen = true;
    } catch (e) {
      console.warn("[useScreenShare] addTrack failed", e);
    }
  }, [pcHooks]);

  const startScreenShare = useCallback(async () => {
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track = screen.getVideoTracks()[0];
      if (!track) return;
      track._isScreenTrack = true;
      localScreen.current = screen;
      callState.setState((s) => ({ ...s, localScreenOn: true }));
      addScreenTrackOnce(screen);

      track.onended = async () => {
        await stopScreenShare();
      };

      if (callState.stateRef.current?.active) {
        send("call:screen", {
          call_id: callState.stateRef.current.callId,
          enabled: true,
        });
        // renegotiate is handled in negotiation hook
      }
    } catch (e) {
      console.warn("[useScreenShare] startScreenShare failed", e);
    }
  }, [addScreenTrackOnce, callState, send]);

  const stopScreenShare = useCallback(async () => {
    try {
      if (localScreen.current) {
        localScreen.current.getTracks().forEach((t) => t.stop());
        localScreen.current = null;
      }

      callState.setState((s) => ({ ...s, localScreenOn: false }));

      if (pcHooks.pc.current) {
        const screenSender = pcHooks.tracksAdded.current.screenSender;
        if (screenSender) {
          try {
            await screenSender.replaceTrack(null);
          } catch (e) {
            console.warn("[useScreenShare] replaceTrack(null) failed", e);
          }
          pcHooks.tracksAdded.current.screenSender = null;
        }
      }

      if (callState.stateRef.current?.active) {
        send("call:screen", {
          call_id: callState.stateRef.current.callId,
          enabled: false,
        });
        // renegotiate is handled in negotiation hook
      }
    } catch (e) {
      console.warn("[useScreenShare] stopScreenShare failed", e);
    }
  }, [pcHooks, callState, send]);

  return {
    localScreen,
    addScreenTrackOnce,
    startScreenShare,
    stopScreenShare,
  };
}
