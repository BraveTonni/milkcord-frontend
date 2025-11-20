import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { EmojiEmotions, AttachFile, X, FileCopy } from "@mui/icons-material";
import EmojiPicker from "emoji-picker-react";
import PostsAPI from "../../../../app/api/PostsApi";

const MAX_FILES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export default function PPNewPost({ setPosts }) {
  const [newPostText, setNewPostText] = useState("");
  const [files, setFiles] = useState([]); // массив File объектов
  const [previews, setPreviews] = useState([]); // для предпросмотра
  const [showEmoji, setShowEmoji] = useState(false);
  const pickerRef = useRef(null);
  const buttonRef = useRef(null);
  const fileInputRef = useRef(null);

  // === Эмодзи ===
  const handleEmojiClick = (emojiData) => {
    setNewPostText((prev) => prev + emojiData.emoji);
  };

  // === Закрытие эмодзи при клике вне ===
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // === Обработка выбора файлов ===
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length + files.length > MAX_FILES) {
      toast.error(`Максимум ${MAX_FILES} файлов`);
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    selectedFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} слишком большой (макс 10 МБ)`);
        return;
      }

      validFiles.push(file);

      // Создаём превью
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push({
          url: reader.result,
          type: file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "file",
          name: file.name,
        });
        setPreviews((prev) => [...prev, ...newPreviews]);
      };
      reader.readAsDataURL(file);
    });

    setFiles((prev) => [...prev, ...validFiles]);
  };

  // === Удаление файла из списка ===
  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  // === Создание поста с файлами ===
  const handleAddPost = async () => {
    if (!newPostText.trim() && files.length === 0) {
      toast.error("Добавьте текст или файлы");
      return;
    }

    const formData = new FormData();
    formData.append("text", newPostText.trim());

    files.forEach((file) => {
      formData.append("files", file);
    });

    const res = await PostsAPI.createPost(formData);
    if (res.error) {
      toast.error(res.error);
      return;
    }

    setPosts((prev) => [res.post, ...prev]);
    setNewPostText("");
    setFiles([]);
    setPreviews([]);
    setShowEmoji(false);
    toast.success("Пост опубликован!");
  };

  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm hover:border-lime-400/40 transition relative">
      {/* Текст */}
      <div className="relative">
        <textarea
          value={newPostText}
          onChange={(e) => setNewPostText(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-gray-200 focus:border-lime-400 focus:outline-none resize-none pr-10"
          rows={3}
          placeholder="Расскажи коржику, где ты побывал сегодня?"
          maxLength={300}
        />
        <div className="absolute bottom-2 right-3 text-xs text-gray-500 select-none">
          {newPostText.length}/300
        </div>
      </div>

      {/* Предпросмотр файлов */}
      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {previews.map((preview, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-700">
              {preview.type === "image" && (
                <img src={preview.url} alt="preview" className="w-full h-32 object-cover" />
              )}
              {preview.type === "video" && (
                <video src={preview.url} controls className="w-full h-32 object-cover" />
              )}
              {preview.type === "file" && (
                <div className="bg-gray-800 h-32 flex flex-col items-center justify-center text-gray-400">
                  <FileCopy className="w-12 h-12" />
                  <p className="text-xs mt-2 truncate px-2">{preview.name}</p>
                </div>
              )}
              <button
                onClick={() => removeFile(index)}
                className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Нижняя панель */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-2 max-xs:gap-0">
          {/* Кнопка загрузки файлов */}
          <input
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-400 hover:text-gray-300 transition p-2 rounded-lg hover:bg-gray-800"
            title="Прикрепить файлы"
          >
            <AttachFile className="rotate-45" />
          </button>

          {/* Эмодзи */}
          <button
            ref={buttonRef}
            onClick={() => setShowEmoji((prev) => !prev)}
            className="text-gray-400 hover:text-gray-300 transition p-2 rounded-lg hover:bg-gray-800"
          >
            <EmojiEmotions />
          </button>

          {files.length > 0 && (
            <span className="text-xs text-lime-400 ml-2">
              {files.length} файл(ов)
            </span>
          )}
        </div>

        {/* Кнопка отправки */}
        <button
          onClick={handleAddPost}
          disabled={!newPostText.trim() && files.length === 0}
          className="px-6 py-2 bg-lime-400 text-black rounded-xl font-semibold hover:bg-lime-300 transition disabled:bg-gray-600 disabled:cursor-not-allowed max-xs:text-sm max-xs:px-4"
        >
          Опубликовать
        </button>
      </div>

      {/* Эмодзи пикер */}
      {showEmoji && (
        <div ref={pickerRef} className="absolute bottom-12 left-0 z-50">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme="dark"
            width="320px"
            height="380px"
            lazyLoadEmojis
            searchDisabled
            previewConfig={{ showPreview: false }}
            skinTonesDisabled
          />
        </div>
      )}
    </div>
  );
}