import { useCall } from "../../../features/call/CallContext";

export default function CallAudio() {
  const { localAudio, remoteAudio } = useCall();

  return (
    <>
      <audio ref={localAudio} muted playsInline />
      <audio ref={remoteAudio} playsInline />
    </>
  );
}
