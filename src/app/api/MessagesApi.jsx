import axios from "axios";
import BaseApi from "./BaseApi";

const API_BASE_MESSAGES = "http://127.0.0.1:7000/api/v1/messages";

class MessagesApi extends BaseApi {
  static async getMessages(chat_id) {
    try {
      const token = this.getAccessToken();
      const res = await axios.get(
        `${API_BASE_MESSAGES}/${chat_id}/messages?access_token=${encodeURIComponent(
          token
        )}`
      );
      const { error } = res.data;
      if (error) return { error };
      return res.data;
    } catch (err) {
      console.error("Ошибка при получении сообщений:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  static async sendMessage(to_user_id, content) {
    try {
      const token = this.getAccessToken();
      const res = await axios.post(
        `${API_BASE_MESSAGES}/send?access_token=${encodeURIComponent(token)}`,
        { to_user_id, content }
      );
      const { error, message } = res.data;
      if (error) return { error };
      return { message };
    } catch (err) {
      console.error("Ошибка при отправке сообщения:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  static async sendSticker(to_user_id, pack_slug, sticker_slug) {
    try {
      const token = this.getAccessToken();
      if (!token) {
        return { error: "Токен авторизации отсутствует" };
      }

      const res = await axios.post(
        `${API_BASE_MESSAGES}/send/sticker?access_token=${encodeURIComponent(
          token
        )}`,
        {
          to_user_id,
          pack_slug,
          sticker_slug,
          content: "",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { error, message } = res.data;
      if (error) return { error };

      return { message };
    } catch (err) {
      console.error("Ошибка сети при отправке стикера:", err);
      return { error: "Не удалось отправить стикер" };
    }
  }

  // === 🎉 ОТПРАВКА ФАЙЛА ===
  static async sendFileMessage(to_user_id, file) {
    try {
      const token = this.getAccessToken();
      if (!token) {
        return { error: "Нет токена авторизации" };
      }

      const formData = new FormData();
      formData.append("access_token", token);
      formData.append("to_user_id", to_user_id);

      // ВАЖНО: бекенд ждёт строго "files"
      formData.append("files", file);

      const res = await axios.post(`${API_BASE_MESSAGES}/send/file`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data;
    } catch (err) {
      console.error("Ошибка при отправке файла:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  // === ✏️ РЕДАКТИРОВАНИЕ СООБЩЕНИЯ ===
  static async editMessage(message_id, new_text) {
    try {
      const token = this.getAccessToken();
      if (!token) return { error: "Нет токена авторизации" };

      const formData = new FormData();
      formData.append("access_token", token);
      formData.append("message_id", message_id);
      formData.append("new_text", new_text);

      const res = await axios.post(`${API_BASE_MESSAGES}/edit`, formData);

      const { error } = res.data;
      if (error) return { error };

      return { success: true };
    } catch (err) {
      console.error("Ошибка при редактировании сообщения:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  // === 🗑️ УДАЛЕНИЕ СООБЩЕНИЯ ===
  static async deleteMessage(message_id) {
    try {
      const token = this.getAccessToken();
      if (!token) return { error: "Нет токена авторизации" };

      const formData = new FormData();
      formData.append("access_token", token);
      formData.append("message_id", message_id);

      const res = await axios.post(`${API_BASE_MESSAGES}/delete`, formData);

      const { error } = res.data;
      if (error) return { error };

      return { success: true };
    } catch (err) {
      console.error("Ошибка при удалении сообщения:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  static getFileUrl(filename) {
    return `${API_BASE_MESSAGES}/get/${filename}`;
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

export default MessagesApi;
