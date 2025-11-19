import { Navigate } from "react-router-dom";
import UserAPI from "../../app/api/UserApi";

export default function ProtectedRoute({ children }) {
  const token = UserAPI.getAccessToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
