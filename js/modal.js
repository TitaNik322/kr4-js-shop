'use strict';

let dialogTrigger;
function openDialog(dialog, trigger = document.activeElement) {
  if (!dialog || dialog.open) return;
  dialogTrigger = trigger;
  dialog.showModal();
}

function openProductDialog(id, trigger) {
  const product = findProductById(products, id);
  const dialog = document.querySelector('#product-dialog');
  if (!product || !dialog) return;
  dialog.querySelector('#quick-title').textContent = product.title;
  dialog.querySelector('[data-quick-category]').textContent = categoryLabels[product.category];
  dialog.querySelector('[data-quick-description]').textContent = product.description;
  dialog.querySelector('[data-quick-price]').textContent = formatPrice(getProductPrice(product));
  dialog.querySelector('[data-quick-status]').textContent = getProductStatus(product);
  const image = dialog.querySelector('[data-quick-image]');
  image.src = product.image;
  image.alt = product.title;
  dialog.querySelector('[data-quick-link]').href = `product.html?id=${product.id}`;
  const order = dialog.querySelector('[data-quick-order]');
  order.href = `order.html?product=${product.id}`;
  order.hidden = !product.isAvailable;
  const actions = dialog.querySelector('.form-actions');
  actions.querySelector('[data-action="add-to-cart"]')?.remove();
  actions.prepend(createCartButton(product));
  openDialog(dialog, trigger);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.querySelectorAll('[data-close-dialog]').forEach((button) => {
      button.addEventListener('click', () => dialog.close());
    });
    dialog.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      const controls = [
        ...dialog.querySelectorAll(
          'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled)',
        ),
      ].filter((element) => element.getClientRects().length);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      )
        dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (dialog.dataset.skipReturnFocus === 'true') delete dialog.dataset.skipReturnFocus;
      else {
        const id = dialogTrigger?.dataset.productId;
        const replacement = [...document.querySelectorAll('[data-action="quick-view"]')].find(
          (button) => button.dataset.productId === id,
        );
        const target = dialogTrigger?.isConnected
          ? dialogTrigger
          : replacement || document.querySelector('#catalog-search');
        target?.focus();
      }
    });
  });
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="quick-view"], [data-open-product]');
    if (button) openProductDialog(Number(button.dataset.productId), button);
  });
});
