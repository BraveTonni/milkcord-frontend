import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { PhotoCamera, ZoomIn, ZoomOut, Close } from "@mui/icons-material";
import Cropper from "react-easy-crop";
import UserAPI from "../../../app/api/UserApi";

export default function PHAvatarModal({ user, setUser, onClose }) {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [loading, setLoading] = useState(false);

  // === По умолчанию показываем текущий аватар ===
  useEffect(() => {
    if (user.avatar_url) {
      setImageUrl(UserAPI.getAvatarUrl(user.avatar_url));
    }
  }, [user.avatar_url]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setImageUrl(URL.createObjectURL(selected));
    }
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const getCroppedImg = async () => {
    const image = new Image();
    image.src = imageUrl;
    await image.decode();

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const { width, height, x, y } = croppedAreaPixels;
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) =>
          resolve(
            new File([blob], file?.name || "avatar.jpg", {
              type: file?.type || "image/jpeg",
            })
          ),
        file?.type || "image/jpeg"
      );
    });
  };

  const handleSave = async () => {
    if (!file) {
      toast.error("Выберите новое изображение перед сохранением");
      return;
    }

    if (!croppedAreaPixels) {
      toast.error("Выберите и обрежьте изображение");
      return;
    }

    setLoading(true);
    const croppedFile = await getCroppedImg();
    const res = await UserAPI.uploadAvatar(croppedFile);
    setLoading(false);

    if (res.error) return toast.error(res.error);

    toast.success("Аватар обновлён!");
    setUser(res.user);
    onClose();
  };

  // === Содержимое модалки ===
  const modalContent = (
    <div className="fixed inset-0 z-10 bg-black/80 backdrop-blur-2xl flex items-center justify-center">
      {/* Неоновый фон */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(163,230,53,0.12),transparent_80%)] pointer-events-none"></div>

      {/* Кнопка закрытия */}
      <button
        onClick={onClose}
        className="absolute top-6 right-8 text-gray-400 hover:text-lime-400 transition z-50"
      >
        <Close fontSize="large" />
      </button>

      {/* === Контейнер кроппера фиксированной ширины === */}
      <div className="relative bg-gray-950/80 border border-lime-400/20 rounded-2xl shadow-[0_0_40px_rgba(163,230,53,0.3)] p-6 flex flex-col items-center">
        <div className="relative w-[400px] h-[400px] rounded-xl overflow-hidden mb-6">
          {imageUrl ? (
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={1}
              showGrid={false}
              cropShape="rect" // квадратная рамка
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: {
                  width: "100%",
                  height: "100%",
                  background: "transparent",
                },
                mediaStyle: { objectFit: "cover" },
              }}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-900 text-gray-400">
              Нет изображения
            </div>
          )}
        </div>

        {/* === Панель управления === */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 w-full">
          {/* Zoom */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <ZoomOut className="text-gray-400" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 md:flex-none md:w-48 accent-lime-400"
            />
            <ZoomIn className="text-gray-400" />
          </div>

          {/* Кнопки */}
          <div className="flex flex-wrap gap-4 justify-center w-full md:w-auto">
            <label className="px-6 py-2 border border-lime-400/40 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-lime-400 transition cursor-pointer flex items-center gap-2">
              <PhotoCamera fontSize="small" />
              <span>Другое фото</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <button
              onClick={onClose}
              className="px-6 py-2 border border-lime-400/40 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-lime-400 transition"
            >
              Отмена
            </button>

            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-lime-400 text-black rounded-lg font-semibold hover:bg-lime-300 transition disabled:opacity-50"
            >
              {loading ? "Сохраняем..." : "Сохранить"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // === Рендер через портал ===
  return createPortal(modalContent, document.body);
}
