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
    const difference = calculateFinalPrice(a.price, a.discountPercent)
      - calculateFinalPrice(b.price, b.discountPercent);
    return direction === 'desc' ? -difference : difference;
  });
}

function findProductById(list, id) {
  return list.find((product) => product.id === id);
}

function calculateTotalPrice(list) {
  return list.reduce((sum, product) => sum + calculateFinalPrice(product.price, product.discountPercent), 0);
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
  if (state.sort === 'title-asc') result = [...result].sort((a, b) => a.title.localeCompare(b.title, 'ru'));
  return result;
}
