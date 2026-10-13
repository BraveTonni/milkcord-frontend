import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import CallsAPI from "../../app/api/CallsApi";
import { useWebSocket } from "../../app/providers/WebSocketProvider";
import { useAuth } from "../../app/providers/AuthProvider";

const CallContext = createContext(null);

export function CallProvider({ children }) {
  const { user } = useAuth();
  const { send, on, off } = useWebSocket();

  const pc = useRef(null);
  const remoteStream = useRef(null);
  const remoteScreen = useRef(null);
  const localStream = useRef(null);
  const localScreen = useRef(null);
  const stateRef = useRef(null);

  const tracksAdded = useRef({ audio: false, video: false, screen: false });

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

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const createPeerConnection = useCallback(() => {
    if (pc.current) return;

    pc.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    pc.current.onicecandidate = (e) => {
      if (e.candidate && stateRef.current?.callId) {
        send("webrtc:ice", {
          call_id: stateRef.current.callId,
          candidate: e.candidate,
        });
      }
    };

    pc.current.ontrack = (e) => {
      const stream = e.streams[0];
      const vidTracks = stream?.getVideoTracks() || [];
      if (vidTracks.length === 0) {
        // only audio
        if (remoteStream.current !== stream) {
          remoteStream.current = stream;
          setState((s) => ({ ...s, remoteStreamUpdatedAt: Date.now() }));
        } else {
          setState((s) => ({ ...s, remoteStreamUpdatedAt: Date.now() }));
        }
      } else {
        // If remote indicated screen is on, prefer mapping to remoteScreen, otherwise to remoteStream.
        if (stateRef.current?.remoteScreenOn) {
          remoteScreen.current = stream;
          setState((s) => ({ ...s, remoteStreamUpdatedAt: Date.now() }));
        } else {
          remoteStream.current = stream;
          setState((s) => ({ ...s, remoteStreamUpdatedAt: Date.now() }));
        }
      }
    };

    tracksAdded.current = { audio: false, video: false, screen: false };
  }, [send]);

  const getMediaOnce = useCallback(async (kind = "audio") => {
    const needVideo = kind === "video" || stateRef.current?.camOn;
    if (!localStream.current) {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: needVideo,
      });
      localStream.current = stream;
      return stream;
    }

    if (needVideo && localStream.current.getVideoTracks().length === 0) {
      const v = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      v.getVideoTracks().forEach((t) => localStream.current.addTrack(t));
      setState((s) => ({ ...s, camOn: true }));
    }

    localStream.current
      .getAudioTracks()
      .forEach((t) => (t.enabled = !!stateRef.current?.micOn));
    return localStream.current;
  }, []);

  const addLocalTracksOnce = useCallback(
    (stream) => {
      if (!pc.current || !stream) return;

      stream.getTracks().forEach((track) => {
        const existingSender = pc.current
          .getSenders()
          .find((s) => s.track && s.track.id === track.id);
        if (existingSender) {
          if (track.kind === "audio") tracksAdded.current.audio = true;
          if (track.kind === "video") {
            tracksAdded.current.video = true;
            // если это не placeholder - запомнить как cameraSender
            if (!track._isBlackPlaceholder) {
              tracksAdded.current.cameraSender = existingSender;
            }
          }
          return;
        }

        const sameKindSender = pc.current
          .getSenders()
          .find((s) => s.track?.kind === track.kind);

        if (sameKindSender) {
          try {
            sameKindSender.replaceTrack(track);
            if (track.kind === "video" && !track._isBlackPlaceholder) {
              tracksAdded.current.cameraSender = sameKindSender;
            }
          } catch {
            pc.current.addTrack(track, stream);
            const sender = pc.current
              .getSenders()
              .find((s) => s.track?.id === track.id);
            if (
              track.kind === "video" &&
              sender &&
              !track._isBlackPlaceholder
            ) {
              tracksAdded.current.cameraSender = sender;
            }
          }
        } else {
          pc.current.addTrack(track, stream);
          const sender = pc.current
            .getSenders()
            .find((s) => s.track?.id === track.id);
          if (track.kind === "video" && sender && !track._isBlackPlaceholder) {
            tracksAdded.current.cameraSender = sender;
          }
        }

        if (track.kind === "audio") tracksAdded.current.audio = true;
        if (track.kind === "video") tracksAdded.current.video = true;
      });

    },
    []
  );

  const addScreenTrackOnce = useCallback(
    (screenStream) => {
      if (!pc.current || !screenStream) return;
      const track = screenStream.getVideoTracks()[0];
      if (!track) return;
      const existingSender = pc.current
        .getSenders()
        .find((s) => s.track && s.track.id === track.id);
      if (existingSender) {
        tracksAdded.current.screen = true;
        tracksAdded.current.screenSender = existingSender;
        return;
      }

      try {
        pc.current.addTrack(track, screenStream);
        // сразу найдём sender и запомним его
        const sender = pc.current
          .getSenders()
          .find((s) => s.track?.id === track.id);
        if (sender) {
          tracksAdded.current.screenSender = sender;
        }
        tracksAdded.current.screen = true;
      } catch (e) {
        console.warn("[CallContext] addScreenTrackOnce addTrack failed", e);
      }

    },
    []
  );

  const toggleMic = useCallback((on) => {
    setState((s) => ({ ...s, micOn: on }));
    stateRef.current = { ...stateRef.current, micOn: on };
    localStream.current?.getAudioTracks().forEach((t) => (t.enabled = on));
  }, []);

  const renegotiate = useCallback(async () => {
    if (!pc.current || !stateRef.current?.active) return;
    try {
      // Ensure we have recv transceivers for video (camera) and screen if remote expects them
      // Add one recvonly for camera and one recvonly for screen if not present and remote may send them
      const transceivers = pc.current.getTransceivers();
      const recvVideoCount = transceivers.filter(
        (t) =>
          t.receiver && t.receiver.track && t.receiver.track.kind === "video"
      ).length;
      // Add at least one recvonly for video if none
      if (recvVideoCount < 1) {
        try {
          pc.current.addTransceiver("video", { direction: "recvonly" });
        } catch {
          /*ignore*/
        }
      }
      // Optionally add second recvonly for screen if remoteScreenOn likely true
      if (stateRef.current?.remoteScreenOn) {
        try {
          pc.current.addTransceiver("video", { direction: "recvonly" });
        } catch {
          /*ignore*/
        }
      }

      const offer = await pc.current.createOffer();
      await pc.current.setLocalDescription(offer);
      send("webrtc:offer", { call_id: stateRef.current.callId, sdp: offer });
    } catch (e) {
      console.error("[CallContext] Error during renegotiate:", e);
    }
  }, [send]);

  const startScreenShare = useCallback(async () => {
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      // Пометить трек как screen
      const track = screen.getVideoTracks()[0];
      track._isScreenTrack = true;

      localScreen.current = screen;
      setState((s) => ({ ...s, localScreenOn: true }));
      addScreenTrackOnce(screen);

      track.onended = async () => {
        await stopScreenShare();
      };

      if (stateRef.current?.active) {
        send("call:screen", {
          call_id: stateRef.current.callId,
          enabled: true,
        });
        await renegotiate();
      }
    } catch (e) {
      console.warn("[CallContext] startScreenShare failed", e);
    }
  }, [addScreenTrackOnce, send, renegotiate]);

  const stopScreenShare = useCallback(async () => {
    try {
      if (localScreen.current) {
        localScreen.current.getTracks().forEach((t) => t.stop());
        localScreen.current = null;
      }

      setState((s) => ({ ...s, localScreenOn: false }));

      if (pc.current) {
        const screenSender = tracksAdded.current.screenSender;

        if (screenSender) {
          // просто убираем screen-track, НЕ подставляем камеру
          try {
            await screenSender.replaceTrack(null);
          } catch (e) {
            console.warn("replaceTrack(null) failed", e);
          }

          tracksAdded.current.screenSender = null;
        }
      }

      if (stateRef.current?.active) {
        send("call:screen", {
          call_id: stateRef.current.callId,
          enabled: false,
        });
        await renegotiate();
      }
    } catch (e) {
      console.warn("stopScreenShare failed", e);
    }
  }, [send, renegotiate]);

  const toggleCam = useCallback(
    async (on) => {
      setState((s) => ({ ...s, camOn: on }));
      stateRef.current = { ...stateRef.current, camOn: on };

      await getMediaOnce(on ? "video" : "audio");
      if (!localStream.current) return;

      if (on) {
        // --- включаем камеру: получаем или создаём трек и заменяем placeholder у sender'ов ---
        const videoTracks = localStream.current.getVideoTracks();

        const existingTrack = videoTracks.find(
          (track) => track.readyState === "live" && !track._isBlackPlaceholder
        );

        if (!existingTrack) {
          const oldVideoTracks = localStream.current.getVideoTracks();
          oldVideoTracks.forEach((track) => {
            track.stop();
            try {
              localStream.current.removeTrack(track);
            } catch {
              /*ignore*/
            }
          });

          const camStream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          const newTrack = camStream.getVideoTracks()[0];
          localStream.current.addTrack(newTrack);
        }
      } else {
        // --- отключаем камеру: НЕ оставляем "последний кадр", а заменяем отправляемый трек на placeholder ---
        // выключаем/останавливаем локальную камеру треки, но сначала заменяем sender'ы
        const videoTracksToRemove = localStream.current
          .getVideoTracks()
          .filter((t) => !t._isBlackPlaceholder);
        videoTracksToRemove.forEach((t) => {
          try {
            t.enabled = false;
          } catch { /* ignore */ }
          try {
            t.stop();
          } catch { /* ignore */ }
          try {
            localStream.current.removeTrack(t);
          } catch { /* ignore */ }
        });
      }

      // ... внутри toggleCam, перед работой с pc.current:
      if (pc.current) {
        // exclude screenSender if we know it
        const screenSender = tracksAdded.current.screenSender;
        const senders = pc.current
          .getSenders()
          .filter((s) => s.track?.kind === "video");
        // prefer sender that is not the screenSender
        let sender = senders.find((s) => s !== screenSender);
        if (!sender) {
          // fallback to any video sender
          sender = senders[0];
        }

        if (on) {
          const trackToSend = localStream.current
            .getVideoTracks()
            .find((t) => !t._isBlackPlaceholder);
          if (trackToSend) {
            if (sender) {
              try {
                await sender.replaceTrack(trackToSend);
                // запомним, что этот sender — cameraSender (теперь он отправляет реальную камеру)
                tracksAdded.current.cameraSender = sender;
              } catch (e) {
                console.warn(
                  "[CallContext] replaceTrack failed, adding new track",
                  e
                );
                pc.current.addTrack(trackToSend, localStream.current);
                const newSender = pc.current
                  .getSenders()
                  .find((s) => s.track?.id === trackToSend.id);
                if (newSender) tracksAdded.current.cameraSender = newSender;
              }
            } else {
              pc.current.addTrack(trackToSend, localStream.current);
              const newSender = pc.current
                .getSenders()
                .find((s) => s.track?.id === trackToSend.id);
              if (newSender) tracksAdded.current.cameraSender = newSender;
            }
            await renegotiate();
          }
        } else {
          // выключаем камеру — ставим placeholder на cameraSender
          try {
            let placeholder = localStream.current
              .getVideoTracks()
              .find((t) => t._isBlackPlaceholder);
            if (!placeholder) {
              const black = createBlackVideoTrack();
              try {
                localStream.current.addTrack(black);
              } catch {
                /*ignore*/
              }
              placeholder = black;
            }

            if (sender) {
              await sender.replaceTrack(placeholder);
              // если sender был cameraSender — обновим запись
              if (tracksAdded.current.cameraSender === sender) {
                tracksAdded.current.cameraSender = sender;
              }
            } else {
              try {
                pc.current.addTrack(placeholder, localStream.current);
              } catch {
                /*ignore*/
              }
            }

            await renegotiate();
          } catch (e) {
            console.warn(
              "[CallContext] Error replacing camera with placeholder",
              e
            );
            if (sender) {
              try {
                pc.current.removeTrack(sender);
                await renegotiate();
              } catch (er) {
                console.warn("[CallContext] removeTrack fallback failed", er);
              }
            }
          }
        }
      }

      if (stateRef.current?.callId && stateRef.current?.active) {
        send("call:camera", { call_id: stateRef.current.callId, enabled: on });
      }

    },
    [getMediaOnce, send, renegotiate]
  );

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

    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach((t) => t.stop());
      localStream.current = null;
    }
    if (localScreen.current) {
      localScreen.current.getTracks().forEach((t) => t.stop());
      localScreen.current = null;
    }
    remoteStream.current = null;
    remoteScreen.current = null;
    tracksAdded.current = { audio: false, video: false, screen: false };
  }, []);

  const startCall = useCallback(
    async ({ user: toUser, kind = "audio" }) => {
      if (!user) return;
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
    },
    [user]
  );

  const acceptCall = useCallback(async () => {
    if (!user || !stateRef.current?.callId) return;
    await CallsAPI.acceptCall({ call_id: stateRef.current.callId });

    const stream = await getMediaOnce(stateRef.current.kind);
    stream
      .getAudioTracks()
      .forEach((t) => (t.enabled = stateRef.current.micOn));
    if (stateRef.current.kind === "video") {
      stream
        .getVideoTracks()
        .forEach((t) => (t.enabled = stateRef.current.camOn));
    }

    createPeerConnection();
    addLocalTracksOnce(stream);

    // if local screen is on already, add its track
    if (localScreen.current) {
      addScreenTrackOnce(localScreen.current);
    }

    setState((prev) => ({
      ...prev,
      incoming: false,
      ringing: false,
      active: true,
    }));
  }, [
    user,
    getMediaOnce,
    createPeerConnection,
    addLocalTracksOnce,
    addScreenTrackOnce,
  ]);

  const rejectCall = useCallback(async () => {
    if (stateRef.current?.callId) {
      await CallsAPI.rejectCall({ call_id: stateRef.current.callId });
      send("call:reject", { call_id: stateRef.current.callId });
    }
    resetState();
  }, [send, resetState]);

  const endCall = useCallback(async () => {
    if (stateRef.current?.callId) {
      await CallsAPI.endCall({ call_id: stateRef.current.callId });
      send("call:end", { call_id: stateRef.current.callId });
    }
    resetState();
  }, [send, resetState]);

  const handleOffer = useCallback(
    async (payload) => {
      if (!payload?.sdp || !stateRef.current?.callId) return;

      createPeerConnection();
      const stream = await getMediaOnce(stateRef.current.kind);
      addLocalTracksOnce(stream);
      if (localScreen.current) addScreenTrackOnce(localScreen.current);

      await pc.current.setRemoteDescription(
        new RTCSessionDescription(payload.sdp)
      );

      try {
        pc.current.addTransceiver("video", { direction: "recvonly" });
        if (stateRef.current?.remoteScreenOn)
          pc.current.addTransceiver("video", { direction: "recvonly" });
      } catch { /* ignore */ }

      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      send("webrtc:answer", { call_id: stateRef.current.callId, sdp: answer });
    },
    [
      getMediaOnce,
      createPeerConnection,
      addLocalTracksOnce,
      send,
      addScreenTrackOnce,
    ]
  );

  const handleAnswer = useCallback(
    async (payload) => {
      if (!payload?.sdp || !pc.current) return;
      await pc.current.setRemoteDescription(
        new RTCSessionDescription(payload.sdp)
      );
    },
    []
  );

  const handleIce = useCallback(async (payload) => {
    if (!payload?.candidate || !pc.current) return;
    try {
      await pc.current.addIceCandidate(payload.candidate);
    } catch (e) {
      console.error("[CallContext] Error adding ICE candidate:", e);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const incoming = (payload) => {
      setState((s) => ({
        ...s,
        incoming: true,
        ringing: true,
        callId: payload.call_id,
        withUser: payload.from_user || payload.from,
        kind: payload.kind || "audio",
      }));
    };

    const start = (payload) => {
      setState((s) => ({
        ...s,
        ringing: true,
        callId: payload.call_id,
        withUser: payload.to_user || payload.to,
        kind: payload.kind || "audio",
      }));
    };

    const accepted = async (payload) => {
      if (payload.from !== stateRef.current.withUser?.id) return;

      setState((prev) => ({ ...prev, ringing: false, active: true }));

      const stream = await getMediaOnce(stateRef.current.kind);
      stream
        .getAudioTracks()
        .forEach((t) => (t.enabled = stateRef.current.micOn));
      if (stateRef.current.kind === "video") {
        stream
          .getVideoTracks()
          .forEach((t) => (t.enabled = stateRef.current.camOn));
      }

      createPeerConnection();
      addLocalTracksOnce(stream);
      if (localScreen.current) addScreenTrackOnce(localScreen.current);

      try {
        pc.current.addTransceiver("video", { direction: "recvonly" });
        if (stateRef.current?.remoteScreenOn)
          pc.current.addTransceiver("video", { direction: "recvonly" });
      } catch { /* ignore */ }

      const offer = await pc.current.createOffer();
      await pc.current.setLocalDescription(offer);
      send("webrtc:offer", { call_id: stateRef.current.callId, sdp: offer });
    };

    const rejected = () => resetState();
    const ended = () => resetState();

    const handleCamera = (payload) => {
      setState((s) => ({ ...s, remoteCamOn: payload.enabled }));
      if (payload.enabled && stateRef.current?.active) renegotiate();
    };

    const handleScreen = (payload) => {
      setState((s) => ({ ...s, remoteScreenOn: payload.enabled }));
      if (payload.enabled && stateRef.current?.active) {
        // add transceiver and renegotiate to receive screen
        renegotiate();
      } else if (!payload.enabled) {
        // remote stopped screen; clear remoteScreen
        remoteScreen.current = null;
        setState((s) => ({ ...s, remoteStreamUpdatedAt: Date.now() }));
      }
    };

    on("call:incoming", incoming);
    on("call:start", start);
    on("call:accept", accepted);
    on("call:reject", rejected);
    on("call:end", ended);
    on("webrtc:offer", handleOffer);
    on("webrtc:answer", handleAnswer);
    on("webrtc:ice", handleIce);
    on("call:camera", handleCamera);
    on("call:screen", handleScreen);

    return () => {
      off("call:incoming", incoming);
      off("call:start", start);
      off("call:accept", accepted);
      off("call:reject", rejected);
      off("call:end", ended);
      off("webrtc:offer", handleOffer);
      off("webrtc:answer", handleAnswer);
      off("webrtc:ice", handleIce);
      off("call:camera", handleCamera);
      off("call:screen", handleScreen);
    };
  }, [
    user,
    on,
    off,
    getMediaOnce,
    createPeerConnection,
    addLocalTracksOnce,
    handleOffer,
    handleAnswer,
    handleIce,
    resetState,
    send,
    renegotiate,
    addScreenTrackOnce,
  ]);

  return (
    <CallContext.Provider
      value={{
        call: state,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        localStream,
        remoteStream,
        localScreen,
        remoteScreen,
        toggleMic,
        toggleCam,
        startScreenShare,
        stopScreenShare,
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  return useContext(CallContext);
}

// helper: создаёт "чёрный" видео трек через canvas.captureStream
function createBlackVideoTrack({ width = 640, height = 480, fps = 15 } = {}) {
  // создаём canvas, рисуем чёрный фон и по таймеру обновляем (чтобы были фреймы)
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

  // для анимации (обновление кадра) используем setInterval — достаточно fps
  const interval = setInterval(() => {
    // можно добавить небольшой "пульс" или текст "camera off", если нужно
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
  }, 1000 / fps);

  const stream = canvas.captureStream(fps);
  const track = stream.getVideoTracks()[0];

  // при остановке трека — чистим интервал
  const origStop = track.stop.bind(track);
  track.stop = () => {
    clearInterval(interval);
    origStop();
  };

  // пометим, что это placeholder, чтобы отличать от реальной камеры
  track._isBlackPlaceholder = true;

  return track;
}
