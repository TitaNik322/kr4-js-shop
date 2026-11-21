# KeyboardShop — JavaScript Shop

Контрольная работа №4: «JavaScript: интерактивность, DOM, события, формы и валидация».

Основа — собственный адаптивный HTML/CSS-магазин [КР №3](https://github.com/TitaNik322/kr3-responsive-shop). Bootstrap и другие фреймворки не используются.

## Практика №15

- Сохранены главная, каталог, товар, заявка и контакты.
- `js/data.js` — объект товара; `js/main.js` — форматирование цены, скидка, статус товара и краткое описание.
- Внешние скрипты подключены через `defer`. Текст выводится через `textContent`, без интерпретации строки как HTML.
- Функции `formatPrice`, `calculateDiscount`, `calculateFinalPrice`, `getProductStatus`, `createProductSummary` возвращают значения; их можно проверить в Console.

## Запуск

Откройте `index.html` или запустите из папки проекта `python -m http.server 8774 --bind 127.0.0.1` и перейдите на `http://127.0.0.1:8774`.

Автор: Ситников Александр Андреевич, ЭФБО-01-25.
