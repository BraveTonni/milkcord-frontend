import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { PhotoCamera, ZoomIn, ZoomOut, Close } from "@mui/icons-material";
import Cropper from "react-easy-crop";
import UserAPI from "../../../app/api/UserApi";

export default function PHCoverModal({ user, setUser, onClose }) {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [loading, setLoading] = useState(false);

  // По умолчанию — текущая обложка
  useEffect(() => {
    if (user?.cover_url) {
      setImageUrl(UserAPI.getCoverUrl(user.cover_url));
    }
  }, [user?.cover_url]);

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

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(
            new File([blob], file?.name || "cover.jpg", { type: "image/jpeg" })
          );
        },
        "image/jpeg",
        0.95
      );
    });
  };

  const handleSave = async () => {
    if (!file && !user?.cover_url) {
      toast.error("Выберите изображение");
      return;
    }

    setLoading(true);
    try {
      let croppedFile = file ? await getCroppedImg() : null;

      const res = await UserAPI.uploadCover(croppedFile); // ждём этот метод
      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Обложка обновлена!");
      setUser(res.user);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Ошибка загрузки", err);
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-3xl flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(163,230,53,0.15),transparent_70%)] pointer-events-none" />

      <button
        onClick={onClose}
        className="absolute top-8 right-8 text-gray-400 hover:text-lime-400 transition text-4xl z-50"
      >
        <Close />
      </button>

      <div className="relative bg-gray-950/90 border border-lime-400/30 rounded-3xl shadow-[0_0_60px_rgba(163,230,53,0.4)] p-8 max-w-5xl w-full mx-4">
        <h2 className="text-2xl font-bold text-center mb-8 text-lime-400">
          Обложка профиля
        </h2>

        {/* Кроппер — ширина 1200px, высота ~675px (примерно 16:9) */}
        <div className="relative w-full h-96 md:h-[600px] rounded-2xl overflow-hidden mb-8 bg-gray-900">
          {imageUrl ? (
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              cropShape="rect"
              showGrid={true}
              style={{
                containerStyle: { width: "100%", height: "100%" },
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Нет изображения
            </div>
          )}
        </div>

        {/* Управление */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <ZoomOut className="text-gray-400" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-64 accent-lime-400"
            />
            <ZoomIn className="text-gray-400" />
          </div>

          <div className="flex gap-4">
            <label className="px-8 py-3 bg-gray-800 border border-lime-400/40 rounded-xl hover:bg-lime-400 hover:text-black transition cursor-pointer flex items-center gap-3 font-medium">
              <PhotoCamera />
              Выбрать фото
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <button
              onClick={onClose}
              className="px-8 py-3 border border-gray-600 rounded-xl hover:bg-gray-800 transition"
            >
              Отмена
            </button>

            <button
              onClick={handleSave}
              disabled={loading}
              className="px-8 py-3 bg-lime-400 text-black font-bold rounded-xl hover:bg-lime-300 transition disabled:opacity-50"
            >
              {loading ? "Сохраняем..." : "Сохранить"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
