'use strict';

function getProductTitles(list) {
  return list.map((product) => product.title);
}

function getAvailableProducts(list) {
  return list.filter((product) => product.isAvailable);
}

function searchProducts(list, query) {
  const normalizedQuery = query.trim().toLocaleLowerCase('ru');
  return list.filter((product) => product.title.toLocaleLowerCase('ru').includes(normalizedQuery));
}

function filterProductsByCategory(list, category) {
  return category === 'all' ? [...list] : list.filter((product) => product.category === category);
}

function sortProductsByPrice(list, direction = 'asc') {
  return [...list].sort((a, b) => {
    const difference =
      calculateFinalPrice(a.price, a.discountPercent) -
      calculateFinalPrice(b.price, b.discountPercent);
    return direction === 'desc' ? -difference : difference;
  });
}

function findProductById(list, id) {
  return list.find((product) => product.id === id);
}

function calculateTotalPrice(list) {
  return list.reduce(
    (sum, product) => sum + calculateFinalPrice(product.price, product.discountPercent),
    0,
  );
}

function countAvailableProducts(list) {
  return getAvailableProducts(list).length;
}

function calculateAveragePrice(list) {
  return list.length ? Math.round(calculateTotalPrice(list) / list.length) : 0;
}

function getPreparedProducts(list, state) {
  let result = searchProducts(list, state.query);
  result = filterProductsByCategory(result, state.category);
  if (state.available) result = getAvailableProducts(result);
  if (state.sort === 'price-asc') result = sortProductsByPrice(result);
  if (state.sort === 'price-desc') result = sortProductsByPrice(result, 'desc');
  if (state.sort === 'title-asc')
    result = [...result].sort((a, b) => a.title.localeCompare(b.title, 'ru'));
  return result;
}

function createProductCard(product) {
  const card = createNode('article', 'product-card');
  card.dataset.productId = String(product.id);
  const visual = createNode('div', 'product-card__image-wrap');
  const imageLink = createNode('a');
  imageLink.href = `product.html?id=${product.id}`;
  imageLink.tabIndex = -1;
  imageLink.setAttribute('aria-hidden', 'true');
  const image = createNode('img', 'product-card__image');
  image.src = product.image;
  image.alt = '';
  image.width = 800;
  image.height = 500;
  image.loading = 'lazy';
  imageLink.append(image);
  visual.append(imageLink);
  const favorite = createNode(
    'button',
    'favorite-button',
    shopState.favorites.includes(product.id) ? '♥' : '♡',
  );
  favorite.type = 'button';
  favorite.dataset.favorite = String(product.id);
  favorite.setAttribute(
    'aria-label',
    `${shopState.favorites.includes(product.id) ? 'Убрать из избранного' : 'В избранное'}: ${product.title}`,
  );
  favorite.setAttribute('aria-pressed', String(shopState.favorites.includes(product.id)));
  visual.append(favorite);
  if (product.discountPercent)
    visual.append(createNode('span', 'product-card__badge', `−${product.discountPercent}%`));
  const body = createNode('div', 'product-card__body');
  const category = createNode('p', 'eyebrow', categoryLabels[product.category]);
  const heading = createNode('h3');
  const link = createNode('a', '', product.title);
  link.href = `product.html?id=${product.id}`;
  heading.append(link);
  const description = createNode('p', 'product-card__description', product.description);
  const status = createNode(
    'p',
    'product-status',
    `${getProductStatus(product)} · ★ ${product.rating.toFixed(1)}`,
  );
  const prices = createNode('div', 'product-prices');
  prices.append(createNode('strong', '', formatPrice(getProductPrice(product))));
  if (product.discountPercent) prices.append(createNode('del', '', formatPrice(product.price)));
  const actions = createNode('div', 'card-actions');
  const quick = createNode('button', 'text-button', 'Быстрый просмотр');
  quick.type = 'button';
  quick.dataset.action = 'quick-view';
  quick.dataset.productId = String(product.id);
  actions.append(createCartButton(product), quick);
  body.append(category, heading, description, status, prices, actions);
  card.append(visual, body);
  return card;
}

const catalogState = {
  query: '',
  category: 'all',
  sort: 'default',
  available: false,
  favorites: false,
  min: 0,
  max: Infinity,
  page: 1,
};
const pageSize = 6;

function initCatalog() {
  const container = document.querySelector('[data-products-container]');
  if (!container) return;
  const filters = document.querySelector('#filters-form');
  const sort = document.querySelector('#sort-select');
  const pagination = document.querySelector('#catalog-pagination');
  const titles = document.querySelector('#product-titles');
  getProductTitles(products).forEach((title) => {
    const option = createNode('option');
    option.value = title;
    titles.append(option);
  });
  filters.elements.favorites.checked =
    new URLSearchParams(location.search).get('favorites') === '1';
  function updateCatalog() {
    const focused = document.activeElement;
    const focusId = container.contains(focused)
      ? focused.dataset.favorite || focused.dataset.productId
      : null;
    const focusFavorite = focused?.hasAttribute('data-favorite');
    const prepared = getPreparedProducts(products, catalogState).filter(
      (product) =>
        getProductPrice(product) >= catalogState.min &&
        getProductPrice(product) <= catalogState.max &&
        (!catalogState.favorites || shopState.favorites.includes(product.id)),
    );
    const pageCount = Math.max(1, Math.ceil(prepared.length / pageSize));
    catalogState.page = Math.min(catalogState.page, pageCount);
    const start = (catalogState.page - 1) * pageSize;
    container.replaceChildren();
    prepared
      .slice(start, start + pageSize)
      .forEach((product) => container.append(createProductCard(product)));
    const visible = prepared.length
      ? ` · показано ${start + 1}–${Math.min(start + pageSize, prepared.length)}`
      : '';
    document.querySelector('#result-count').textContent =
      `Найдено моделей: ${prepared.length}${visible}`;
    document.querySelector('#catalog-empty').hidden = prepared.length > 0;
    pagination.replaceChildren();
    pagination.hidden = pageCount === 1;
    for (let page = 1; page <= pageCount; page += 1) {
      const button = createNode('button', 'page-button', String(page));
      button.type = 'button';
      button.dataset.page = String(page);
      button.setAttribute('aria-label', `Страница ${page}`);
      if (page === catalogState.page) {
        button.setAttribute('aria-current', 'page');
        button.disabled = true;
      }
      pagination.append(button);
    }
    refreshFavoriteButtons();
    if (focusId) {
      const selector = focusFavorite
        ? `[data-favorite="${focusId}"]`
        : `[data-product-id="${focusId}"][data-action]`;
      const target =
        container.querySelector(selector) ||
        container.querySelector('[data-favorite]') ||
        filters.elements.favorites;
      target.focus({ preventScroll: true });
    }
  }
  function readControls() {
    const minimum = filters.elements.min;
    const maximum = filters.elements.max;
    const min = minimum.value === '' ? 0 : minimum.valueAsNumber;
    const max = maximum.value === '' ? Infinity : maximum.valueAsNumber;
    const valid = minimum.checkValidity() && maximum.checkValidity() && min <= max;
    document.querySelector('#filter-error').textContent = valid
      ? ''
      : 'Укажи целые неотрицательные цены; верхняя граница не должна быть меньше нижней.';
    minimum.setAttribute('aria-invalid', String(!valid));
    maximum.setAttribute('aria-invalid', String(!valid));
    if (!valid) return;
    Object.assign(catalogState, {
      query: filters.elements.query.value,
      category: filters.elements.category.value,
      available: filters.elements.available.checked,
      favorites: filters.elements.favorites.checked,
      sort: sort.value,
      min,
      max,
      page: 1,
    });
    updateCatalog();
  }
  filters.addEventListener('input', (event) => {
    if (['query', 'min', 'max'].includes(event.target.name)) readControls();
  });
  filters.addEventListener('change', (event) => {
    if (['category', 'available', 'favorites'].includes(event.target.name)) readControls();
  });
  filters.addEventListener('submit', (event) => {
    event.preventDefault();
    readControls();
  });
  sort.addEventListener('change', readControls);
  filters.addEventListener('reset', () => {
    setTimeout(() => {
      sort.value = 'default';
      readControls();
    }, 0);
  });
  document.querySelector('[data-reset-filters]').addEventListener('click', () => {
    filters.reset();
    filters.elements.query.focus();
  });
  pagination.addEventListener('click', (event) => {
    const button = event.target.closest('[data-page]');
    if (!button) return;
    catalogState.page = Number(button.dataset.page);
    updateCatalog();
    const heading = document.querySelector('#collection-title');
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  });
  document.addEventListener('shopchange', updateCatalog);
  readControls();
}

document.addEventListener('DOMContentLoaded', () => {
  const featured = document.querySelector('[data-featured-products]');
  if (featured)
    products.slice(0, 3).forEach((product) => featured.append(createProductCard(product)));
  initCatalog();
});
