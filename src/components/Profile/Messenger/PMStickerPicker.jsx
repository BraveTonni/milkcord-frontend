import { useState, useEffect, useRef } from "react";
import StickersApi from "../../../app/api/StickersApi";
import MessagesApi from "../../../app/api/MessagesApi";
import { toast } from "react-toastify";

export default function PMStickerPicker({ userId, onClose }) {
  const [stickers, setStickers] = useState([]); // массив паков
  const [selectedPackIndex, setSelectedPackIndex] = useState(0);
  const pickerRef = useRef(null);

  useEffect(() => {
    // Загружаем стикерпаки один раз
    (async () => {
      const res = await StickersApi.getAllStickers();
      if (res && !res.error && Array.isArray(res.packs)) {
        setStickers(res.packs);
      } else {
        toast.error("Не удалось загрузить стикеры");
      }
    })();

    // Закрытие по клику вне
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const currentPack = stickers[selectedPackIndex] || null;

  const handleStickerClick = async (pack, sticker) => {
    const res = await MessagesApi.sendSticker(userId, pack.slug, sticker.slug);
    if (res.error) {
      toast.error("Ошибка отправки стикера");
    } else {
      onClose?.();
    }
  };

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-14 max-xs:-left-11 max-xs:w-86 left-0 w-96 h-96 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
      style={{ backdropFilter: "blur(12px)" }}
    >
      {/* Вкладки паков */}
      <div className="flex border-b border-gray-700 bg-gray-800/70">
        {stickers.map((pack, i) => (
          <button
            key={pack.slug}
            onClick={() => setSelectedPackIndex(i)}
            className={`flex-1 py-3 px-2 text-xs font-medium transition-all ${
              selectedPackIndex === i
                ? "text-lime-400 border-b-2 border-lime-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <span className="truncate block">{pack.title}</span>
          </button>
        ))}
      </div>

      {/* Стикеры */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-600">
        {currentPack && currentPack.stickers.length > 0 ? (
          <div className="grid grid-cols-4 gap-4">
            {currentPack.stickers.map((sticker) => (
              <div
                key={sticker.slug}
                onClick={() => handleStickerClick(currentPack, sticker)}
                className="group relative aspect-square cursor-pointer"
                style={{ perspective: "1000px" }}
              >
                <div className="relative w-full h-24 transition-transform duration-600 transform-3d group-hover:rotate-y-180">
                  {/* Лицевая сторона */}
                  <div className="absolute inset-0 backface-hidden bg-gray-800/60 rounded-xl overflow-hidden flex flex-col">
                    <div className="flex-1 flex items-center justify-center">
                      <img
                        src={StickersApi.getStickerUrl(currentPack.slug, sticker.slug)}
                        alt={sticker.title}
                        className="object-contain w-20 h-20"
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 pb-1">
                      <div className="bg-black/30 h-12 absolute inset-0" />
                      <p className="relative text-lime-300 text-sm font-bold text-center truncate drop-shadow-md px-1">
                        {sticker.title}
                      </p>
                    </div>
                  </div>

                  {/* Обратная сторона */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-lime-800/95 to-emerald-900/95 rounded-xl flex items-center justify-center p-6 shadow-2xl">
                    <p className="text-white text-xs font-semibold leading-relaxed text-center">
                      {sticker.description || "Без описания"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Нет стикеров в этом паке
          </div>
        )}
      </div>

      {/* Футер */}
      <div className="p-3 text-center text-xs text-gray-400 border-t border-gray-800 bg-gray-900/50">
        {currentPack ? `${currentPack.stickers.length} стикеров` : "0"} • Клик — отправить
      </div>
    </div>
  );
}