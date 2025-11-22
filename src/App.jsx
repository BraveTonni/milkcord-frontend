import Layout from "./components/Layout";
import { BrowserRouter } from "react-router-dom";
import { useEffect } from "react";

import animateTitle from "./features/Title";
import { AuthProvider } from "./app/providers/AuthProvider";
import { WebSocketProvider } from "./app/providers/WebSocketProvider";

import { CallProvider } from "./features/call/CallProvider";
import CallWindow from "./features/call/CallWindow";
import IncomingCallModal from "./features/call/IncomingCallModal";
import OutgoingCallModal from "./features/call/OutgoingCallModal";

export default function App() {
  useEffect(() => {
    animateTitle();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <WebSocketProvider>
          <CallProvider>
            <Layout />

            {/* UI звонков */}
            <CallWindow />
            <IncomingCallModal />
            <OutgoingCallModal />
          </CallProvider>
        </WebSocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
