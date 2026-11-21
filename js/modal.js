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
  openDialog(dialog, trigger);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.querySelectorAll('[data-close-dialog]').forEach((button) => {
      button.addEventListener('click', () => dialog.close());
    });
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (dialogTrigger?.isConnected) dialogTrigger.focus();
    });
  });
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="quick-view"], [data-open-product]');
    if (button) openProductDialog(Number(button.dataset.productId), button);
  });
});
