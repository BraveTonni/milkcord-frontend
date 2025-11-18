import axios from "axios";
import BaseApi from "./BaseApi";

const API_BASE_MUSIC = "http://127.0.0.1:7000/api/v1/music";

class MusicApi extends BaseApi {
  // === ПОЛУЧЕНИЕ ВСЕХ ТРЕКОВ ===
  static async getAllTracks() {
    try {
      const token = this.getAccessToken();

      const res = await axios.get(
        `${API_BASE_MUSIC}/list?access_token=${encodeURIComponent(token)}`
      );
      const { error } = res.data;

      if (error) return { error };

      return res.data;
    } catch (err) {
      console.error("Ошибка запроса /music:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  static getMusicUrl(artist, track) {
    return `${API_BASE_MUSIC}/${artist}/${track}`;
  }

  // === ТОКЕН ===
  static getAccessToken() {
    const match = document.cookie.match(/(^| )access_token=([^;]+)/);
    return match ? match[2] : null;
  }
}

export default MusicApi;
