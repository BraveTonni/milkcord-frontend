import axios from "axios";
import BaseApi from "./BaseApi";
import API_BASE_URL from "../config";

const API_BASE_CALLS = `${API_BASE_URL}/api/v1/calls`;

class CallsAPI extends BaseApi {
  static getAccessToken() {
    const match = document.cookie.match(/(^| )access_token=([^;]+)/);
    return match ? match[2] : null;
  }

  static async startCall({ to_user_id, kind }) {
    try {
      const token = this.getAccessToken();
      const res = await axios.post(`${API_BASE_CALLS}/start?access_token=${encodeURIComponent(token)}`, { to_user_id, kind });
      return res.data;
    } catch (err) {
      console.error("Ошибка при старте звонка:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  static async acceptCall({ call_id }) {
    try {
      const token = this.getAccessToken();
      const res = await axios.post(`${API_BASE_CALLS}/accept?access_token=${encodeURIComponent(token)}`, { call_id });
      return res.data;
    } catch (err) {
      console.error("Ошибка при принятии звонка:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  static async rejectCall({ call_id }) {
    try {
      const token = this.getAccessToken();
      const res = await axios.post(`${API_BASE_CALLS}/reject?access_token=${encodeURIComponent(token)}`, { call_id });
      return res.data;
    } catch (err) {
      console.error("Ошибка при отклонении звонка:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  static async endCall({ call_id }) {
    try {
      const token = this.getAccessToken();
      const res = await axios.post(`${API_BASE_CALLS}/end?access_token=${encodeURIComponent(token)}`, { call_id });
      return res.data;
    } catch (err) {
      console.error("Ошибка при завершении звонка:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  static async getCallStatus(call_id) {
    try {
      const token = this.getAccessToken();
      const res = await axios.get(`${API_BASE_CALLS}/status?access_token=${encodeURIComponent(token)}&call_id=${call_id}`);
      return res.data;
    } catch (err) {
      console.error("Ошибка получения статуса звонка:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }
}

export default CallsAPI;
