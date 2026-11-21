'use strict';

function formatPrice(price) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price);
}

function calculateDiscount(price, discountPercent) {
  return Math.round((price * discountPercent) / 100);
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
  message.textContent =
    storageAvailable || text.includes('вкладке')
      ? text
      : `${text} Изменения останутся только в этой вкладке.`;
  message.hidden = false;
  messageTimer = setTimeout(() => {
    message.hidden = true;
  }, 6000);
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
  document.querySelector('[data-detail-price]').textContent = formatPrice(
    getProductPrice(selected),
  );
  document.querySelector('[data-detail-status]').textContent = getProductStatus(selected);
  document.querySelector('[data-product-summary]').textContent = createProductSummary(selected);
  const image = document.querySelector('[data-detail-image]');
  image.src = selected.image;
  image.alt = selected.title;
  const cart = document.querySelector('[data-detail-cart]');
  cart.dataset.productId = String(selected.id);
  cart.disabled = !selected.isAvailable;
  cart.textContent = selected.isAvailable ? 'В корзину' : 'Нет в наличии';
  document.querySelector('[data-detail-favorite]').dataset.favorite = String(selected.id);
  document.querySelector('[data-open-product]').dataset.productId = String(selected.id);
  const specs = document.querySelector('[data-specs-body]');
  const properties = {
    Формат: selected.format,
    Переключатели: selected.switches,
    Подключение: selected.connection,
    Наличие: getProductStatus(selected),
  };
  specs.replaceChildren();
  Object.entries(properties).forEach(([label, value]) => {
    const row = createNode('tr');
    const heading = createNode('th', '', label);
    heading.scope = 'row';
    row.append(heading, createNode('td', '', value));
    specs.append(row);
  });
}

const storageKey = 'keyboardshop-kr4-v1';
let storageAvailable = true;
let shopState = { cart: [], favorites: [], promo: '', theme: 'light' };

function restoreShopState() {
  let saved;
  try {
    const raw = localStorage.getItem(storageKey);
    try {
      saved = raw === null ? null : JSON.parse(raw);
    } catch {
      localStorage.removeItem(storageKey);
      showMessage('Повреждённые сохранённые данные сброшены. Можно начать заново.');
    }
    storageAvailable = true;
  } catch {
    storageAvailable = false;
    showMessage('Хранилище браузера недоступно. Изменения останутся только в этой вкладке.');
    return;
  }
  const result = { cart: [], favorites: [], promo: '', theme: 'light' };
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
    const seen = new Set();
    if (Array.isArray(saved.cart)) {
      for (const item of saved.cart) {
        const product = products.find((product) => product.id === item?.productId);
        if (
          product?.isAvailable &&
          Number.isInteger(item.quantity) &&
          item.quantity >= 1 &&
          item.quantity <= 10 &&
          !seen.has(product.id)
        ) {
          result.cart.push({ productId: product.id, quantity: item.quantity });
          seen.add(product.id);
        }
      }
    }
    if (Array.isArray(saved.favorites))
      result.favorites = [
        ...new Set(saved.favorites.filter((id) => products.some((product) => product.id === id))),
      ];
    result.promo = saved.promo === 'KEY10' ? 'KEY10' : '';
    result.theme = saved.theme === 'dark' ? 'dark' : 'light';
  }
  shopState = result;
}

function saveShopState() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(shopState));
    storageAvailable = true;
  } catch {
    storageAvailable = false;
    showMessage('Изменения действуют в этой вкладке; браузер не разрешил их сохранить.');
  }
}

function refreshShopCounters() {
  const count = shopState.cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('[data-cart-count]').forEach((node) => {
    node.textContent = String(count);
  });
  document.querySelectorAll('[data-favorite-count]').forEach((node) => {
    node.textContent = String(shopState.favorites.length);
  });
  const favorites = document.querySelector('.header-favorites');
  if (favorites)
    favorites.setAttribute('aria-label', `Избранное: ${shopState.favorites.length} моделей`);
  const cart = document.querySelector('.header-cart');
  if (cart) cart.setAttribute('aria-label', `Корзина: ${count} товаров`);
}

function refreshFavoriteButtons() {
  document.querySelectorAll('[data-favorite]').forEach((button) => {
    const id = Number(button.dataset.favorite);
    const selected = shopState.favorites.includes(id);
    const product = findProductById(products, id);
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute(
      'aria-label',
      `${selected ? 'Убрать из избранного' : 'В избранное'}: ${product?.title || ''}`,
    );
    button.textContent = button.classList.contains('favorite-button')
      ? selected
        ? '♥'
        : '♡'
      : selected
        ? 'Убрать из избранного'
        : 'В избранное';
  });
}

function announceShopChange() {
  saveShopState();
  refreshShopCounters();
  refreshFavoriteButtons();
  document.dispatchEvent(new Event('shopchange'));
}

function applyTheme() {
  const dark = shopState.theme === 'dark';
  document.documentElement.classList.toggle('dark-theme', dark);
  const button = document.querySelector('[data-theme-toggle]');
  if (button) {
    button.textContent = dark ? '☀' : '☾';
    button.setAttribute('aria-pressed', String(dark));
    button.setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  restoreShopState();
  applyTheme();
  initNavigation();
  initProductPage();
  refreshShopCounters();
  refreshFavoriteButtons();
  const summary = document.querySelector('.hero [data-product-summary]');
  if (summary)
    summary.textContent = `${products.length} моделей · ${countAvailableProducts(products)} в наличии · средняя цена ${formatPrice(calculateAveragePrice(products))}`;
  document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
    shopState.theme = shopState.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
    saveShopState();
  });
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-favorite]');
    if (!button) return;
    const id = Number(button.dataset.favorite);
    if (!findProductById(products, id)) return;
    const selected = shopState.favorites.includes(id);
    shopState.favorites = selected
      ? shopState.favorites.filter((savedId) => savedId !== id)
      : [...shopState.favorites, id];
    announceShopChange();
    showMessage(
      selected ? 'Клавиатура убрана из избранного.' : 'Клавиатура сохранена в избранном.',
    );
  });
  window.addEventListener('storage', (event) => {
    if (event.key !== storageKey && event.key !== null) return;
    restoreShopState();
    applyTheme();
    refreshShopCounters();
    refreshFavoriteButtons();
    document.dispatchEvent(new Event('shopchange'));
  });
});
