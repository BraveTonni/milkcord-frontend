// CallWindow.jsx
import React, { useEffect, useRef } from "react";
import {
  Close,
  Mic,
  MicOff,
  ScreenShare,
  CallEnd,
  FullscreenExit,
  StopScreenShare,
} from "@mui/icons-material";
import { useCall } from "./CallProvider";

export default function CallWindow() {
  const {
    call,
    endCall,
    acceptCall,
    rejectCall,
    localStream,
    remoteStream,
    localScreen,
    remoteScreen,
    toggleMic,
    startScreenShare,
    stopScreenShare,
  } = useCall();

  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const localScreenVideo = useRef(null);
  const remoteScreenVideo = useRef(null);

  const visible = call && (call.active || call.incoming || call.ringing);

  useEffect(() => {
    if (localVideo.current && localStream.current) {
      localVideo.current.srcObject = localStream.current;
    } else if (localVideo.current) {
      localVideo.current.srcObject = null;
    }
  }, [call.camOn, call.active, call.callId]);

  useEffect(() => {
    if (localScreenVideo.current && localScreen.current) {
      localScreenVideo.current.srcObject = localScreen.current;
    } else if (localScreenVideo.current) {
      localScreenVideo.current.srcObject = null;
    }
  }, [call.localScreenOn, call.callId]);

  useEffect(() => {
    // main remote area: if remoteScreenOn -> show remoteScreen, else remoteStream
    if (remoteVideo.current) {
      const stream = call.remoteScreenOn ? remoteScreen.current : remoteStream.current;
      if (stream) {
        remoteVideo.current.srcObject = stream;
      } else {
        remoteVideo.current.srcObject = null;
      }
    }
  }, [call.remoteStreamUpdatedAt, call.remoteScreenOn, call.callId]);

  useEffect(() => {
    if (remoteScreenVideo.current) {
      if (remoteScreen.current) {
        remoteScreenVideo.current.srcObject = remoteScreen.current;
      } else {
        remoteScreenVideo.current.srcObject = null;
      }
    }
  }, [call.remoteStreamUpdatedAt, call.remoteScreenOn, call.callId]);

  const handleToggleMic = () => {
    const newState = !call.micOn;
    toggleMic(newState);
  };

  const handleToggleScreen = async () => {
    if (call.localScreenOn) {
      await stopScreenShare();
    } else {
      await startScreenShare();
    }
  };

  if (!call.active) return <></>

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 
      ${visible ? "block" : "hidden"}`}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-[920px] text-center space-y-5 shadow-xl relative">
        <button
          onClick={endCall}
          className="absolute right-4 top-4 text-gray-400 hover:text-red-500 transition"
        >
          <Close />
        </button>

        <h3 className="text-xl text-lime-400 font-semibold">
          {call.withUser?.username || "Вызов"}
        </h3>

        <p className="text-gray-400 text-sm">
          {call.incoming
            ? "Входящий звонок"
            : call.ringing
            ? "Звоню..."
            : "Вызов"}
        </p>

        <div className="flex gap-4 justify-center items-start">
          <div className="flex-1 flex flex-col gap-3">
            <div className="rounded-md bg-black/40 overflow-hidden" style={{height: 360}}>
              <video
                ref={remoteVideo}
                autoPlay
                playsInline
                className="w-full h-full object-contain bg-black"
              />
            </div>

            <div className="flex gap-3 mt-2">
              <div className="w-40 h-24 rounded-md overflow-hidden bg-black/20">
                <video
                  ref={localVideo}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>

              <div className={`w-64 h-24 rounded-md overflow-hidden bg-black/20 ${call.localScreenOn ? "" : "hidden"}`}>
                <video
                  ref={localScreenVideo}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>

              <div className={`w-64 h-24 rounded-md overflow-hidden bg-black/20 ${call.remoteScreenOn ? "" : "hidden"}`}>
                <video
                  ref={remoteScreenVideo}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={handleToggleMic}
            className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 text-white"
            title={call.micOn ? "Выкл. микрофон" : "Вкл. микрофон"}
          >
            {call.micOn ? <Mic /> : <MicOff />}
          </button>

          <button
            onClick={handleToggleScreen}
            className={`p-3 rounded-full bg-gray-800 hover:bg-gray-700 text-white ${call.localScreenOn ? "ring-2 ring-lime-400" : ""}`}
            title={call.localScreenOn ? "Остановить демонстрацию" : "Демонстрация экрана"}
          >
            <ScreenShare />
          </button>

          <button
            onClick={endCall}
            className="p-3 rounded-full bg-red-600 hover:bg-red-500 text-white"
          >
            <CallEnd />
          </button>

          <button className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 text-white">
            <FullscreenExit />
          </button>
        </div>

        {call.incoming && (
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={acceptCall}
              className="px-4 py-2 bg-green-600 rounded"
            >
              Принять
            </button>
            <button
              onClick={rejectCall}
              className="px-4 py-2 bg-gray-700 rounded"
            >
              Отклонить
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
