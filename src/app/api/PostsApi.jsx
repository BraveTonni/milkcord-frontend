import axios from "axios";
import BaseApi from "./BaseApi";
import API_BASE_URL from "../config";

const API_BASE_POSTS = `${API_BASE_URL}/api/v1/posts`;

class PostsAPI extends BaseApi {
  // === ПОСТЫ ===

  static async getAllPosts(username) {
    try {
      const res = await axios.get(`${API_BASE_POSTS}/all?username=${username}`);
      const { error, posts } = res.data;
      if (error) return { error };
      return { posts };
    } catch (err) {
      console.error("Ошибка при получении постов:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  static async getPostById(post_id) {
    try {
      const token = this.getAccessToken();
      const res = await axios.get(
        `${API_BASE_POSTS}/${post_id}?access_token=${encodeURIComponent(token)}`
      );
      const { error, post } = res.data;
      if (error) return { error };
      return { post };
    } catch (err) {
      console.error("Ошибка при получении поста:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  static async deletePost(post_id) {
    try {
      const token = this.getAccessToken();
      const res = await axios.delete(
        `${API_BASE_POSTS}/delete/${post_id}?access_token=${encodeURIComponent(
          token
        )}`
      );
      const { error, post } = res.data;
      if (error) return { error };
      return { post };
    } catch (err) {
      console.error("Ошибка при получении поста:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  static async createPost(data) {
    try {
      const token = this.getAccessToken();
      const isFormData = data instanceof FormData;

      const res = await axios.post(
        `${API_BASE_POSTS}/create?access_token=${encodeURIComponent(token)}`,
        data,
        {
          headers: isFormData
            ? { "Content-Type": "multipart/form-data" }
            : { "Content-Type": "application/json" },
        }
      );

      const { error, post } = res.data;
      if (error) return { error };
      return { post };
    } catch (err) {
      console.error("Ошибка при создании поста:", err);
      return { error: err.response?.data?.error || "Ошибка сервера" };
    }
  }

  static async pinPost(post_id) {
    try {
      const token = this.getAccessToken();
      const res = await axios.post(
        `${API_BASE_POSTS}/pin?access_token=${encodeURIComponent(token)}`,
        { post_id }
      );
      return res.data;
    } catch (err) {
      console.error("Ошибка при создании поста:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  static async likePost(post_id) {
    try {
      const token = this.getAccessToken();
      const res = await axios.post(
        `${API_BASE_POSTS}/${post_id}/like?access_token=${encodeURIComponent(
          token
        )}`
      );
      const { error } = res.data;
      if (error) return { error };
      return res.data;
    } catch (err) {
      console.error("Ошибка при лайке поста:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  static async commentPost(post_id, text) {
    try {
      const token = this.getAccessToken();
      const res = await axios.post(
        `${API_BASE_POSTS}/${post_id}/comment?access_token=${encodeURIComponent(
          token
        )}`,
        { text }
      );
      const { error, comment } = res.data;
      if (error) return { error };
      return { comment };
    } catch (err) {
      console.error("Ошибка при комментировании поста:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  static async getComments(post_id) {
    try {
      const res = await axios.get(`${API_BASE_POSTS}/${post_id}/comments`);
      const { error, comments } = res.data;
      if (error) return { error };
      return { comments };
    } catch (err) {
      console.error("Ошибка при получении комментариев:", err);
      return { error: "Ошибка соединения с сервером" };
    }
  }

  // === ТОКЕН ===
  static getPostFileUrl(filename) {
    return `${API_BASE_POSTS}/get/${filename}`;
  }

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

export default PostsAPI;
