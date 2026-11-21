'use strict';

function formatPrice(price) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency', currency: 'RUB', maximumFractionDigits: 0,
  }).format(price);
}

function calculateDiscount(price, discountPercent) {
  return Math.round(price * discountPercent / 100);
}

function calculateFinalPrice(price, discountPercent = 0) {
  return price - calculateDiscount(price, discountPercent);
}

function getProductPrice(product) {
  return calculateFinalPrice(product.price, product.discountPercent);
}

function getProductStatus(product) {
  return product.isAvailable ? 'В наличии' : 'Нет в наличии';
}

function createProductSummary(product) {
  return `${product.title}: ${formatPrice(getProductPrice(product))}. ${getProductStatus(product)}.`;
}

// Общий способ создания узла: текст всегда остаётся текстом.
function createNode(tag, className = '', text = '') {
  const element = document.createElement(tag);
  if (className) element.classList.add(...className.split(' '));
  if (text !== '') element.textContent = text;
  return element;
}

let messageTimer;
function showMessage(text) {
  const message = document.querySelector('#site-message');
  if (!message) return;
  clearTimeout(messageTimer);
  message.textContent = text;
  message.hidden = false;
  messageTimer = setTimeout(() => { message.hidden = true; }, 6000);
}

function initNavigation() {
  const menu = document.querySelector('.nav-menu');
  const filters = document.querySelector('.filter-panel');
  const desktopMenu = matchMedia('(min-width: 768px)');
  const desktopFilters = matchMedia('(min-width: 1024px)');
  function syncPanels() {
    if (menu) menu.open = desktopMenu.matches;
    if (filters) filters.open = desktopFilters.matches;
  }
  syncPanels();
  desktopMenu.addEventListener('change', syncPanels);
  desktopFilters.addEventListener('change', syncPanels);
  menu?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !desktopMenu.matches) {
      menu.open = false;
      menu.querySelector('summary').focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (menu && !desktopMenu.matches && !menu.contains(event.target)) menu.open = false;
  });
}

function initProductPage() {
  const detail = document.querySelector('[data-product-detail]');
  if (!detail) return;
  const params = new URLSearchParams(location.search);
  const id = params.has('id') ? Number(params.get('id')) : products[0].id;
  const selected = findProductById(products, id);
  if (!selected) {
    detail.hidden = true;
    document.querySelector('[data-detail-specs]').hidden = true;
    document.querySelector('[data-product-error]').hidden = false;
    document.title = 'Товар не найден — KeyboardShop';
    return;
  }
  document.title = `${selected.title} — KeyboardShop`;
  document.querySelector('[data-product-breadcrumb]').textContent = selected.title;
  document.querySelector('[data-detail-title]').textContent = selected.title;
  document.querySelector('[data-detail-category]').textContent = categoryLabels[selected.category];
  document.querySelector('[data-detail-description]').textContent = selected.description;
  document.querySelector('[data-detail-price]').textContent = formatPrice(getProductPrice(selected));
  document.querySelector('[data-detail-status]').textContent = getProductStatus(selected);
  document.querySelector('[data-product-summary]').textContent = createProductSummary(selected);
  const image = document.querySelector('[data-detail-image]');
  image.src = selected.image;
  image.alt = selected.title;
  const order = document.querySelector('[data-detail-order]');
  order.href = `order.html?product=${selected.id}`;
  order.hidden = !selected.isAvailable;
  document.querySelector('[data-open-product]').dataset.productId = String(selected.id);
  const specs = document.querySelector('[data-specs-body]');
  const properties = { Формат: selected.format, Переключатели: selected.switches, Подключение: selected.connection, Наличие: getProductStatus(selected) };
  specs.replaceChildren();
  Object.entries(properties).forEach(([label, value]) => {
    const row = createNode('tr');
    const heading = createNode('th', '', label);
    heading.scope = 'row';
    row.append(heading, createNode('td', '', value));
    specs.append(row);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initProductPage();
  const summary = document.querySelector('.hero [data-product-summary]');
  if (summary) {
    summary.textContent = `${products.length} моделей · ${countAvailableProducts(products)} в наличии · средняя цена ${formatPrice(calculateAveragePrice(products))}`;
  }
});
