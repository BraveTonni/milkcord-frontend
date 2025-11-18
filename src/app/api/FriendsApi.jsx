import axios from "axios";
import BaseApi from "./BaseApi";

const API_BASE_FRIENDS = "http://127.0.0.1:7000/api/v1/friends";

class FriendsAPI extends BaseApi {
  static getAccessToken() {
    const match = document.cookie.match(/(^| )access_token=([^;]+)/);
    return match ? match[2] : null;
  }

  // === Отправить запрос в друзья ===
  static async sendRequest(friend_username) {
    try {
      const token = this.getAccessToken();
      const res = await axios.post(
        `${API_BASE_FRIENDS}/request/${friend_username}?access_token=${encodeURIComponent(token)}`
      );
      return res.data;
    } catch (err) {
      console.error("Ошибка при отправке запроса в друзья:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  // === Принять запрос ===
  static async acceptRequest(friend_username) {
    try {
      const token = this.getAccessToken();
      const res = await axios.post(
        `${API_BASE_FRIENDS}/accept/${friend_username}?access_token=${encodeURIComponent(token)}`
      );
      return res.data;
    } catch (err) {
      console.error("Ошибка при принятии запроса:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  // === Удалить друга / отменить ===
  static async removeFriend(friend_username) {
    try {
      const token = this.getAccessToken();
      const res = await axios.delete(
        `${API_BASE_FRIENDS}/remove/${friend_username}?access_token=${encodeURIComponent(token)}`
      );
      return res.data;
    } catch (err) {
      console.error("Ошибка при удалении друга:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  // === Получить списки ===
  static async getFriends(username) {
    try {
      const res = await axios.get(`${API_BASE_FRIENDS}/list?username=${username}`);
      return res.data;
    } catch (err) {
      console.error("Ошибка при получении друзей:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  static async getIncoming() {
    try {
      const token = this.getAccessToken();
      const res = await axios.get(`${API_BASE_FRIENDS}/incoming?access_token=${encodeURIComponent(token)}`);
      return res.data;
    } catch (err) {
      console.error("Ошибка при получении входящих:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  static async getFriendRequest(username) {
    try {
      const token = this.getAccessToken();
      const res = await axios.get(
        `${API_BASE_FRIENDS}/status/${username}?access_token=${encodeURIComponent(token)}`
      );
      
      return res.data;
    } catch (err) {
      console.error("Ошибка получения статуса:", err);
      return { error: "Ошибка сервера" };
    }
  }

  static async getOutgoing() {
    try {
      const token = this.getAccessToken();
      const res = await axios.get(`${API_BASE_FRIENDS}/outgoing?access_token=${encodeURIComponent(token)}`);
      return res.data;
    } catch (err) {
      console.error("Ошибка при получении исходящих:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }
}

export default FriendsAPI;
