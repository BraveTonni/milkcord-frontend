import { useEffect, useRef, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Hero from "../components/Home/Hero";
import About from "../components/Home/About/About";
import Features from "../components/Home/Features/Features";
import JoinToCommunity from "../components/Home/JoinToCommunity/JoinToCommunity";
import RainEffect from "../components/Effects/RainEffect";
import { ArrowUpward } from "@mui/icons-material";
import Header from "../components/Header/Header";

import { toast } from "react-toastify";

export default function HomePage() {
  const containerRef = useRef(null);
  const sectionsRef = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showHeader, setShowHeader] = useState(true);
  const currentIndexRef = useRef(0);

  // ✅ Инициализация AOS
  useEffect(() => {
    AOS.init({
      duration: 600, // немного быстрее
      once: false, // позволяет проигрывать повторно
      easing: "ease-out",
    });
  }, []);

  // Отключаем системный скролл
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  // Управление секциями
  useEffect(() => {
    setTimeout(() => {
      toast.info("Коржик благославляет тебя >3");
    }, 3000);

    const container = containerRef.current;
    let isScrolling = false;

    const handleWheel = (e) => {
      const currentIndex = currentIndexRef.current;
      const currentSection = sectionsRef.current[currentIndex];
      const scrollTop = currentSection.scrollTop;
      const scrollHeight = currentSection.scrollHeight;
      const clientHeight = currentSection.clientHeight;
      const isAtTop = scrollTop <= 0;
      const isAtBottom = Math.abs(scrollTop + clientHeight - scrollHeight) < 2;

      if (isScrolling) return;

      // скрываем хедер при скролле вниз
      if (e.deltaY > 0) setShowHeader(false);

      // если есть внутренний скролл — не перелистываем секцию
      if ((e.deltaY > 0 && !isAtBottom) || (e.deltaY < 0 && !isAtTop)) return;

      e.preventDefault();
      isScrolling = true;

      let newIndex = currentIndex;
      if (e.deltaY > 0 && newIndex < sectionsRef.current.length - 1) {
        newIndex++;
      } else if (e.deltaY < 0 && newIndex > 0) {
        newIndex--;
      }

      setActiveIndex(newIndex);
      currentIndexRef.current = newIndex;
      sectionsRef.current[newIndex].scrollIntoView({ behavior: "smooth" });

      if (newIndex === 0) setShowHeader(true);

      setTimeout(() => {
        isScrolling = false;
        AOS.refresh(); // refreshHard можно заменить на обычный refresh, он быстрее
      }, 900);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  const scrollToSection = (index) => {
    setActiveIndex(index);
    currentIndexRef.current = index;
    sectionsRef.current[index].scrollIntoView({ behavior: "smooth" });
    window.scrollTo(0, 0);

    if (index === 0) setShowHeader(true);

    setTimeout(() => AOS.refreshHard(), 700);
  };

  return (
    <main
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 to-black text-white"
    >
      <Header show={showHeader} />
      <RainEffect />

      <section
        ref={(el) => (sectionsRef.current[0] = el)}
        className="h-screen overflow-y-auto snap-start"
        data-aos="fade-up"
      >
        <Hero />
      </section>

      <section
        ref={(el) => (sectionsRef.current[1] = el)}
        className="h-screen overflow-y-auto snap-start"
        data-aos="fade-right"
      >
        <About />
      </section>

      <section
        ref={(el) => (sectionsRef.current[2] = el)}
        className="h-screen overflow-y-auto snap-start"
        data-aos="fade-right"
      >
        <Features />
      </section>

      <section
        ref={(el) => (sectionsRef.current[3] = el)}
        className="h-screen overflow-y-auto snap-start"
        data-aos="fade-right"
      >
        <JoinToCommunity />
      </section>

      {/* Индикаторы */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
        {[0, 1, 2, 3].map((index) => (
          <button
            key={index}
            onClick={() => scrollToSection(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              activeIndex === index
                ? "bg-lime-400 scale-125 shadow-[0_0_10px_rgba(163,230,53,0.8)]"
                : "bg-gray-600 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>

      {/* Кнопка вверх */}
      {activeIndex > 0 && (
        <button
          onClick={() => scrollToSection(0)}
          className="
            fixed bottom-20 right-8 z-50 p-3 rounded-full 
            bg-lime-400/90 backdrop-blur-md text-black 
            shadow-[0_0_20px_rgba(163,230,53,0.6)] 
            hover:shadow-[0_0_25px_rgba(163,230,53,0.9)] 
            hover:scale-110 hover:rotate-6
            transition-all duration-300"
        >
          <ArrowUpward />
        </button>
      )}
    </main>
  );
}
