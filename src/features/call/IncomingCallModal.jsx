import { CallEnd, Phone } from "@mui/icons-material";
import { useCall } from "./CallProvider";

export default function IncomingCallModal() {
  const { call, acceptCall, rejectCall } = useCall();
  if (!call?.incoming || !call?.withUser) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-[420px] shadow-xl text-center">
        <img src={call.withUser.avatar || call.withUser.avatar_url} className="w-20 h-20 rounded-full mx-auto mb-4 border border-gray-700" />
        <h3 className="text-2xl text-white font-semibold">{call.withUser.username}</h3>
        <p className="text-gray-400 mt-1 mb-6">Вам звонит…</p>
        <div className="flex justify-center gap-6">
          <button onClick={acceptCall} className="p-4 bg-green-600 hover:bg-green-500 rounded-full text-white shadow-lg"><Phone /></button>
          <button onClick={rejectCall} className="p-4 bg-red-600 hover:bg-red-500 rounded-full text-white shadow-lg"><CallEnd /></button>
        </div>
      </div>
    </div>
  );
}
