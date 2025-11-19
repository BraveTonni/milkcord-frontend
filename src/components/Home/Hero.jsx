import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <div className="relative min-h-screen w-full px-4">
      {/* Фон */}
      <div className="absolute cover-bg"></div>
      <div className="absolute inset-0 bg-linear-to-b from-black/60 via-gray-900/60 to-black/90"></div>

      {/* Контент с центрированием и возможностью скролла */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full pt-40 px-4 text-center">
        {/* Логотип */}
        <div className="flex justify-center mb-8">
          <img
            src="/images/hello.gif"
            className="size-72 object-contain"
            alt="MilkCord Hello"
          />
        </div>

        {/* Заголовок */}
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Добро пожаловать в{" "}
          <span className="text-lime-400 font-momo-trust tracking-wider">
            MilkCord
          </span>
        </h1>

        {/* Подзаголовок */}
        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          Ваше новое пространство для общения, работы и творчества.
          Присоединяйтесь к сообществу уже сегодня.
        </p>

        {/* Кнопки */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-lime-500 hover:bg-lime-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors duration-200"
          >
            Начать
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center justify-center px-8 py-3 border border-gray-700 text-base font-medium rounded-md text-white bg-transparent hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            Узнать больше
          </Link>
        </div>

        {/* Добавим немного пустого пространства внизу для скролла */}
        <div className="h-40"></div>
      </div>
    </div>
  );
}
