import { Navigate } from "react-router-dom";
import UserAPI from "../../app/api/UserApi";

export default function NoAuthRoute({ children }) {
  const token = UserAPI.getAccessToken();

  if (token) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}
