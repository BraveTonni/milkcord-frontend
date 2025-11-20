import { useState, useEffect } from "react";

import PPPost from "./PPPost";
import PPNewPost from "./PPNewPost";

import PostsAPI from "../../../../app/api/PostsApi";

import { toast } from "react-toastify";

function sortPosts(posts) {
  return [...posts].sort((a, b) => {
    if (a.is_pin === b.is_pin) return 0;
    return a.is_pin ? -1 : 1;
  });
}

export default function ProfilePosts({ user }) {
  const [posts, setPosts] = useState([]);

  // === ЗАГРУЗКА ДАННЫХ ===
  useEffect(() => {
    (async () => {
      const resPosts = await PostsAPI.getAllPosts(user.username);

      if (!resPosts.error) {
        const sorted = sortPosts(resPosts.posts || []);
        setPosts(sorted);
      } else {
        toast.error("Ошибка загрузки постов");
      }
    })();
  }, []);

  // Обёртка, чтобы дочерние компоненты тоже сортировали посты
  const updatePosts = (callback) => {
    setPosts((prev) => sortPosts(callback(prev)));
  };

  return (
    <>
      <PPNewPost setPosts={updatePosts} />

      {posts.length === 0 && (
        <p className="text-center text-gray-500">У тебя пока нет постов</p>
      )}

      {posts.map((post) => (
        <PPPost
          key={post.id}
          user={user}
          post={post}
          setPosts={updatePosts}
        />
      ))}
    </>
  );
}
