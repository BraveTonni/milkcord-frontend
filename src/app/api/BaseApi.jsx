class BaseApi {
  // === ТОКЕН ===
  static getAccessToken() {
    const match = document.cookie.match(/(^| )access_token=([^;]+)/);
    return match ? match[2] : null;
  }

  static setAccessToken(token) {
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    // Secure-флаг только по https: на http://localhost он запретил бы куку
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `access_token=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${secure}`;
  }

  static logout() {
    document.cookie =
      "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("user");
  }
}

export default BaseApi;
