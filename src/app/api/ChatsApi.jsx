import axios from "axios";
import BaseApi from "./BaseApi";
import API_BASE_URL from "../config";

const API_BASE_CHATS = `${API_BASE_URL}/api/v1/chats`;

class ChatsAPI extends BaseApi {
  // === ЧАТЫ ===

  static async getAllChats() {
    try {
      const token = this.getAccessToken();
      const res = await axios.get(
        `${API_BASE_CHATS}/all?access_token=${encodeURIComponent(token)}`
      );
      const { error, chats } = res.data;
      if (error) return { error };
      return { chats };
    } catch (err) {
      console.error("Ошибка при получении чатов:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  static async getChat(user_id) {
    try {
      const token = this.getAccessToken();
      const res = await axios.get(
        `${API_BASE_CHATS}/chat/${user_id}?access_token=${encodeURIComponent(token)}`
      );

      const { error } = res.data;
      if (error) return { error };
      return res.data;
    } catch (err) {
      console.error("Ошибка при получении чата:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  // === ТОКЕН ===
  static getAccessToken() {
    const match = document.cookie.match(/(^| )access_token=([^;]+)/);
    return match ? match[2] : null;
  }

  static setAccessToken(token) {
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    document.cookie = `access_token=${token}; expires=${expires.toUTCString()}; path=/; Secure; SameSite=Lax`;
  }

  static logout() {
    document.cookie =
      "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("user");
  }
}

export default ChatsAPI;