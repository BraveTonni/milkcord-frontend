import { useParams, Navigate } from "react-router-dom";
import ProfileMe from "./Me/ProfileMe";
import ProfileOther from "./Me/ProfileOther";

export default function Profile() {
  const { "*": wildcard } = useParams();

  if (!wildcard || wildcard === "") {
    return <ProfileMe />;
  }

  // Если есть что-то после /profile/
  const username = wildcard.split("/")[0];

  // Опционально: если есть лишнее — 404
  if (wildcard.includes("/") && wildcard.split("/")[1]) {
    return <Navigate to="/404" replace />;
  }

  return <ProfileOther username={username} />;
}