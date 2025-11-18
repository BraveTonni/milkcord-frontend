import axios from "axios";
import BaseApi from "./BaseApi";

const API_BASE_USERS = "http://127.0.0.1:7000/api/v1/users";

class UserAPI extends BaseApi {
  // === ВХОД ===
  static async login(username, password) {
    try {
      const res = await axios.post(`${API_BASE_USERS}/login`, {
        username,
        password,
      });
      const { error, user } = res.data;
      if (error) return { error };

      if (user?.access_token) this.setAccessToken(user.access_token);
      localStorage.setItem("user", JSON.stringify(user));

      return { user };
    } catch (err) {
      console.error("Ошибка запроса /login:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  // === РЕГИСТРАЦИЯ ===
  static async register(username, email, password, confirm_password) {
    try {
      const res = await axios.post(`${API_BASE_USERS}/signup`, {
        username,
        email,
        password,
        confirm_password,
      });

      const { error, user } = res.data;
      if (error) return { error };

      if (user?.access_token) this.setAccessToken(user.access_token);
      localStorage.setItem("user", JSON.stringify(user));

      return { user };
    } catch (err) {
      console.error("Ошибка запроса /signup:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  // === ПРОФИЛЬ ===
  static async getCurrentUser() {
    try {
      const token = this.getAccessToken();
      if (!token) return { error: "Нет токена" };

      const res = await axios.get(
        `${API_BASE_USERS}/me?access_token=${encodeURIComponent(token)}`
      );
      const { error, user } = res.data;

      if (error) return { error };
      return { user };
    } catch (err) {
      console.error("Ошибка запроса /me:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  // === ПОЛЬЗОВАТЕЛЬ ПО ИМЕНИ ===
  static async getUser(identifier) {
    try {
      const res = await axios.get(`${API_BASE_USERS}/profile/${identifier}`);
      const { error, user } = res.data;

      if (error) return { error };
      return { user };
    } catch (err) {
      console.error("Ошибка запроса:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  // === ОБНОВЛЕНИЕ БИО ===
  static async updateBio(bio) {
    try {
      const token = this.getAccessToken();
      if (!token) return { error: "Нет токена" };

      const res = await axios.patch(
        `${API_BASE_USERS}/me/bio?access_token=${encodeURIComponent(token)}`,
        { bio }
      );

      const { error, user } = res.data;
      if (error) return { error };
      return { user };
    } catch (err) {
      console.error("Ошибка при обновлении био:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  // === ЗАГРУЗКА АВАТАРА ===
  static async uploadAvatar(file) {
    try {
      const token = this.getAccessToken();
      if (!token) return { error: "Нет токена" };

      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        `${API_BASE_USERS}/avatar?access_token=${encodeURIComponent(token)}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const { error, user } = res.data;
      if (error) return { error };
      return { user };
    } catch (err) {
      console.error("Ошибка при загрузке аватара:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  // === ЗАГРУЗКА ОБЛОЖКИ ===
  static async uploadCover(file) {
    try {
      const token = this.getAccessToken();
      if (!token) return { error: "Нет токена" };

      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        `${API_BASE_USERS}/cover?access_token=${encodeURIComponent(token)}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const { error, user } = res.data;
      if (error) return { error };
      return { user };
    } catch (err) {
      console.error("Ошибка при загрузке аватара:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  // === ОБНОВЛЕНИЕ НАСТРОЕК АККАУНТА ===
  static async updateSettings(payload) {
    try {
      const token = this.getAccessToken();
      if (!token) return { error: "Нет токена" };

      const res = await axios.post(
        `${API_BASE_USERS}/settings/update?access_token=${encodeURIComponent(
          token
        )}`,
        payload
      );

      return res.data; // { success: true, user: {...} }
    } catch (err) {
      console.error("Ошибка запроса /update:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  static getAvatarUrl(file) {
    return `${API_BASE_USERS}/avatar?filename=${file}`;
  }

  static getCoverUrl(file) {
    return `${API_BASE_USERS}/cover?filename=${file}`;
  }

  // === ТОКЕН ===
  static getAccessToken() {
    const match = document.cookie.match(/(^| )access_token=([^;]+)/);
    return match ? match[2] : null;
  }

  static setAccessToken(token) {
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);

    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    document.cookie =
      `access_token=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax` +
      (isLocal ? "" : "; Secure");
  }

  static logout() {
    document.cookie =
      "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("user");
  }
}

export default UserAPI;
