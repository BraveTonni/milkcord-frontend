import { RocketLaunch, Forum, Favorite, Diversity3 } from "@mui/icons-material";
import { Link } from "react-router-dom";

export default function JoinToCommunity() {
  const steps = [
    {
      title: "Создай профиль",
      description:
        "Выбери ник, загрузи аватар и оформи свой образ. MilkCord — это пространство, где каждый может быть собой.",
      icon: <Diversity3 fontSize="large" className="text-lime-400" />,
    },
    {
      title: "Начни общаться",
      description:
        "Пиши в чатах, делись файлами, мемами, музыкой и моментами из жизни. Простое и удобное общение без лишних барьеров.",
      icon: <Forum fontSize="large" className="text-lime-400" />,
    },
    {
      title: "Проявляй эмоции",
      description:
        "Оставляй реакции, лайки и ответы. Поддерживай друзей, делись настроением и создавай уют вокруг себя.",
      icon: <Favorite fontSize="large" className="text-lime-400" />,
    },
    {
      title: "Собирай людей вокруг себя",
      description:
        "Веди свою стену, создавай атмосферу, делись мыслями и находи тех, кому близок твой вайб.",
      icon: <RocketLaunch fontSize="large" className="text-lime-400" />,
    },
  ];

  return (
    <section
      id="join"
      className="relative py-24 bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white h-screen snap-start"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(163,230,53,0.12),transparent_70%)]"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center pb-24">
        <h2 className="text-4xl md:text-5xl font-bold mb-10">
          Присоединяйся к{" "}
          <span className="text-lime-400 font-momo-trust tracking-wider">
            MilkCord
          </span>{" "}
          комьюнити
        </h2>

        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-16">
          Уютная соцсеть для общения, музыки и обмена моментами. Никаких правил
          сверху — только люди и их атмосфера.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative bg-gray-900/50 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm 
              hover:border-lime-400 hover:shadow-[0_0_25px_rgba(163,230,53,0.3)] transition-all duration-300"
            >
              <div className="flex justify-center mb-5">{step.icon}</div>
              <h3 className="text-2xl font-semibold mb-3 text-lime-400">
                {step.title}
              </h3>
              <p className="text-gray-300 text-base leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <Link
            to="/register"
            className="px-8 py-4 bg-lime-400 text-white font-bold text-lg rounded-full 
          hover:bg-lime-300 transition-all duration-300 shadow-[0_0_20px_rgba(163,230,53,0.4)] cursor-pointer inline-block text-center"
          >
            Присоединиться к сообществу
          </Link>
        </div>
      </div>
    </section>
  );
}
