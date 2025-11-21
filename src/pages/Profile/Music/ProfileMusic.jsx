import { useState, useRef, useEffect } from "react";
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  VolumeUp,
  MusicNote,
} from "@mui/icons-material";

import MusicApi from "../../../app/api/MusicApi";
import { toast } from "react-toastify";

export default function ProfileMusic() {
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef(null);

  // Загружаем треки
  useEffect(() => {
    (async () => {
      const res = await MusicApi.getAllTracks();
      if (res && res.success && Array.isArray(res.tracks)) {
        setTracks(res.tracks);
        setCurrentTrack(res.tracks[0]); // первый трек
      } else {
        toast.error("Не удалось загрузить музыку");
      }
    })();
  }, []);

  // Когда трек меняется
  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    setProgress(0);
    setDuration(0);

    if (playing) {
      setTimeout(() => audioRef.current.play().catch(() => {}), 100);
    }
  }, [currentTrack]);

  // Когда загружена мета (длительность)
  const onLoadedMetadata = () => {
    setDuration(audioRef.current.duration || 0);
  };

  // Обновляем прогресс бар
  const onTimeUpdate = () => {
    setProgress(audioRef.current.currentTime || 0);
  };

  // Перемотка
  const handleSeek = (e) => {
    const time = Number(e.target.value);
    audioRef.current.currentTime = time;
    setProgress(time);
  };

  // Play / pause
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    }
  };

  const handleNext = () => {
    const idx = tracks.findIndex((t) => t.slug === currentTrack.slug);
    const next = tracks[(idx + 1) % tracks.length];
    setCurrentTrack(next);
    setPlaying(true);
  };

  const handlePrev = () => {
    const idx = tracks.findIndex((t) => t.slug === currentTrack.slug);
    const prev = tracks[(idx - 1 + tracks.length) % tracks.length];
    setCurrentTrack(prev);
    setPlaying(true);
  };

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    audioRef.current.volume = v;
  };

  const formatTime = (sec) => {
    if (!sec) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!currentTrack) {
    return (
      <div className="text-white p-10 text-center text-xl">
        Загружаем музыку...
      </div>
    );
  }

  return (
    <section className="relative min-h-[calc(100vh-80px)] bg-gradient-to-b from-black via-gray-900 to-gray-950 text-white py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(163,230,53,0.05),transparent_70%)]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* ================= Список треков ================= */}
        <main className="bg-gray-900/40 border border-gray-800 rounded-2xl backdrop-blur-md p-6 mb-6 overflow-y-auto custom-scrollbar max-h-[calc(85vh-200px)]">
          <h2 className="text-2xl font-bold text-lime-400 mb-6 flex items-center gap-3">
            <MusicNote /> Моя музыка
          </h2>

          <div className="flex flex-col gap-3">
            {tracks.map((track) => (
              <div
                key={track.slug}
                onClick={() => {
                  setCurrentTrack(track);
                  setPlaying(true);
                }}
                className={`flex items-center justify-between p-4 rounded-xl transition-all cursor-pointer hover:bg-gray-800/60 ${
                  currentTrack.slug === track.slug
                    ? "bg-lime-400/20 text-lime-400"
                    : "text-gray-300"
                }`}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={`http://127.0.0.1:7000/static/music/${track.artist}/${track.image}`}
                    alt={track.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium">{track.title}</p>
                    <p className="text-sm text-gray-500">{track.artist}</p>
                  </div>
                </div>

                <span className="text-gray-400 text-sm">{track.duration}</span>
              </div>
            ))}
          </div>
        </main>

        {/* ================= Плеер ================= */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 flex flex-col gap-4 backdrop-blur-md">
          {/* Верхняя часть */}
          <div className="flex items-center justify-between max-xs:flex-col max-xs:gap-4">
            <div className="flex items-center gap-4">
              <img
                src={`http://127.0.0.1:7000/static/music/${currentTrack.artist}/${currentTrack.image}`}
                alt={currentTrack.title}
                className="w-14 h-14 rounded-lg object-cover"
              />
              <div>
                <p className="font-semibold hover:text-lime-400 transition cursor-pointer">
                  {currentTrack.title}
                </p>
                <p className="text-gray-400 text-sm">{currentTrack.artist}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={handlePrev}
                className="p-2 hover:text-lime-400 transition"
              >
                <SkipPrevious fontSize="large" />
              </button>

              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-lime-400 flex items-center justify-center hover:bg-lime-300 transition"
              >
                {playing ? (
                  <Pause fontSize="large" className="text-black" />
                ) : (
                  <PlayArrow fontSize="large" className="text-black" />
                )}
              </button>

              <button
                onClick={handleNext}
                className="p-2 hover:text-lime-400 transition"
              >
                <SkipNext fontSize="large" />
              </button>
            </div>

            <div className="flex items-center gap-3 max-xs:self-start max-xs:w-full">
              <VolumeUp className="text-gray-400" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={handleVolume}
                className="w-28 accent-lime-400 cursor-pointer max-xs:w-full"
              />
            </div>
          </div>

          {/* Прогресс-бар */}
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">
              {formatTime(progress)}
            </span>

            <input
              type="range"
              min={0}
              max={duration}
              value={progress}
              onChange={handleSeek}
              className="flex-1 accent-lime-400 cursor-pointer"
            />

            <span className="text-gray-400 text-sm">
              {formatTime(duration)}
            </span>
          </div>

          <audio
            ref={audioRef}
            src={`http://127.0.0.1:7000/static/music/${currentTrack.artist}/${currentTrack.track}`}
            onLoadedMetadata={onLoadedMetadata}
            onTimeUpdate={onTimeUpdate}
            onEnded={handleNext}
            autoPlay={playing}
          />
        </div>
      </div>
    </section>
  );
}
