import { createRoot } from "react-dom/client";
import App from "./App.jsx";

import "./app/styles/index.css";
import "./app/styles/scrollbar.css";
import "./app/styles/toast.css";

createRoot(document.getElementById("root")).render(<App />);
