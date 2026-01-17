/*
  CleanStore Demo
  - Catálogo + filtros + carrito
  - Checkout por WhatsApp
  - Config desde /api/settings (Netlify Function). Si no hay DB, usa defaults.
*/

const DEFAULT_CONFIG = {
  store: {
    name: "CleanStore",
    tagline: "Descartables y productos de limpieza para hogares, comercios y mayoristas",
    city: "Mendoza",
    whatsapp: "5492610000000",
    phone: "261-0000000",
    email: "ventas@cleanstore.com",
    address: "Ejemplo 123, Mendoza",
    hours: "Lun a Vie 9:00-18:00 · Sáb 9:00-13:00",
    delivery: "Envíos en el día en Gran Mendoza (según zona) · Retiro en local",
    payments: "Efectivo · Transferencia · Mercado Pago",
    wholesale: "Descuentos por bulto/caja. Pedinos lista mayorista por WhatsApp.",
    notes: "Precios de ejemplo. Se confirma stock y total al coordinar."
  },
  categories: ["Descartables","Bolsas","Papel","Limpieza","Accesorios"],
  products: [
    { id: "p-vaso-200", name: "Vaso plástico 200cc", category: "Descartables", price: 2800, unit: "pack x50", badge: "Más vendido" },
    { id: "p-plato", name: "Plato plástico", category: "Descartables", price: 3200, unit: "pack x25", badge: "" },
    { id: "p-cubiertos", name: "Cubiertos descartables", category: "Descartables", price: 2900, unit: "pack x24", badge: "" },
    { id: "p-servilletas", name: "Servilletas", category: "Papel", price: 2600, unit: "pack x100", badge: "" },
    { id: "p-rollo-cocina", name: "Rollo de cocina", category: "Papel", price: 1900, unit: "unidad", badge: "" },
    { id: "p-higienico", name: "Papel higiénico doble hoja", category: "Papel", price: 7600, unit: "pack x4", badge: "" },
    { id: "p-bolsa-consorcio", name: "Bolsa consorcio 60x90", category: "Bolsas", price: 5600, unit: "pack x10", badge: "Mayorista" },
    { id: "p-bolsa-camiseta", name: "Bolsa camiseta", category: "Bolsas", price: 2400, unit: "pack x50", badge: "" },
    { id: "p-bolsa-ziploc", name: "Bolsa cierre tipo ziploc", category: "Bolsas", price: 2900, unit: "pack x20", badge: "" },
    { id: "p-lavandina", name: "Lavandina", category: "Limpieza", price: 1200, unit: "1L", badge: "" },
    { id: "p-desinfectante", name: "Desinfectante piso", category: "Limpieza", price: 1400, unit: "1L", badge: "" },
    { id: "p-detergente", name: "Detergente", category: "Limpieza", price: 1700, unit: "750ml", badge: "" },
    { id: "p-jabon-liq", name: "Jabón líquido manos", category: "Limpieza", price: 2200, unit: "1L", badge: "" },
    { id: "p-esponja", name: "Esponja doble cara", category: "Accesorios", price: 900, unit: "unidad", badge: "" },
    { id: "p-guantes", name: "Guantes de látex", category: "Accesorios", price: 3900, unit: "par", badge: "" },
    { id: "p-trapo", name: "Paño microfibra", category: "Accesorios", price: 1600, unit: "unidad", badge: "" },
    { id: "p-balde", name: "Balde plástico", category: "Accesorios", price: 4200, unit: "unidad", badge: "" },
    { id: "p-escoba", name: "Escoba", category: "Accesorios", price: 3600, unit: "unidad", badge: "" },
    { id: "p-recogedor", name: "Recogedor", category: "Accesorios", price: 2400, unit: "unidad", badge: "" },
    { id: "p-perfume", name: "Aromatizante", category: "Limpieza", price: 1800, unit: "aerosol", badge: "" }
  ]
};

const state = {
  config: structuredClone(DEFAULT_CONFIG),
  products: [],
  cart: new Map(),
  category: "Todas",
  query: "",
  sort: "relevance"
};

const $ = (s, el=document) => el.querySelector(s);

function money(n){
  try {
    return new Intl.NumberFormat('es-AR', { style:'currency', currency:'ARS', maximumFractionDigits: 0 }).format(n);
  } catch {
    return `$ ${Math.round(n)}`;
  }
}

function escapeHtml(str){
  return String(str ?? '').replace(/[&<>"']/g, (c)=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

function waLink(phone, text){
  const p = String(phone||'').replace(/\D/g,'');
  const base = p ? `https://wa.me/${p}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(text||'')}`;
}

async function loadConfig(){
  try {
    const r = await fetch('/api/settings', { cache:'no-store' });
    if (!r.ok) throw new Error('no settings');
    const data = await r.json();
    state.config = {
      ...structuredClone(DEFAULT_CONFIG),
      ...data,
      store: { ...DEFAULT_CONFIG.store, ...(data.store||{}) }
    };
  } catch {
    state.config = structuredClone(DEFAULT_CONFIG);
  }
}

function applyText(){
  const s = state.config.store;

  // Brand + hero
  $('#storeName') && ($('#storeName').textContent = s.name);
  $('#storeTagline') && ($('#storeTagline').textContent = s.tagline);
  $('#storeName2') && ($('#storeName2').textContent = s.name);

  // Contact blocks
  $('#deliveryText') && ($('#deliveryText').textContent = s.delivery);
  $('#paymentsText') && ($('#paymentsText').textContent = s.payments);
  $('#wholesaleText') && ($('#wholesaleText').textContent = s.wholesale);
  $('#notesText') && ($('#notesText').textContent = s.notes);

  $('#addressText') && ($('#addressText').textContent = s.address);
  $('#hoursText') && ($('#hoursText').textContent = s.hours);
  $('#phoneText') && ($('#phoneText').textContent = s.phone);
  $('#emailText') && ($('#emailText').textContent = s.email);

  // WhatsApp links
  const major = $('#waMajorista');
  const contact = $('#waContact');
  if (major) major.href = waLink(s.whatsapp, `Hola! Quiero la lista mayorista. (${s.name})`);
  if (contact) contact.href = waLink(s.whatsapp, `Hola! Quiero consultar precios/stock. (${s.name})`);

  // year
  $('#year') && ($('#year').textContent = new Date().getFullYear());
}

function renderCategories(){
  const wrap = $('#categories');
  if (!wrap) return;
  wrap.innerHTML = '';
  const cats = ['Todas', ...(state.config.categories||[])];
  cats.forEach((c)=>{
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'catBtn' + (state.category===c ? ' active' : '');
    b.textContent = c;
    b.addEventListener('click', ()=>{
      state.category = c;
      renderCategories();
      computeAndRender();
    });
    wrap.appendChild(b);
  });
}

function computeAndRender(){
  const q = state.query.trim().toLowerCase();
  let items = [...(state.config.products||[])];

  if (state.category !== 'Todas') items = items.filter(p => p.category === state.category);
  if (q) items = items.filter(p => `${p.name} ${p.category} ${p.unit}`.toLowerCase().includes(q));

  const sort = state.sort;
  if (sort === 'priceAsc') items.sort((a,b)=>a.price-b.price);
  if (sort === 'priceDesc') items.sort((a,b)=>b.price-a.price);
  if (sort === 'nameAsc') items.sort((a,b)=>a.name.localeCompare(b.name));

  state.products = items;
  renderProducts();
  renderCart();
}

function renderProducts(){
  const grid = $('#products');
  if (!grid) return;
  grid.innerHTML = '';

  if (!state.products.length){
    grid.innerHTML = `<div class="card" style="padding:14px">No encontramos productos con ese filtro. Probá otra categoría o buscá distinto 🙌</div>`;
    return;
  }

  for (const p of state.products){
    const qty = state.cart.get(p.id)?.qty || 0;

    const el = document.createElement('article');
    el.className = 'card product';
    el.innerHTML = `
      <div class="top">
        <div>
          <h3 class="pname">${escapeHtml(p.name)}</h3>
          <p class="pmeta">${escapeHtml(p.category)} · ${escapeHtml(p.unit||'')}</p>
        </div>
        ${p.badge ? `<span class="badgeP">${escapeHtml(p.badge)}</span>` : ''}
      </div>
      <div class="price">${money(p.price)}</div>
      <div class="pactions">
        <div class="qty" aria-label="Cantidad">
          <button type="button" data-act="minus" ${qty<=0?'disabled':''} aria-label="Quitar">−</button>
          <span class="qval">${qty}</span>
          <button type="button" data-act="plus" aria-label="Agregar">+</button>
        </div>
        <button class="btn btn--soft" type="button" data-act="quick">Agregar</button>
      </div>
    `;

    el.addEventListener('click', (e)=>{
      const act = e.target?.dataset?.act;
      if (!act) return;
      e.preventDefault();
      if (act==='plus') addToCart(p, 1);
      if (act==='minus') addToCart(p, -1);
      if (act==='quick') addToCart(p, 1);
      computeAndRender();
    });

    grid.appendChild(el);
  }
}

function addToCart(p, delta){
  const cur = state.cart.get(p.id) || { product:p, qty:0 };
  const nextQty = Math.max(0, (cur.qty||0) + delta);
  if (nextQty === 0) state.cart.delete(p.id);
  else state.cart.set(p.id, { product:p, qty: nextQty });
}

function cartCount(){
  let c = 0;
  for (const item of state.cart.values()) c += item.qty;
  return c;
}

function cartTotal(){
  let t = 0;
  for (const item of state.cart.values()) t += item.qty * (item.product.price||0);
  return t;
}

function renderCart(){
  const count = cartCount();
  $('#cartCount') && ($('#cartCount').textContent = String(count));
  $('#floatingCount') && ($('#floatingCount').textContent = String(count));
  $('#cartTotal') && ($('#cartTotal').textContent = money(cartTotal()));

  const list = $('#cartItems');
  if (!list) return;
  list.innerHTML = '';

  if (count === 0){
    list.innerHTML = `<div class="small" style="padding:10px">Tu carrito está vacío. Sumá productos desde el catálogo 👇</div>`;
    return;
  }

  for (const {product, qty} of state.cart.values()){
    const row = document.createElement('div');
    row.className = 'cartRow';
    row.innerHTML = `
      <div>
        <b>${escapeHtml(product.name)}</b>
        <small>${escapeHtml(product.category)} · ${escapeHtml(product.unit||'')} · ${money(product.price)}</small>
      </div>
      <div style="text-align:right">
        <div class="qty" style="justify-content:flex-end">
          <button type="button" data-act="minus" aria-label="Quitar">−</button>
          <span class="qval">${qty}</span>
          <button type="button" data-act="plus" aria-label="Agregar">+</button>
        </div>
      </div>
    `;

    row.addEventListener('click', (e)=>{
      const act = e.target?.dataset?.act;
      if (!act) return;
      e.preventDefault();
      if (act==='plus') addToCart(product, 1);
      if (act==='minus') addToCart(product, -1);
      computeAndRender();
    });

    list.appendChild(row);
  }
}

function openCart(){
  const drawer = $('#cart');
  const backdrop = $('#cartBackdrop');
  if (!drawer || !backdrop) return;
  drawer.hidden = false;
  backdrop.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeCart(){
  const drawer = $('#cart');
  const backdrop = $('#cartBackdrop');
  if (!drawer || !backdrop) return;
  drawer.hidden = true;
  backdrop.hidden = true;
  document.body.style.overflow = '';
}

function checkout(){
  const s = state.config.store;
  const items = Array.from(state.cart.values()).map(({product, qty})=>{
    const line = `• ${product.name} (${qty} x ${money(product.price)}) = ${money(qty*product.price)}`;
    return line;
  });

  const text = [
    `Hola! Quiero hacer un pedido en ${s.name}.`,
    '',
    ...items,
    '',
    `Total estimado: ${money(cartTotal())}`,
    `Zona/Ciudad: ${s.city}`,
    '',
    '¿Hay stock y cuánto queda el total final con envío?'
  ].join('\n');

  window.open(waLink(s.whatsapp, text), '_blank', 'noopener');
}

function wireUI(){
  // smooth scroll
  document.querySelectorAll('[data-scroll]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const href = a.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior:'smooth', block:'start' });
    });
  });

  // search + sort
  const search = $('#search');
  const sort = $('#sort');
  if (search){
    search.addEventListener('input', ()=>{
      state.query = search.value || '';
      computeAndRender();
    });
  }
  if (sort){
    sort.addEventListener('change', ()=>{
      state.sort = sort.value;
      computeAndRender();
    });
  }

  // cart open/close
  $('#openCart') && $('#openCart').addEventListener('click', openCart);
  $('#floatingCart') && $('#floatingCart').addEventListener('click', openCart);
  $('#closeCart') && $('#closeCart').addEventListener('click', closeCart);
  $('#cartBackdrop') && $('#cartBackdrop').addEventListener('click', closeCart);

  // checkout
  $('#checkoutBtn') && $('#checkoutBtn').addEventListener('click', checkout);

  // esc closes
  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape') closeCart();
  });
}

(async function init(){
  await loadConfig();
  applyText();
  renderCategories();
  wireUI();
  computeAndRender();
})();
