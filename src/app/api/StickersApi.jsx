import axios from "axios";
import BaseApi from "./BaseApi";
import API_BASE_URL from "../config";

const API_BASE_STICKERS = `${API_BASE_URL}/api/v1/stickers`;

class StickersApi extends BaseApi {
  // === ПОЛУЧЕНИЕ ВСЕХ СТИКЕРОВ ===
  static async getAllStickers() {
    try {
      const token = this.getAccessToken();

      const res = await axios.get(
        `${API_BASE_STICKERS}/list?access_token=${encodeURIComponent(token)}`
      );
      const { error } = res.data;

      if (error) return { error };

      return res.data;
    } catch (err) {
      console.error("Ошибка запроса /stickers:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  static getStickerUrl(packName, stickerFile) {
    return `${API_BASE_STICKERS}/${packName}/${stickerFile}`;
  }

  // === ТОКЕН ===
  static getAccessToken() {
    const match = document.cookie.match(/(^| )access_token=([^;]+)/);
    return match ? match[2] : null;
  }
}

export default StickersApi;
