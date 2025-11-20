import { Link } from "react-router-dom";

export default function Maintenance() {
  return (
    <div className="flex flex-1 items-center justify-center w-full bg-gray-950 px-4">
      <div className="flex flex-col items-center text-center gap-8">
        {/* Картинка */}
        <img
          src="/images/maintenance.png"
          alt="MilkCord Maintenance"
          className="w-64 h-64 object-contain drop-shadow-lg"
        />

        {/* Заголовок */}
        <div className="flex flex-col items-center space-y-2">
          <h1 className="text-3xl font-extrabold text-lime-500">
            Технические работы
          </h1>
          <p className="text-gray-400 max-w-md">
            В данный момент мы проводим техническое обслуживание, чтобы сделать
            MilkCord ещё лучше.  
            <br />
            Пожалуйста, зайдите чуть позже.a
          </p>
        </div>

        {/* Кнопка */}
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-lime-600 rounded-xl shadow-md hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2 transition-all duration-200"
        >
          Обновить
        </Link>
      </div>
    </div>
  );
}
