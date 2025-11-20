import { useState, useEffect } from "react";
import {
  CalendarMonth,
  PersonAdd,
  PersonRemove,
  Check,
  Close,
  Message,
} from "@mui/icons-material";
import { formatDate } from "../../../../features/Time";
import { toast } from "react-toastify";
import FriendsAPI from "../../../../app/api/FriendsApi";

export default function PHInfoOther({ user, otherUser }) {
  const [friendRequest, setFriendRequest] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    const data = await FriendsAPI.getFriendRequest(otherUser.username);
    if (data.error) return toast.error(data.error);
    setFriendRequest(data);
  };

  useEffect(() => {
    fetchStatus();
  }, [otherUser.username]);

  // === Действия ===
  const handleAddFriend = async () => {
    setLoading(true);
    const { error } = await FriendsAPI.sendRequest(otherUser.username);
    setLoading(false);
    if (error) return toast.error(error);
    toast.success(`Заявка пользователю @${otherUser.username} отправлена`);
    fetchStatus();
  };

  const handleRemoveFriend = async () => {
    setLoading(true);
    const { error } = await FriendsAPI.removeFriend(otherUser.username);
    setLoading(false);
    if (error) return toast.error(error);
    toast.info(`@${otherUser.username} удалён из друзей`);
    fetchStatus();
  };

  const handleAcceptRequest = async () => {
    setLoading(true);
    const { error } = await FriendsAPI.acceptRequest(otherUser.username);
    setLoading(false);
    if (error) return toast.error(error);
    toast.success(`Теперь вы друзья с @${otherUser.username}`);
    fetchStatus();
  };

  // === Рендер кнопок ===
  const renderButton = () => {
    if (!friendRequest) return null;

    switch (friendRequest.status) {
      case "none":
        return (
          <button
            onClick={handleAddFriend}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-lime-400 text-black font-semibold hover:bg-lime-300 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <PersonAdd fontSize="small" />
            <span className="hidden md:inline">Добавить в друзья</span>
          </button>
        );

      case "pending":
        if (friendRequest.initiator_id === user.id) {
          // Исходящая заявка
          return (
            <button
              onClick={handleRemoveFriend}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-red-400 text-black font-semibold hover:bg-red-300 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <PersonRemove fontSize="small" />
              <span className="hidden md:inline">Отменить заявку</span>
            </button>
          );
        } else {
          // Входящая заявка: показать "Принять / Отклонить"
          return (
            <div className="flex gap-2">
              <button
                onClick={handleAcceptRequest}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-lime-400 text-black font-semibold hover:bg-lime-300 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Check fontSize="small" />
                <span className="hidden md:inline">Принять</span>
              </button>
              <button
                onClick={handleRemoveFriend}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-gray-500 text-white font-semibold hover:bg-gray-400 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Close fontSize="small" />
                <span className="hidden md:inline">Отклонить</span>
              </button>
            </div>
          );
        }

      case "accepted":
        return (
          <div className="flex gap-2">
            <button
              onClick={handleRemoveFriend}
              disabled={loading}
              className="max-w-[50px] hover:max-w-fit max-h-[35px] px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-400 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 group"
            >
              <PersonRemove fontSize="small" />
              <span className="hidden md:inline origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200 ease-out">
                Удалить из друзей
              </span>
            </button>
            <button
              onClick={() =>
                (window.location.href = `/messenger/${otherUser.id}`)
              }
              disabled={loading}
              className="max-w-[50px] hover:max-w-fit max-h-[35px] px-4 py-2 rounded-xl bg-lime-500 text-white font-semibold hover:bg-lime-400 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 group"
            >
              <Message fontSize="small" />
              <span className="hidden md:inline origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200 ease-out">
                Написать сообщение
              </span>
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  // === JSX ===
  return (
    <div className="flex-1 flex flex-col justify-center mt-6 md:mt-0">
      <div className="flex flex-wrap items-center justify-between mb-3">
        <h1 className="text-3xl font-bold text-lime-400 cursor-pointer hover:text-lime-300 transition">
          {otherUser.username}
        </h1>
        {renderButton()}
      </div>

      <p className="text-gray-400 mb-2 text-lg cursor-pointer hover:text-gray-300 transition wrap-break-word whitespace-pre-line">
        {otherUser.bio || "Пока без описания — зато с вайбом"}
      </p>

      <div className="flex flex-wrap gap-5 text-gray-400 mt-3 text-sm">
        <div className="flex items-center gap-2 cursor-pointer hover:text-lime-300 transition">
          <CalendarMonth fontSize="small" className="text-lime-400" />
          Дата регистрации: {formatDate(otherUser.created_at)}
        </div>
      </div>
    </div>
  );
}
