import { Routes, Route } from "react-router-dom";
import HomePage from "../../pages/HomePage";
import Page404 from "../../pages/errors/Page404";
import Maintenance from "../../pages/errors/Maintenance";
import RegisterPage from "../../pages/RegisterPage";
import LoginPage from "../../pages/LoginPage";
import Profile from "../../pages/Profile/Profile";
import NoAuthRoute from "../../components/Auth/NoAuthRoute.jsx";
import ProtectedRoute from "../../components/Auth/ProtectedRoute.jsx";
import ProfileMessenger from "../../pages/Profile/Messenger/ProfileMessenger.jsx";
import ProfileMusic from "../../pages/Profile/Music/ProfileMusic.jsx";
import ProfileSettings from "../../pages/settings/ProfileSettings.jsx";

export default function RouterProvider() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route
        path="/login"
        element={
          <NoAuthRoute>
            <LoginPage />
          </NoAuthRoute>
        }
      />

      <Route
        path="/register"
        element={
          <NoAuthRoute>
            <RegisterPage />
          </NoAuthRoute>
        }
      />

      <Route
        path="/profile/*"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <ProfileSettings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/messenger"
        element={
          <ProtectedRoute>
            <ProfileMessenger />
          </ProtectedRoute>
        }
      />

      <Route
        path="/messenger/:urlId"
        element={
          <ProtectedRoute>
            <ProfileMessenger />
          </ProtectedRoute>
        }
      />

      <Route
        path="/music"
        element={
          <ProtectedRoute>
            <ProfileMusic />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Page404 />} />
      <Route path="/404" element={<Page404 />} />
      <Route path="/maintenance" element={<Maintenance />} />
    </Routes>
  );
}
