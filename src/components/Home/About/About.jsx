import {
  AutoAwesome,
  Diversity3,
  Psychology,
  Timeline,
} from "@mui/icons-material";

export default function About() {
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-gradient-to-b from-gray-950 via-black to-gray-950 py-33 text-white"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(163,230,53,0.15),transparent_50%),radial-gradient(circle_at_80%_90%,rgba(255,255,255,0.05),transparent_60%)]"></div>

      <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[60%] h-[200px] bg-lime-400/10 blur-[120px] rounded-full"></div>

      <div className="absolute inset-0 opacity-30"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-12 max-w-6xl mx-auto px-6">

          <div className="md:w-1/2 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Про{" "}
              <span className="text-lime-400 font-momo-trust tracking-wider">
                MilkCord
              </span>
            </h2>

            <p className="text-gray-400 text-lg mb-12 leading-relaxed">
              MilkCord — это небольшой проект социальной платформы, который мы
              делаем честно и без лишнего пафоса. Здесь нет маркетинговой магии —
              просто место для общения, кастомизации и угара с друзьями.
            </p>
          </div>

          <div className="md:w-1/2 flex justify-center relative">
            <img
              src="/images/omg.png"
              alt="MilkCord Logo"
              className="absolute w-56 -top-49 -rotate-8 transition-transform duration-700 ease-out drop-shadow-[0_0_40px_rgba(163,230,53,0.4)] z-3"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">

          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-8 backdrop-blur-md hover:border-lime-400/50 transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <AutoAwesome className="text-lime-400" fontSize="large" />
              <h3 className="text-2xl font-semibold text-lime-400">Идея</h3>
            </div>
            <p className="text-gray-300">
              MilkCord появился не как стартап, а как «давай просто сделаем нормальное
              место для общения». Мы пробуем, экспериментируем и добавляем то, что
              реально хочется использовать самим.
            </p>
          </div>

          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-8 backdrop-blur-md hover:border-lime-400/50 transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <Diversity3 className="text-lime-400" fontSize="large" />
              <h3 className="text-2xl font-semibold text-lime-400">Сообщество</h3>
            </div>
            <p className="text-gray-300">
              У нас маленькое, уютное комьюнити. Тут ценят атмосферу, честность и
              нормальное общение — без алгоритмов, токсичности и маркетинговых
              обещаний.
            </p>
          </div>

          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-8 backdrop-blur-md hover:border-lime-400/50 transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <Psychology className="text-lime-400" fontSize="large" />
              <h3 className="text-2xl font-semibold text-lime-400">
                Технологии
              </h3>
            </div>
            <p className="text-gray-300">
              Технически мы используем нормальный стек, без сказок про
              сверх-ИИ. Добавляем только то, что реально делает платформу
              удобнее: чаты, медиа, профили и приятные мелочи.
            </p>
          </div>

          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-8 backdrop-blur-md hover:border-lime-400/50 transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <Timeline className="text-lime-400" fontSize="large" />
              <h3 className="text-2xl font-semibold text-lime-400">Будущее</h3>
            </div>
            <p className="text-gray-300">
              Проект растёт спокойно и честно. Мы не обещаем революций — просто
              улучшаем платформу по мере нужды и фидбэка. MilkCord развивается
              вместе с людьми, которые им пользуются.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
