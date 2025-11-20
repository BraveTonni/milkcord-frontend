import { useState } from "react";
import { FileCopy } from "@mui/icons-material";

import PostsAPI from "../../../app/api/PostsApi";

export default function PostFileLink({ file }) {
  const [downloading, setDownloading] = useState(false);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (downloading) return;
    setDownloading(true);

    try {
      const res = await fetch(PostsAPI.getPostFileUrl(file.file_name));
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = file.orig_name;
      a.click();

      URL.revokeObjectURL(url);
    } catch {
      alert("Ошибка скачивания");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="relative group rounded-lg overflow-hidden bg-gray-800/50 border border-gray-700 hover:border-lime-400/40 transition">
      <button
        onClick={handleClick}
        disabled={downloading}
        className="cursor-pointer w-full h-32 flex flex-col items-center justify-center text-gray-400 hover:text-lime-400 transition p-4 text-center disabled:opacity-60"
      >
        {downloading ? (
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-600 border-t-lime-400" />
        ) : (
          <FileCopy className="w-12 h-12 mb-2" />
        )}
        <span className="text-xs break-all line-clamp-2">
          {file.orig_name}
        </span>
        <span className="text-xs mt-1 opacity-70">
          {(file.file_size / 1024).toFixed(1)} КБ
        </span>
        {downloading && <span className="text-xs text-lime-400 mt-1">Загрузка...</span>}
      </button>
    </div>
  );
}