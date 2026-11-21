'use strict';

const categoryLabels = {
  mechanical: 'Механические',
  optical: 'Оптические',
  scissor: 'Ножничные',
};

// Цены, рейтинги и наличие заданы для сценария интерфейса.
const products = [
  {
    "id": 1,
    "title": "Lynace K1 Dragon",
    "category": "mechanical",
    "price": 5990,
    "discountPercent": 0,
    "rating": 4.7,
    "isAvailable": true,
    "image": "images/product-1-light-800.webp",
    "description": "Яркий корпус, съёмный кабель и компактная раскладка без цифрового блока.",
    "format": "80% (TKL)",
    "connection": "USB-C",
    "switches": "Механические, hot-swap"
  },
  {
    "id": 2,
    "title": "Logitech G Pro X",
    "category": "mechanical",
    "price": 12990,
    "discountPercent": 0,
    "rating": 4.8,
    "isAvailable": true,
    "image": "images/product-2-320.webp",
    "description": "Компактная игровая клавиатура со съёмным кабелем и сменными переключателями.",
    "format": "80% (TKL)",
    "connection": "USB",
    "switches": "Механические GX"
  },
  {
    "id": 3,
    "title": "Razer Huntsman V2",
    "category": "optical",
    "price": 17990,
    "discountPercent": 10,
    "rating": 4.9,
    "isAvailable": true,
    "image": "images/product-3-800.webp",
    "description": "Оптические переключатели и полноразмерная раскладка для быстрого отклика.",
    "format": "100%",
    "connection": "USB",
    "switches": "Оптические Razer"
  },
  {
    "id": 4,
    "title": "Keychron K4",
    "category": "mechanical",
    "price": 8990,
    "discountPercent": 0,
    "rating": 4.6,
    "isAvailable": true,
    "image": "images/keychron-k4.webp",
    "description": "Плотная раскладка с цифровым блоком для работы с текстом и числами.",
    "format": "96%",
    "connection": "USB-C / Bluetooth",
    "switches": "Механические"
  },
  {
    "id": 5,
    "title": "Keychron K8",
    "category": "mechanical",
    "price": 9990,
    "discountPercent": 15,
    "rating": 4.8,
    "isAvailable": true,
    "image": "images/keychron-k8.webp",
    "description": "Беспроводная механика без цифрового блока: больше места для мыши.",
    "format": "80% (TKL)",
    "connection": "USB-C / Bluetooth",
    "switches": "Механические"
  },
  {
    "id": 6,
    "title": "Keychron Q6",
    "category": "mechanical",
    "price": 19990,
    "discountPercent": 0,
    "rating": 4.7,
    "isAvailable": false,
    "image": "images/keychron-q6.webp",
    "description": "Полноразмерная механическая клавиатура в алюминиевом корпусе.",
    "format": "100%",
    "connection": "USB-C",
    "switches": "Механические"
  },
  {
    "id": 7,
    "title": "Apple Magic Keyboard",
    "category": "scissor",
    "price": 10990,
    "discountPercent": 0,
    "rating": 4.6,
    "isAvailable": true,
    "image": "images/apple-magic.webp",
    "description": "Низкий профиль, компактный корпус и ножничный механизм клавиш.",
    "format": "Компактная",
    "connection": "Bluetooth / Lightning",
    "switches": "Ножничные"
  },
  {
    "id": 8,
    "title": "IBM Model M",
    "category": "mechanical",
    "price": 14990,
    "discountPercent": 0,
    "rating": 4.9,
    "isAvailable": false,
    "image": "images/ibm-model-m.webp",
    "description": "Классическая полноразмерная клавиатура с выраженным тактильным откликом.",
    "format": "101 клавиша",
    "connection": "PS/2",
    "switches": "Пружинный механизм"
  }
];
