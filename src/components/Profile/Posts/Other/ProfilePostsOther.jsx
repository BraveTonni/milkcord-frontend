import { useState, useEffect } from "react";

import PPPost from "./PPPostOther";

import PostsAPI from "../../../../app/api/PostsApi";

import { toast } from "react-toastify";

// Сортировка: закреплённые посты всегда сверху
function sortPosts(posts) {
  return [...posts].sort((a, b) => {
    if (a.is_pin === b.is_pin) return 0;
    return a.is_pin ? -1 : 1;
  });
}

export default function ProfilePostsOther({ user, otherUser }) {
  const [posts, setPosts] = useState([]);

  // === ЗАГРУЗКА ДАННЫХ ===
  useEffect(() => {
    (async () => {
      const resPosts = await PostsAPI.getAllPosts(otherUser.username);

      if (!resPosts.error) {
        const sorted = sortPosts(resPosts.posts || []);
        setPosts(sorted);
      } else {
        toast.error("Ошибка загрузки постов");
      }
    })();
  }, [otherUser.username]);

  // Чтобы PPPostOther мог обновлять и сортировать посты
  const updatePosts = (callback) => {
    setPosts((prev) => sortPosts(callback(prev)));
  };

  return (
    <>
      {posts.length === 0 && (
        <p className="text-center text-gray-500">
          У {otherUser.username} пока нет постов
        </p>
      )}

      {posts.map((post) => (
        <PPPost
          key={post.id}
          user={otherUser}
          post={post}
          setPosts={updatePosts}
        />
      ))}
    </>
  );
}
