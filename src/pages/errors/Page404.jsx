import { Link } from "react-router-dom";

export default function Page404() {
  return (
    <div className="flex flex-1 items-center justify-center w-full bg-gray-950 px-4 h-full">
      <div className="flex flex-col items-center text-center gap-8">
        {/* Логотип */}
        <img
          src="/images/error_404.png"
          alt="MilkCord Error 404"
          className="w-64 h-64 object-contain drop-shadow-lg"
        />

        {/* Код ошибки */}
        <div className="flex justify-center gap-2">
          <span className="text-7xl font-extrabold text-lime-500 animate-bounce [animation-delay:-0.6s]">
            4
          </span>
          <span className="text-7xl font-extrabold text-white animate-bounce">
            0
          </span>
          <span className="text-7xl font-extrabold text-lime-500 animate-bounce [animation-delay:0.5s]">
            4
          </span>
        </div>

        {/* Текст */}
        <div className="space-y-2">
          <p className="text-2xl font-semibold text-gray-200">
            Страница не найдена
          </p>
          <p className="text-gray-400 max-w-md">
            Извините, страница, которую вы ищете, не существует, была
            перемещена или временно недоступна.
          </p>
        </div>

        {/* Кнопка */}
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-lime-600 rounded-xl shadow-md hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2 transition-all duration-200"
        >
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}
