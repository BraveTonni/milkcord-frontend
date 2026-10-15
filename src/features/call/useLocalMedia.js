import { useCallback, useRef } from "react";
import { createBlackVideoTrack } from "./helpers/createBlackVideoTrack";

export function useLocalMedia({ callState, pcHooks }) {
  const localStream = useRef(null);

  const getMediaOnce = useCallback(
    async (kind = "audio") => {
      const needVideo = kind === "video" || callState.stateRef.current?.camOn;

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
        callState.setState((s) => ({ ...s, camOn: true }));
      }

      localStream.current
        .getAudioTracks()
        .forEach((t) => (t.enabled = !!callState.stateRef.current?.micOn));

      return localStream.current;
    },
    [callState]
  );

  const addLocalTracksOnce = useCallback(
    (stream) => {
      if (!pcHooks.pc.current || !stream) return;

      stream.getTracks().forEach((track) => {
        const existingSender = pcHooks.pc.current
          .getSenders()
          .find((s) => s.track && s.track.id === track.id);

        if (existingSender) {
          if (track.kind === "audio") pcHooks.tracksAdded.current.audio = true;
          if (track.kind === "video") {
            pcHooks.tracksAdded.current.video = true;
            if (!track._isBlackPlaceholder) {
              pcHooks.tracksAdded.current.cameraSender = existingSender;
            }
          }
          return;
        }

        const sameKindSender = pcHooks.pc.current
          .getSenders()
          .find((s) => s.track?.kind === track.kind);

        if (sameKindSender) {
          try {
            sameKindSender.replaceTrack(track);
            if (track.kind === "video" && !track._isBlackPlaceholder) {
              pcHooks.tracksAdded.current.cameraSender = sameKindSender;
            }
          } catch {
            pcHooks.pc.current.addTrack(track, stream);
            const sender = pcHooks.pc.current
              .getSenders()
              .find((s) => s.track?.id === track.id);

            if (track.kind === "video" && sender && !track._isBlackPlaceholder) {
              pcHooks.tracksAdded.current.cameraSender = sender;
            }
          }
        } else {
          pcHooks.pc.current.addTrack(track, stream);
          const sender = pcHooks.pc.current
            .getSenders()
            .find((s) => s.track?.id === track.id);

          if (track.kind === "video" && sender && !track._isBlackPlaceholder) {
            pcHooks.tracksAdded.current.cameraSender = sender;
          }
        }

        if (track.kind === "audio") pcHooks.tracksAdded.current.audio = true;
        if (track.kind === "video") pcHooks.tracksAdded.current.video = true;
      });
    },
    [pcHooks]
  );

  const toggleCam = useCallback(
    async (on) => {
      callState.setState((s) => ({ ...s, camOn: on }));
      callState.stateRef.current = { ...callState.stateRef.current, camOn: on };

      await getMediaOnce(on ? "video" : "audio");
      if (!localStream.current) return;

      if (on) {
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
            } catch { /* ignore */ }
          });

          const camStream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          const newTrack = camStream.getVideoTracks()[0];
          localStream.current.addTrack(newTrack);
        }
      } else {
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

      if (pcHooks.pc.current) {
        const screenSender = pcHooks.tracksAdded.current.screenSender;

        const senders = pcHooks.pc.current
          .getSenders()
          .filter((s) => s.track?.kind === "video");

        let sender = senders.find((s) => s !== screenSender);
        if (!sender) sender = senders[0];

        if (on) {
          const trackToSend = localStream.current
            .getVideoTracks()
            .find((t) => !t._isBlackPlaceholder);

          if (trackToSend) {
            if (sender) {
              try {
                await sender.replaceTrack(trackToSend);
                pcHooks.tracksAdded.current.cameraSender = sender;
              } catch {
                pcHooks.pc.current.addTrack(trackToSend, localStream.current);
                const newSender = pcHooks.pc.current
                  .getSenders()
                  .find((s) => s.track?.id === trackToSend.id);
                if (newSender) {
                  pcHooks.tracksAdded.current.cameraSender = newSender;
                }
              }
            } else {
              pcHooks.pc.current.addTrack(trackToSend, localStream.current);
              const newSender = pcHooks.pc.current
                .getSenders()
                .find((s) => s.track?.id === trackToSend.id);
              if (newSender) {
                pcHooks.tracksAdded.current.cameraSender = newSender;
              }
            }
          }
        } else {
          // === FIXED BROKEN BLOCK HERE ===
          let placeholder =
            localStream.current
              .getVideoTracks()
              .find((t) => t._isBlackPlaceholder) || null;

          if (!placeholder) {
            const black = createBlackVideoTrack();
            try {
              localStream.current.addTrack(black);
            } catch { /* ignore */ }
            placeholder = black;
          }

          try {
            if (sender) {
              await sender.replaceTrack(placeholder);

              if (pcHooks.tracksAdded.current.cameraSender === sender) {
                pcHooks.tracksAdded.current.cameraSender = sender;
              }
            } else {
              pcHooks.pc.current.addTrack(placeholder, localStream.current);
            }
          } catch (e) {
            console.warn(
              "[useLocalMedia] Error replacing camera with placeholder",
              e
            );

            if (sender) {
              try {
                pcHooks.pc.current.removeTrack(sender);
              } catch (er) {
                console.warn(
                  "[useLocalMedia] removeTrack fallback failed",
                  er
                );
              }
            }
          }
        }
      }
    },
    [callState, getMediaOnce, pcHooks]
  );

  return {
    localStream,
    getMediaOnce,
    addLocalTracksOnce,
    toggleCam,
  };
}
