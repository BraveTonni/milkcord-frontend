import {
  Headphones,
  InsertDriveFile,
  Chat,
  ViewStream,
  Public,
  Bolt,
} from "@mui/icons-material";

export default function Features() {
  const features = [
    {
      title: "Музыка вместе",
      description:
        "Включай треки, кидай музыку друзьям и слушай одно и то же одновременно. Удобно, просто, без лишних наворотов.",
      icon: <Headphones fontSize="large" className="text-lime-400" />,
    },
    {
      title: "Общение",
      description:
        "Чаты для переписок, быстрые реакции, нормальные уведомления. Просто удобное место, чтобы разговаривать.",
      icon: <Chat fontSize="large" className="text-lime-400" />,
    },
    {
      title: "Файлы и обмен",
      description:
        "Поддержка изображений, видео, документов и другого контента. Загружай, делись, пересылай — без боли.",
      icon: <InsertDriveFile fontSize="large" className="text-lime-400" />,
    },
    {
      title: "Стена",
      description:
        "Лента постов, где ты можешь делиться мыслями, фотками, обновлениями или чем угодно. Всё без алгоритмов и цензуры.",
      icon: <ViewStream fontSize="large" className="text-lime-400" />,
    },
    {
      title: "Персонализация",
      description:
        "Аватар, обложка, ник, био — создавай свой образ. Просто и без искусственных ограничений.",
      icon: <Public fontSize="large" className="text-lime-400" />,
    },
    {
      title: "Поиск",
      description:
        "Ищи людей по нику. Никаких скрытых алгоритмов — только прямой поиск, как должно быть.",
      icon: <Bolt fontSize="large" className="text-lime-400" />,
    },
  ];

  return (
    <section id="features" className="relative py-16.5 bg-gradient-to-b from-black via-gray-900 to-gray-950 text-white min-h-screen snap-start">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(163,230,53,0.15),transparent_70%)]"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Возможности{" "}
          <span className="text-lime-400 font-momo-trust tracking-wider">
            MilkCord
          </span>
        </h2>

        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
          Всё нужное для общения и простого уютного пространства.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-gray-900/50 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm 
              hover:border-lime-400 hover:shadow-[0_0_20px_rgba(163,230,53,0.3)] transition-all duration-300"
            >
              <div className="flex justify-center mb-5">{feature.icon}</div>
              <h3 className="text-2xl font-semibold mb-3 text-lime-400">
                {feature.title}
              </h3>
              <p className="text-gray-300 text-base leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
