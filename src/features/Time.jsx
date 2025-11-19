export function formatDate(timestamp) {
  if (!timestamp) return "Неизвестно";
  const date = new Date(timestamp > 9999999999 ? timestamp : timestamp * 1000);

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateWithTime(timestamp) {
  if (!timestamp) return "Неизвестно";
  const date = new Date(timestamp > 9999999999 ? timestamp : timestamp * 1000);

  return date.toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTimeWithSeconds(timestamp) {
  if (!timestamp) return "Неизвестно";

  // Поддержка как миллисекунд, так и секунд
  const date = new Date(timestamp > 9999999999 ? timestamp : timestamp * 1000);

  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
