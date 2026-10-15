import { useCallback, useRef, useState } from "react";
import CallsAPI from "../../app/api/CallsApi";

export function useCallState() {
  const [state, setState] = useState({
    active: false,
    incoming: false,
    ringing: false,
    callId: null,
    withUser: null,
    kind: "audio",
    minimized: false,
    micOn: true,
    camOn: false,
    screenOn: false,
    remoteCamOn: false,
    remoteScreenOn: false,
    localScreenOn: false,
    remoteStreamUpdatedAt: 0,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const resetState = useCallback(() => {
    setState({
      active: false,
      incoming: false,
      ringing: false,
      callId: null,
      withUser: null,
      kind: "audio",
      minimized: false,
      micOn: true,
      camOn: false,
      screenOn: false,
      remoteCamOn: false,
      remoteScreenOn: false,
      localScreenOn: false,
      remoteStreamUpdatedAt: 0,
    });
  }, []);

  const toggleMic = useCallback((on) => {
    setState((s) => ({ ...s, micOn: on }));
    stateRef.current = { ...stateRef.current, micOn: on };
  }, []);

  const startCall = useCallback(
    async ({ user: toUser, kind = "audio" }) => {
      try {
        const res = await CallsAPI.startCall({ to_user_id: toUser.id, kind });
        if (res.error) return;
        setState((s) => ({
          ...s,
          active: false,
          incoming: false,
          ringing: true,
          callId: res.call.id,
          withUser: toUser,
          kind: res.call.kind || kind,
        }));
      } catch (e) {
        console.error("startCall error", e);
      }
    },
    []
  );

  const acceptCall = useCallback(async () => {
    // actual accept handled in negotiation/localMedia hooks because they need pc & streams
    // This function acts as a flag switch and calls API.
    if (!stateRef.current?.callId) return;
    try {
      await CallsAPI.acceptCall({ call_id: stateRef.current.callId });
      setState((prev) => ({ ...prev, incoming: false, ringing: false, active: true }));
    } catch (e) {
      console.error("acceptCall error", e);
    }
  }, []);

  const rejectCall = useCallback(async ({ send } = {}) => {
    if (stateRef.current?.callId) {
      try {
        await CallsAPI.rejectCall({ call_id: stateRef.current.callId });
        if (send) send("call:reject", { call_id: stateRef.current.callId });
      } catch (e) {
        console.error("rejectCall error", e);
      }
    }
    resetState();
  }, [resetState]);

  const endCall = useCallback(async ({ send } = {}) => {
    if (stateRef.current?.callId) {
      try {
        await CallsAPI.endCall({ call_id: stateRef.current.callId });
        if (send) send("call:end", { call_id: stateRef.current.callId });
      } catch (e) {
        console.error("endCall error", e);
      }
    }
    resetState();
  }, [resetState]);

  return {
    state,
    stateRef,
    setState,
    resetState,
    toggleMic,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
  };
}
