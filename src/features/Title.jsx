const titles = [
  "Тут живёт Коржик",
  "Коржик в доме!",
  "Коржик на связи",
  "Молоко и Коржик",
  "С нами Коржик",
  "Коржик рулит",
  "Дом Коржика",
  "Коржик в деле",
  "Мир Коржика",
  "Коржик маскот",
];

export default function animateTitle() {
  const randomTitle = titles[Math.floor(Math.random() * titles.length)];
  let currentText = "";
  let charIndex = 0;
  let isDeleting = false;

  const update = () => {
    if (!isDeleting) {
      // добавляем по одному символу
      currentText = randomTitle.substring(0, charIndex + 1);
      charIndex++;
      if (charIndex === randomTitle.length) {
        isDeleting = true;
      }
    } else {
      // удаляем по одному символу
      currentText = randomTitle.substring(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        // выбираем новый заголовок и перезапускаем
        return animateTitle();
      }
    }

    document.title = `MC - ${currentText}`;
    setTimeout(update, 250);
  };

  update();
}
