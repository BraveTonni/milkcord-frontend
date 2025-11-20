import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { formatDateWithTime } from "../../../../features/Time";
import PostsAPI from "../../../../app/api/PostsApi";
import {
  Favorite,
  ChatBubbleOutline,
  Delete,
  Send,
  PushPin,
  FileCopy,
} from "@mui/icons-material";
import PostFileLink from "../PostFileLink";

export default function PPPost({ user, post, setPosts }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  // ЛАЙК
  const handleLike = async (postId) => {
    const res = await PostsAPI.likePost(postId);
    if (res.error) {
      toast.error(res.error);
      return;
    }

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked: res.liked, likes_count: res.likes_count }
          : p
      )
    );
  };

  // ПОЛУЧИТЬ КОММЕНТЫ
  const fetchComments = async (postId) => {
    setLoadingComments(true);
    const res = await PostsAPI.getComments(postId);
    setLoadingComments(false);

    if (res.error) {
      toast.error(res.error);
      return;
    }
    setComments(res.comments);
  };

  // ДОБАВИТЬ КОММЕНТ
  const handleAddComment = async (postId) => {
    if (!newComment.trim()) return;

    const res = await PostsAPI.commentPost(postId, newComment);
    if (res.error) {
      toast.error(res.error);
      return;
    }

    setComments((prev) => [res.comment, ...prev]);
    setNewComment("");
    toast.success("Комментарий добавлен");

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, comments_count: (p.comments_count || 0) + 1 }
          : p
      )
    );
  };

  // ОТКРЫТЬ/ЗАКРЫТЬ КОММЕНТЫ
  const toggleComments = async () => {
    setShowComments((prev) => !prev);
    if (!showComments && comments.length === 0) {
      await fetchComments(post.id);
    }
  };

  // УДАЛЕНИЕ ПОСТА
  const handleDelete = async (postId) => {
    const res = await PostsAPI.deletePost(postId);
    if (res.error) {
      toast.error(res.error);
      return;
    }

    setPosts((prev) => prev.filter((p) => p.id !== postId));
    toast.success("Пост удалён");
  };

  // ЗАКРЕПЛЕНИЕ
  const handlePin = async (postId) => {
    const res = await PostsAPI.pinPost(postId);

    if (res.error) {
      toast.error(res.error);
      return;
    }

    setPosts((prev) => {
      // Копируем все посты
      let updated = prev.map((p) => ({ ...p }));

      const targetIndex = updated.findIndex((p) => p.id === postId);
      if (targetIndex === -1) return updated;

      const targetPost = updated[targetIndex];

      if (res.is_new === false) {
        // Открепили
        updated = updated.map((p) => ({ ...p, is_pin: false }));
        // Сортируем по дате
        updated.sort((a, b) => b.created_at - a.created_at);
        toast.success("Пост откреплён");
      } else {
        // Закрепили
        updated = updated.map((p) => ({ ...p, is_pin: false }));
        updated.splice(targetIndex, 1);
        updated.unshift({ ...targetPost, is_pin: true });
        toast.success("Пост закреплён");
      }

      return updated;
    });
  };

  return (
    <div
      key={post.id}
      className={`bg-gray-900/40 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm transition cursor-pointer ${
        post.is_pin ? "ring-2 ring-lime-400/60" : "hover:border-lime-400/40"
      }`}
    >
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-lime-400/20 flex items-center justify-center font-semibold text-lime-400">
            {user.login?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-white">{user.username}</p>
            <p className="text-xs text-gray-500">
              {post.is_pin && "Закреплён • "}
              {formatDateWithTime(post.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Delete
            onClick={() => handleDelete(post.id)}
            className="text-gray-500 cursor-pointer hover:scale-110 transition"
          />
          <PushPin
            onClick={() => handlePin(post.id)}
            className={`${
              post.is_pin ? "text-lime-400" : "text-gray-500"
            } cursor-pointer hover:scale-110 transition`}
          />
        </div>
      </div>

      {/* Текст поста */}
      <p className="text-gray-300 mb-3 break-words whitespace-pre-line">
        {post.text}
      </p>

      {post.files && post.files.length > 0 && (
        <div className="mt-4 -mx-6 px-6">
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-xs:grid-cols-1 max-xs:gap-1">
            {post.files.map((file) => <PostFileLink key={file.id} file={file} />)}
          </div>
        </div>
      )}

      {/* Кнопки действий */}
      <div className="flex gap-6 text-sm mt-4">
        <button
          onClick={() => handleLike(post.id)}
          className={`flex items-center gap-1 transition cursor-pointer ${
            post.liked ? "text-lime-400" : "text-gray-500 hover:text-lime-400"
          }`}
        >
          <Favorite fontSize="small" />
          {post.likes_count || 0}
        </button>

        <button
          onClick={toggleComments}
          className="flex items-center gap-1 text-gray-500 hover:text-lime-400 transition cursor-pointer"
        >
          <ChatBubbleOutline fontSize="small" />
          {post.comments_count || 0}
        </button>
      </div>

      {/* Комментарии */}
      {showComments && (
        <div className="mt-4 border-t border-gray-800 pt-3 space-y-3">
          {loadingComments ? (
            <p className="text-gray-500 text-sm">Загрузка...</p>
          ) : comments.length === 0 ? (
            <p className="text-gray-500 text-sm">Комментариев нет</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="text-sm text-gray-300">
                <a
                  href={`/profile/${c.username}`}
                  className="text-lime-400 font-semibold"
                >
                  {c?.username || "Пользователь"}:
                </a>{" "}
                {c.text}
              </div>
            ))
          )}

          {/* Форма комментария */}
          <div className="flex items-center gap-2 mt-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment(post.id)}
              placeholder="Напиши комментарий..."
              className="flex-1 bg-gray-800/50 text-gray-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400/40"
            />
            <button
              onClick={() => handleAddComment(post.id)}
              className="text-lime-400 hover:text-lime-300 transition"
            >
              <Send fontSize="small" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
