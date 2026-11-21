'use strict';

function formatPrice(price) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price);
}

function calculateDiscount(price, discountPercent) {
  return Math.round(price * discountPercent / 100);
}

function calculateFinalPrice(price, discountPercent = 0) {
  return price - calculateDiscount(price, discountPercent);
}

function getProductStatus(product) {
  return product.isAvailable ? 'В наличии' : 'Нет в наличии';
}

function createProductSummary(product) {
  const price = calculateFinalPrice(product.price, product.discountPercent);
  return `${product.title}: ${formatPrice(price)}. ${getProductStatus(product)}.`;
}

const message = document.querySelector('[data-product-summary]');
if (message) message.textContent = createProductSummary(product);

const menu = document.querySelector('.nav-menu');
const desktopMenu = matchMedia('(min-width: 768px)');
function syncMenu() {
  if (menu) menu.open = desktopMenu.matches;
}
syncMenu();
desktopMenu.addEventListener('change', syncMenu);
menu?.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !desktopMenu.matches) {
    menu.open = false;
    menu.querySelector('summary').focus();
  }
});
