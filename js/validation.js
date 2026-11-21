'use strict';

function getFieldError(field) {
  if (field.disabled) return '';
  const value = field.value.trim();
  if (field.type === 'checkbox')
    return field.required && !field.checked ? 'Подтверди согласие.' : '';
  if (!value) return field.required ? 'Заполни это поле.' : '';
  if (field.name === 'name' && (value.length < 2 || value.length > 80))
    return 'Имя должно содержать от 2 до 80 символов.';
  if (
    field.name === 'email' &&
    (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || !field.checkValidity())
  )
    return 'Проверь адрес электронной почты.';
  if (field.name === 'phone') {
    const digits = value.replace(/\D/g, '');
    if (!/^[+\d\s()-]+$/.test(value) || !/^[78]\d{10}$/.test(digits))
      return 'Нужны 11 цифр: +7 или 8 и ещё 10 цифр.';
  }
  if (field.name === 'product') {
    if (value === 'cart')
      return getCartItems().length
        ? ''
        : 'Корзина пуста. Добавь клавиатуру или выбери отдельную модель.';
    const product = findProductById(products, Number(value));
    if (!product?.isAvailable) return 'Выбери клавиатуру в наличии.';
  }
  if (
    field.name === 'quantity' &&
    (!Number.isInteger(Number(value)) || Number(value) < 1 || Number(value) > 10)
  )
    return 'Укажи целое количество от 1 до 10.';
  if (field.minLength > 0 && value.length < field.minLength)
    return `Нужно не меньше ${field.minLength} символов.`;
  if (field.maxLength > 0 && value.length > field.maxLength)
    return `Допустимо не больше ${field.maxLength} символов.`;
  if (!field.checkValidity()) return 'Проверь значение поля.';
  return '';
}

function setFieldError(field, text) {
  const error = document.getElementById(`${field.id}-error`);
  if (error) error.textContent = text;
  field.classList.toggle('is-invalid', Boolean(text));
  if (text) field.setAttribute('aria-invalid', 'true');
  else field.removeAttribute('aria-invalid');
}

function getOrderValues(form) {
  const fromCart = form.elements.product.value === 'cart';
  const product = findProductById(products, Number(form.elements.product.value));
  const quantity = Number(form.elements.quantity.value);
  let items = [];
  if (fromCart) items = getCartItems();
  else if (product?.isAvailable && Number.isInteger(quantity) && quantity >= 1 && quantity <= 10)
    items = [{ product, quantity }];
  const subtotal = items.reduce(
    (sum, item) => sum + getProductPrice(item.product) * item.quantity,
    0,
  );
  const discount = shopState.promo === 'KEY10' ? calculateDiscount(subtotal, 10) : 0;
  const courier = form.elements.delivery.value === 'courier';
  const delivery = items.length && courier && subtotal - discount < 10000 ? 390 : 0;
  return {
    items,
    subtotal,
    discount,
    delivery,
    total: subtotal - discount + delivery,
    courier,
    fromCart,
  };
}

function updateOrderSummary(form) {
  const summary = document.querySelector('[data-order-summary]');
  if (!summary) return;
  const order = getOrderValues(form);
  summary.replaceChildren();
  order.items.forEach(({ product, quantity }) => {
    summary.append(createNode('p', '', `${product.title} × ${quantity}`));
  });
  if (!order.items.length) summary.append(createNode('p', '', 'Клавиатура пока не выбрана.'));
  summary.append(createNode('p', '', `Товары: ${formatPrice(order.subtotal)}`));
  if (order.discount)
    summary.append(createNode('p', 'discount-line', `KEY10: −${formatPrice(order.discount)}`));
  summary.append(createNode('p', '', `Доставка: ${formatPrice(order.delivery)}`));
  summary.append(createNode('strong', '', `Итого: ${formatPrice(order.total)}`));
  form.elements.quantity.disabled = order.fromCart;
  form.elements.quantity.closest('.form-field').hidden = order.fromCart;
  const address = form.elements.address;
  address.disabled = !order.courier;
  address.required = order.courier;
  document.querySelector('#address-field').hidden = !order.courier;
  if (!order.courier) setFieldError(address, '');
}

function initRequestForms() {
  let pendingSignature = '';
  let requestTimer;
  document.querySelectorAll('[data-request-form]').forEach((form, formIndex) => {
    form.noValidate = true;
    const status = form.querySelector('.form-status');
    const fields = [...form.querySelectorAll('input:not([type="hidden"]), select, textarea')];
    fields.forEach((field) => {
      if (!field.id) field.id = `request-${formIndex}-${field.name}`;
      const error = createNode('span', 'field-error');
      error.id = `${field.id}-error`;
      const existingHints = field.getAttribute('aria-describedby');
      field.setAttribute('aria-describedby', [existingHints, error.id].filter(Boolean).join(' '));
      if (field.type === 'checkbox') field.closest('label').after(error);
      else field.after(error);
      field.addEventListener('input', () => {
        if (field.hasAttribute('aria-invalid')) setFieldError(field, getFieldError(field));
      });
      field.addEventListener('change', () => {
        if (field.hasAttribute('aria-invalid')) setFieldError(field, getFieldError(field));
      });
    });
    const isOrder = form.id === 'order-form';
    if (isOrder) {
      const select = form.elements.product;
      products.forEach((product) => {
        const option = createNode(
          'option',
          '',
          `${product.title} — ${formatPrice(getProductPrice(product))}${product.isAvailable ? '' : ' (нет в наличии)'}`,
        );
        option.value = String(product.id);
        option.disabled = !product.isAvailable;
        select.append(option);
      });
      const params = new URLSearchParams(location.search);
      const requested = params.get('product');
      if (params.get('source') === 'cart') select.value = 'cart';
      if (requested !== null) {
        const selected = findProductById(products, Number(requested));
        if (selected?.isAvailable) select.value = String(selected.id);
        else showMessage('Модель из ссылки недоступна. Выбери другую клавиатуру.');
      }
      form.addEventListener('input', () => updateOrderSummary(form));
      form.addEventListener('change', () => updateOrderSummary(form));
      document.addEventListener('shopchange', () => {
        updateOrderSummary(form);
        const dialog = document.querySelector('#confirm-dialog');
        if (dialog.open) {
          dialog.close();
          status.textContent = 'Корзина или промокод изменились. Подготовь заявку заново.';
        }
      });
      document.querySelector('#order-fields').disabled = false;
      updateOrderSummary(form);
    }
    form.addEventListener('reset', () => {
      fields.forEach((field) => setFieldError(field, ''));
      status.textContent = '';
      setTimeout(() => {
        if (isOrder) updateOrderSummary(form);
      }, 0);
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      let firstInvalid;
      fields.forEach((field) => {
        const error = getFieldError(field);
        setFieldError(field, error);
        if (error && !firstInvalid) firstInvalid = field;
      });
      if (firstInvalid) {
        status.textContent = 'Проверь отмеченные поля.';
        firstInvalid.focus();
        return;
      }
      if (isOrder) {
        const order = getOrderValues(form);
        const details = document.querySelector('[data-confirm-details]');
        details.replaceChildren();
        const values = {
          Товары: order.items
            .map(({ product, quantity }) => `${product.title} × ${quantity}`)
            .join(', '),
          Имя: form.elements.name.value.trim(),
          Почта: form.elements.email.value.trim(),
          Телефон: form.elements.phone.value.trim(),
          Получение: order.courier ? 'Курьер' : 'Самовывоз',
        };
        if (order.courier) values['Адрес'] = form.elements.address.value.trim();
        if (form.elements.comment.value.trim())
          values['Комментарий'] = form.elements.comment.value.trim();
        values['Доставка'] = formatPrice(order.delivery);
        if (order.discount) values['Скидка KEY10'] = formatPrice(order.discount);
        values['Итого'] = formatPrice(order.total);
        pendingSignature = JSON.stringify(order);
        Object.entries(values).forEach(([label, value]) =>
          details.append(createNode('dt', '', label), createNode('dd', '', value)),
        );
        status.textContent = '';
        openDialog(
          document.querySelector('#confirm-dialog'),
          form.querySelector('[type="submit"]'),
        );
      } else {
        const submit = form.querySelector('[type="submit"]');
        const states = fields.map((field) => field.disabled);
        fields.forEach((field) => {
          field.disabled = true;
        });
        submit.disabled = true;
        form.setAttribute('aria-busy', 'true');
        status.textContent = 'Подготавливаем сообщение…';
        setTimeout(() => {
          fields.forEach((field, index) => {
            field.disabled = states[index];
          });
          submit.disabled = false;
          form.removeAttribute('aria-busy');
          form.reset();
          status.textContent =
            'Сообщение подготовлено. Имитация завершена; данные не отправлялись на сервер.';
          status.focus();
        }, 650);
      }
    });
  });
  const confirmation = document.querySelector('#confirm-dialog');
  const confirmButton = document.querySelector('#confirm-request');
  if (confirmButton) {
    confirmButton.addEventListener('click', () => {
      const form = document.querySelector('#order-form');
      if (!pendingSignature || confirmButton.disabled) return;
      if (pendingSignature !== JSON.stringify(getOrderValues(form))) {
        confirmation.close();
        form.querySelector('.form-status').textContent =
          'Состав заявки изменился. Проверь его ещё раз.';
        return;
      }
      confirmButton.disabled = true;
      confirmButton.textContent = 'Подготавливаем…';
      confirmation.setAttribute('aria-busy', 'true');
      document.querySelector('[data-confirm-status]').textContent = 'Локальная подготовка заявки…';
      requestTimer = setTimeout(() => {
        if (!confirmation.open || pendingSignature !== JSON.stringify(getOrderValues(form))) return;
        form.reset();
        confirmation.dataset.skipReturnFocus = 'true';
        confirmation.close();
        const status = form.querySelector('.form-status');
        status.textContent =
          'Заявка подготовлена. Имитация завершена; данные не отправлялись в магазин и не сохранялись.';
        status.focus();
      }, 650);
    });
    confirmation.addEventListener('close', () => {
      clearTimeout(requestTimer);
      pendingSignature = '';
      confirmButton.disabled = false;
      confirmButton.textContent = 'Подготовить';
      confirmation.removeAttribute('aria-busy');
      document.querySelector('[data-confirm-status]').textContent = '';
      document.querySelector('[data-confirm-details]').replaceChildren();
    });
  }
}

document.addEventListener('DOMContentLoaded', initRequestForms);
