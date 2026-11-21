# KeyboardShop — JavaScript Shop

Контрольная работа №4: «JavaScript: интерактивность, DOM, события, формы и валидация».

Основа — собственный адаптивный HTML/CSS-магазин [КР №3](https://github.com/TitaNik322/kr3-responsive-shop). Bootstrap и другие фреймворки не используются.

## Практика №15

- Сохранены главная, каталог, товар, заявка и контакты.
- `js/data.js` — массив из восьми товаров; `js/main.js` — форматирование цены, скидка, статус товара и краткое описание.
- Внешние скрипты подключены через `defer`. Текст выводится через `textContent`, без интерпретации строки как HTML.
- Функции `formatPrice`, `calculateDiscount`, `calculateFinalPrice`, `getProductStatus`, `createProductSummary` возвращают значения; их можно проверить в Console.

## Запуск

Откройте `index.html` или запустите из папки проекта `python -m http.server 8774 --bind 127.0.0.1` и перейдите на `http://127.0.0.1:8774`.

Автор: Ситников Александр Андреевич, ЭФБО-01-25.

## Практика №16

Массив `products` содержит восемь клавиатур с одинаковыми свойствами: id, title, category, price, discountPercent, rating, isAvailable, image, description, format, connection, switches. Цены — числа, идентификаторы уникальны.

В `catalog.js` реализованы получение названий, отбор по наличию, поиск по названию, фильтр категории, поиск по id, сортировка копии массива, общая и средняя цена и подсчёт доступных моделей. Сортировка учитывает итоговую цену после скидки. Статистика выведена на главной через textContent.

## Фотографии

Новые фотографии получены с Wikimedia Commons, уменьшены до ширины не более 1200 px и переведены в WebP. Лицензии относятся к соответствующим фотографиям; изменения — размер и формат.

- [Keychron K4](https://commons.wikimedia.org/wiki/File:Keychron_K4_mechanical_keyboard.jpg) — iMoD Official, [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/).
- [Keychron K8](https://commons.wikimedia.org/wiki/File:Keychron_K8_Non-Backlight_Wireless_Mechanical_Keyboard_-_52766711146_(cropped).jpg) — Triple-green, [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/).
- [Keychron Q6](https://commons.wikimedia.org/wiki/File:Keychron-q6-whacky-ozzy_(52978547316).jpg) — Chris Heil, [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
- [Apple Magic Keyboard](https://commons.wikimedia.org/wiki/File:Apple_Magic_Keyboard_-_UK.jpg) — GilesMunn, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Подготовленная версия распространяется на тех же условиях.
- [IBM Model M](https://commons.wikimedia.org/wiki/File:Model_M_1391401_keyboard.jpg) — Kaldari, [CC0](https://creativecommons.org/publicdomain/zero/1.0/).

Фотографии Lynace, Logitech, Razer и главного экрана перенесены из собственной предыдущей версии магазина. Права на изображения и товарные знаки принадлежат их владельцам. Изображения с помощью ИИ не создавались.
