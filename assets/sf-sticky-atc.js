/* Studio Ford 2026 — mobile sticky Add to Cart. Mirrors the theme's main button; never submits on its own. */
(function () {
  var bar = document.querySelector('[data-sf-sticky-atc]');
  if (!bar) return;
  var selector = bar.dataset.mainSelector || "form[action*='/cart/add'] [type='submit']";
  var main = document.querySelector(selector) || document.querySelector("form[action*='/cart/add'] [type='submit']");
  if (!main) return;

  var btn = bar.querySelector('[data-sf-sticky-button]');
  var priceEl = bar.querySelector('[data-sf-sticky-price]');
  var variantEl = bar.querySelector('[data-sf-sticky-variant]');
  var label = btn.textContent.trim();
  var variants = [];
  try { variants = JSON.parse(bar.querySelector('[data-sf-variants]').textContent); } catch (e) {}
  var money = function (cents) {
    var fmt = (window.Shopify && window.Shopify.currency && window.Shopify.currency.active) || 'USD';
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: fmt }).format(cents / 100); } catch (e) { return '$' + (cents / 100).toFixed(2); }
  };

  document.body.classList.add('sf-has-sticky-atc');

  // Show the bar only while the main button is off-screen
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var onScreen = entries[0].isIntersecting;
      // Also hide when the page is scrolled above the button (button still below the fold at load)
      var below = entries[0].boundingClientRect.top > 0;
      var show = !onScreen && !below;
      bar.classList.toggle('is-visible', show);
      bar.setAttribute('aria-hidden', show ? 'false' : 'true');
    }, { threshold: 0 }).observe(main);
  } else {
    bar.classList.add('is-visible');
  }

  btn.addEventListener('click', function () {
    if (btn.disabled) return;
    main.click();
    document.dispatchEvent(new CustomEvent('sf:add-to-cart', { detail: { source: 'sticky_atc' } }));
  });

  // Follow variant changes: read the form's variant id input + the main button's state
  function sync() {
    var form = main.closest('form');
    var idInput = form && form.querySelector('[name="id"]');
    var v = idInput && variants.filter(function (x) { return String(x.id) === String(idInput.value); })[0];
    if (v) {
      if (priceEl) priceEl.textContent = money(v.price);
      if (variantEl) variantEl.textContent = v.title;
    }
    var soldOut = main.disabled || main.getAttribute('aria-disabled') === 'true';
    btn.disabled = soldOut;
    btn.textContent = soldOut ? (v && !v.available ? 'Sold out' : 'Unavailable') : label;
  }
  var form = main.closest('form');
  if (form) {
    form.addEventListener('change', function () { setTimeout(sync, 50); });
    new MutationObserver(sync).observe(main, { attributes: true, attributeFilter: ['disabled', 'aria-disabled'] });
    var idInput = form.querySelector('[name="id"]');
    if (idInput) new MutationObserver(sync).observe(idInput, { attributes: true, attributeFilter: ['value'] });
  }
  document.addEventListener('variant:change', sync);
  sync();
})();
