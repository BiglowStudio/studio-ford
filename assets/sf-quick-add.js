/* Studio Ford 2026 — Quick Add, collection filter toggle. Vanilla JS, no dependencies. */
(function () {
  if (window.__sfInit) return;
  window.__sfInit = true;

  var root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';

  function emit(name, detail) {
    document.dispatchEvent(new CustomEvent(name, { detail: detail, bubbles: true }));
  }

  // Update any cart count bubble we can find; themes differ, so also emit an event for theme glue.
  function refreshCart() {
    return fetch(root + 'cart.js', { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        document.querySelectorAll('.cart-count-bubble span[aria-hidden], [data-cart-count]').forEach(function (el) {
          el.textContent = cart.item_count;
        });
        emit('sf:cart-updated', cart);
        return cart;
      });
  }

  document.addEventListener('submit', function (e) {
    var form = e.target.closest && e.target.closest('[data-sf-quick-form]');
    if (!form) return;
    e.preventDefault();

    var btn = form.querySelector('[data-sf-quick-submit]');
    var status = form.parentElement.querySelector('[data-sf-quick-status]');
    var select = form.querySelector('select[name="id"]');
    if (select && !select.value) {
      if (status) status.textContent = 'Please choose an option.';
      select.focus();
      return;
    }
    var label = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Adding…';
    if (status) status.textContent = '';

    fetch(root + 'cart/add.js', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form)
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.body.description || res.body.message || 'Could not add to cart');
        btn.textContent = 'Added';
        if (status) status.textContent = (form.dataset.productTitle || 'Item') + ' added to cart.';
        emit('sf:add-to-cart', { source: 'quick_add', item: res.body });
        return refreshCart();
      })
      .catch(function (err) {
        btn.textContent = label;
        if (status) status.textContent = err.message;
      })
      .then(function () {
        btn.disabled = false;
        setTimeout(function () { btn.textContent = label; }, 2200);
      });
  });

  // Mobile filter panel toggle
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-sf-filter-toggle]');
    if (!t) return;
    var panel = document.getElementById(t.getAttribute('aria-controls'));
    if (!panel) return;
    var open = panel.classList.toggle('is-open');
    t.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Hero sound toggle
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-sf-sound]');
    if (!t) return;
    var v = t.closest('.sf-hero__frame').querySelector('video');
    if (!v) return;
    v.muted = !v.muted;
    t.setAttribute('aria-pressed', v.muted ? 'false' : 'true');
    t.textContent = v.muted ? 'Sound' : 'Mute';
  });
})();

/* Collection sort select -> keep active filters, swap sort_by */
document.addEventListener('change', function (e) {
  var s = e.target.closest && e.target.closest('[data-sf-sort]');
  if (!s) return;
  var url = new URL(window.location.href);
  url.searchParams.set('sort_by', s.value);
  url.searchParams.delete('page');
  window.location.href = url.toString();
});
