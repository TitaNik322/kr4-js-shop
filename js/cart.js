'use strict';

function getCartItems() {
  return shopState.cart
    .map((item) => ({
      product: findProductById(products, item.productId),
      quantity: item.quantity,
    }))
    .filter((item) => item.product?.isAvailable);
}

function getCartTotals() {
  const items = getCartItems();
  const subtotal = items.reduce(
    (sum, item) => sum + getProductPrice(item.product) * item.quantity,
    0,
  );
  const discount = shopState.promo === 'KEY10' ? calculateDiscount(subtotal, 10) : 0;
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return { items, subtotal, discount, total: subtotal - discount, count };
}

function createCartButton(product) {
  const button = createNode(
    'button',
    'button',
    product.isAvailable ? 'В корзину' : 'Нет в наличии',
  );
  button.type = 'button';
  button.dataset.action = 'add-to-cart';
  button.dataset.productId = String(product.id);
  button.disabled = !product.isAvailable;
  return button;
}

function addToCart(id) {
  const product = findProductById(products, id);
  if (!product?.isAvailable) {
    showMessage('Эта клавиатура пока недоступна');
    return;
  }
  const item = shopState.cart.find((item) => item.productId === id);
  if (item?.quantity === 10) {
    showMessage('Можно выбрать не больше 10 экземпляров одной модели');
    return;
  }
  if (item) item.quantity += 1;
  else shopState.cart.push({ productId: id, quantity: 1 });
  announceShopChange();
  showMessage(`${product.title} добавлена в корзину`);
}

function createCartRow(product, quantity) {
  const row = createNode('article', 'cart-item');
  row.dataset.cartId = String(product.id);
  const image = createNode('img');
  image.src = product.image;
  image.alt = product.title;
  image.width = 120;
  image.height = 90;
  const info = createNode('div', 'cart-item__info');
  const heading = createNode('h2');
  const link = createNode('a', '', product.title);
  link.href = `product.html?id=${product.id}`;
  heading.append(link);
  info.append(
    heading,
    createNode('p', 'form-note', `${formatPrice(getProductPrice(product))} за штуку`),
  );
  const controls = createNode('div', 'quantity-control');
  const minus = createNode('button', 'quantity-button', '−');
  minus.type = 'button';
  minus.dataset.cartAction = 'minus';
  minus.dataset.productId = String(product.id);
  minus.disabled = quantity === 1;
  minus.setAttribute('aria-label', `Уменьшить количество: ${product.title}`);
  const input = createNode('input');
  input.type = 'number';
  input.min = '1';
  input.max = '10';
  input.step = '1';
  input.value = String(quantity);
  input.dataset.cartQuantity = String(product.id);
  input.setAttribute('aria-label', `Количество: ${product.title}`);
  const plus = createNode('button', 'quantity-button', '+');
  plus.type = 'button';
  plus.dataset.cartAction = 'plus';
  plus.dataset.productId = String(product.id);
  plus.disabled = quantity === 10;
  plus.setAttribute('aria-label', `Увеличить количество: ${product.title}`);
  controls.append(minus, input, plus);
  const remove = createNode('button', 'text-button', 'Убрать');
  remove.type = 'button';
  remove.dataset.cartAction = 'remove';
  remove.dataset.productId = String(product.id);
  remove.setAttribute('aria-label', `Убрать из корзины: ${product.title}`);
  const price = createNode(
    'strong',
    'cart-item__total',
    formatPrice(getProductPrice(product) * quantity),
  );
  info.append(controls, remove);
  row.append(image, info, price);
  return row;
}

function renderCart() {
  const container = document.querySelector('#cart-items');
  if (!container) return;
  const active = document.activeElement;
  const focusId = active?.dataset.productId || active?.dataset.cartQuantity;
  const focusAction = active?.dataset.cartAction;
  const totals = getCartTotals();
  document.querySelector('#cart-empty').hidden = totals.items.length > 0;
  document.querySelector('#cart-content').hidden = totals.items.length === 0;
  const rows = [...container.children];
  const sameItems =
    rows.length === totals.items.length &&
    rows.every((row, index) => Number(row.dataset.cartId) === totals.items[index].product.id);
  if (!sameItems) {
    container.replaceChildren();
    totals.items.forEach(({ product, quantity }) =>
      container.append(createCartRow(product, quantity)),
    );
  } else {
    totals.items.forEach(({ product, quantity }, index) => {
      const row = rows[index];
      row.querySelector('input').value = String(quantity);
      row.querySelector('[data-cart-action="minus"]').disabled = quantity === 1;
      row.querySelector('[data-cart-action="plus"]').disabled = quantity === 10;
      row.querySelector('.cart-item__total').textContent = formatPrice(
        getProductPrice(product) * quantity,
      );
    });
  }
  const summary = document.querySelector('[data-cart-totals]');
  summary.replaceChildren();
  summary.append(createNode('p', '', `Количество: ${totals.count}`));
  summary.append(createNode('p', '', `Товары: ${formatPrice(totals.subtotal)}`));
  if (totals.discount)
    summary.append(
      createNode('p', 'discount-line', `Промокод KEY10: −${formatPrice(totals.discount)}`),
    );
  summary.append(createNode('strong', 'cart-total', `Итого: ${formatPrice(totals.total)}`));
  document.querySelector('#remove-promo').hidden = !shopState.promo;
  if (focusId) {
    const selector = focusAction
      ? `[data-product-id="${focusId}"][data-cart-action="${focusAction}"]:not(:disabled)`
      : `[data-cart-quantity="${focusId}"]`;
    const target =
      container.querySelector(selector) ||
      container.querySelector('input') ||
      document.querySelector('#cart-empty a');
    target?.focus({ preventScroll: true });
  }
}

function changeCartQuantity(id, quantity) {
  const item = shopState.cart.find((item) => item.productId === id);
  if (!item) return;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    showMessage('Количество должно быть целым числом от 1 до 10');
    renderCart();
    return;
  }
  item.quantity = quantity;
  announceShopChange();
}

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="add-to-cart"]');
    if (button && !button.disabled) addToCart(Number(button.dataset.productId));
  });
  const container = document.querySelector('#cart-items');
  if (!container) return;
  container.addEventListener('click', (event) => {
    const button = event.target.closest('[data-cart-action]');
    if (!button || !container.contains(button)) return;
    const id = Number(button.dataset.productId);
    const item = shopState.cart.find((item) => item.productId === id);
    if (!item) return;
    if (button.dataset.cartAction === 'remove') {
      shopState.cart = shopState.cart.filter((item) => item.productId !== id);
      announceShopChange();
      showMessage('Клавиатура убрана из корзины');
    } else {
      changeCartQuantity(id, item.quantity + (button.dataset.cartAction === 'plus' ? 1 : -1));
    }
  });
  container.addEventListener('change', (event) => {
    if (event.target.matches('[data-cart-quantity]'))
      changeCartQuantity(Number(event.target.dataset.cartQuantity), event.target.valueAsNumber);
  });
  document.querySelector('#clear-cart').addEventListener('click', () => {
    shopState.cart = [];
    announceShopChange();
    showMessage('Корзина очищена');
    document.querySelector('#cart-empty a').focus();
  });
  document.querySelector('#promo-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.querySelector('#promo-code');
    const valid = input.value.trim().toUpperCase() === 'KEY10';
    input.setAttribute('aria-invalid', String(!valid));
    document.querySelector('#promo-message').textContent = valid
      ? ''
      : 'Промокод не найден. Попробуй KEY10';
    if (!valid) return;
    shopState.promo = 'KEY10';
    announceShopChange();
    showMessage('Промокод KEY10 применён: скидка 10%');
  });
  document.querySelector('#remove-promo').addEventListener('click', () => {
    shopState.promo = '';
    document.querySelector('#promo-code').value = '';
    document.querySelector('#promo-message').textContent = '';
    document.querySelector('#promo-code').removeAttribute('aria-invalid');
    announceShopChange();
  });
  document.addEventListener('shopchange', renderCart);
  renderCart();
});
