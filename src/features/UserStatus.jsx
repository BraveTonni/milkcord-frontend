export default function getUserStatus(lastSeen) {
  if (!lastSeen) {
    return { status: "Не в сети", substatus: "" };
  }

  const now = new Date();
  const lastSeenDate = new Date(lastSeen * 1000);
  const diffMs = now - lastSeenDate;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 5) {
    return { status: "В сети", substatus: "ю-ю" };
  } else if (diffMinutes < 60) {
    return { status: "Не в сети", substatus: `Был ${diffMinutes} мин назад` };
  } else if (diffHours < 24) {
    return { status: "Не в сети", substatus: `Был ${diffHours} ч назад` };
  } else if (diffDays === 1) {
    return { status: "Не в сети", substatus: "Был вчера" };
  } else {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return { 
      status: "Не в сети", 
      substatus: `Был ${lastSeenDate.toLocaleDateString("ru-RU", options)}` 
    };
  }
}