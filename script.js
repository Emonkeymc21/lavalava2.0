/*
  CleanStore Demo
  - Catálogo + filtros + carrito
  - Checkout por WhatsApp
  - Lee config desde /api/settings (Netlify Function). Si no hay DB, usa defaults.
*/

const DEFAULT_CONFIG = {
  store: {
    name: "CleanStore",
    tagline: "Descartables y productos de limpieza para hogares, comercios y mayoristas",
    city: "Mendoza",
    whatsapp: "5492610000000", // ...
    phone: "261-0000000",
    email: "ventas@cleanstore.com",
    address: "Ejemplo 123, Mendoza",
    hours: "Lun a Vie 9:00-18:00 · Sáb 9:00-13:00",
    delivery: "Envíos en el día en Gran Mendoza (según zona) · Retiro en local",
    payments: "Efectivo · Transferencia · Mercado Pago",
    wholesale: "Descuentos por bulto/caja. Pedinos lista mayorista por WhatsApp.",
    notes: "Precios de ejemplo. Se confirma stock y total al coordinar."
  },
  categories: [
    "Descartables",
    "Bolsas",
    "Papel",
    "Limpieza",
    "Accesorios"
  ],
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
  filtered: [],
  cart: new Map(),
  category: "Todas",
  query: "",
  sort: "relevance"
};

function $(sel){return document.querySelector(sel)}
function $all(sel){return Array.from(document.querySelectorAll(sel))}

function money(n){
  try {
    return new Intl.NumberFormat('es-AR', { style:'currency', currency:'ARS', maximumFractionDigits: 0 }).format(n);
  } catch {
    return `$ ${Math.round(n)}`;
  }
}

async function loadConfig(){
  try {
    const r = await fetch('/api/settings', { cache: 'no-store' });
    if (!r.ok) throw new Error('No settings');
    const data = await r.json();

    // Merge suave
    state.config = {
      ...structuredClone(DEFAULT_CONFIG),
      ...data,
      store: { ...DEFAULT_CONFIG.store, ...(data.store||{}) }
    };
  } catch {
    state.config = structuredClone(DEFAULT_CONFIG);
  }
}

function applyBrand(){
  const { store } = state.config;
  document.title = `${store.name} | ${store.city}`;
  $('#brandName').textContent = store.name;
  $('#brandTagline').textContent = store.tagline;
  $('#heroTitle').textContent = `${store.name}: descartables y limpieza`;
  $('#heroSubtitle').textContent = `${store.delivery} · ${store.payments}`;

  $('#footerName').textContent = store.name;
  $('#footerCity').textContent = store.city;
  $('#footerHours').textContent = store.hours;
  $('#footerAddress').textContent = store.address;
  $('#footerEmail').textContent = store.email;
  $('#footerPhone').textContent = store.phone;

  $('#whatsBtn').href = waLink(store.whatsapp, `Hola! Quiero consultar precios/stock.`);
  $('#whatsBtn2').href = waLink(store.whatsapp, `Hola! Quiero la lista mayorista.`);
  $('#ctaWhats').href = waLink(store.whatsapp, `Hola! Quiero hacer un pedido.`);

  $('#deliveryText').textContent = store.delivery;
  $('#paymentsText').textContent = store.payments;
  $('#wholesaleText').textContent = store.wholesale;
  $('#notesText').textContent = store.notes;
}

function waLink(phone, text){
  const p = String(phone||'').replace(/\D/g,'');
  const base = p ? `https://wa.me/${p}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(text||'')}`;
}

function renderCategories(){
  const cats = ['Todas', ...(state.config.categories||[])];
  const wrap = $('#catPills');
  wrap.innerHTML = '';
  cats.forEach(c => {
    const b = document.createElement('button');
    b.className = 'pill' + (state.category===c ? ' active' : '');
    b.type = 'button';
    b.textContent = c;
    b.addEventListener('click', () => {
      state.category = c;
      renderCategories();
      filterAndRender();
    });
    wrap.appendChild(b);
  });
}

function filterAndRender(){
  const q = state.query.trim().toLowerCase();
  let items = [...(state.config.products||[])];

  if (state.category !== 'Todas') {
    items = items.filter(p => p.category === state.category);
  }
  if (q) {
    items = items.filter(p => `${p.name} ${p.category} ${p.unit}`.toLowerCase().includes(q));
  }

  if (state.sort === 'price_asc') items.sort((a,b)=>a.price-b.price);
  if (state.sort === 'price_desc') items.sort((a,b)=>b.price-a.price);
  if (state.sort === 'name_asc') items.sort((a,b)=>a.name.localeCompare(b.name));

  state.filtered = items;
  renderGrid();
}

function iconForCategory(cat){
  const map = {
    'Descartables':'🍽️',
    'Bolsas':'🛍️',
    'Papel':'🧻',
    'Limpieza':'🧼',
    'Accesorios':'🧽'
  };
  return map[cat] || '🧴';
}

function renderGrid(){
  const grid = $('#grid');
  grid.innerHTML = '';

  if (!state.filtered.length){
    grid.innerHTML = `<div class="empty">No encontramos productos con ese filtro. Probá con otra categoría o buscá distinto 🙌</div>`;
    return;
  }

  for (const p of state.filtered){
    const card = document.createElement('article');
    card.className = 'card';

    const qty = state.cart.get(p.id)?.qty || 0;

    card.innerHTML = `
      <div class="cardTop">
        <div class="avatar" aria-hidden="true">${iconForCategory(p.category)}</div>
        <div class="meta">
          <div class="metaLine">
            <h3>${escapeHtml(p.name)}</h3>
            ${p.badge ? `<span class="badge">${escapeHtml(p.badge)}</span>` : ''}
          </div>
          <div class="metaSub">${escapeHtml(p.category)} · ${escapeHtml(p.unit||'')
          }</div>
        </div>
      </div>
      <div class="cardBottom">
        <div class="price">${money(p.price)}</div>
        <div class="actions">
          <button class="btn small" data-act="minus" ${qty<=0?'disabled':''} aria-label="Quitar">−</button>
          <div class="qty" aria-label="Cantidad">${qty}</div>
          <button class="btn small" data-act="plus" aria-label="Agregar">+</button>
        </div>
      </div>
    `;

    card.addEventListener('click', (e)=>{
      const act = e.target?.dataset?.act;
      if (!act) return;
      e.preventDefault();
      if (act==='plus') addToCart(p, 1);
      if (act==='minus') addToCart(p, -1);
      filterAndRender();
    });

    grid.appendChild(card);
  }

  updateCartBadge();
}

function escapeHtml(s){
  return String(s??'').replace(/[&<>"']/g, (m)=>({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  })[m]);
}

function addToCart(product, delta){
  const cur = state.cart.get(product.id) || { product, qty: 0 };
  const next = Math.max(0, cur.qty + delta);
  if (next === 0) state.cart.delete(product.id);
  else state.cart.set(product.id, { product, qty: next });
  updateCartBadge();
}

function cartCount(){
  let c=0;
  for (const v of state.cart.values()) c += v.qty;
  return c;
}

function cartTotal(){
  let t=0;
  for (const {product, qty} of state.cart.values()) t += (product.price||0)*qty;
  return t;
}

function updateCartBadge(){
  const n = cartCount();
  $('#cartCount').textContent = String(n);
  $('#cartCount2').textContent = String(n);
  $('#cartTotal').textContent = money(cartTotal());
  $('#floatingCart').classList.toggle('show', n>0);
}

function openCart(){
  const modal = $('#cartModal');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  renderCartModal();
}

function closeCart(){
  const modal = $('#cartModal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
}

function renderCartModal(){
  const list = $('#cartList');
  list.innerHTML = '';

  const entries = [...state.cart.values()];
  if (!entries.length){
    list.innerHTML = `<div class="empty">Tu carrito está vacío. Agregá productos del catálogo 👆</div>`;
    $('#checkoutBtn').disabled = true;
    return;
  }

  $('#checkoutBtn').disabled = false;

  for (const {product, qty} of entries){
    const row = document.createElement('div');
    row.className = 'cartRow';
    row.innerHTML = `
      <div class="cartLeft">
        <div class="cartIcon">${iconForCategory(product.category)}</div>
        <div>
          <div class="cartName">${escapeHtml(product.name)}</div>
          <div class="cartMeta">${escapeHtml(product.unit||'')} · ${money(product.price)} c/u</div>
        </div>
      </div>
      <div class="cartRight">
        <button class="btn small" data-act="minus">−</button>
        <div class="qty">${qty}</div>
        <button class="btn small" data-act="plus">+</button>
      </div>
    `;

    row.addEventListener('click', (e)=>{
      const act = e.target?.dataset?.act;
      if (!act) return;
      if (act==='plus') addToCart(product, 1);
      if (act==='minus') addToCart(product, -1);
      renderCartModal();
      filterAndRender();
    });

    list.appendChild(row);
  }

  $('#modalTotal').textContent = money(cartTotal());
}

function buildOrderMessage(){
  const { store } = state.config;
  const lines = [];
  lines.push(`Hola! Quiero hacer un pedido en *${store.name}*`);
  lines.push('');
  lines.push('*Detalle:*');

  for (const {product, qty} of state.cart.values()){
    const subtotal = (product.price||0)*qty;
    lines.push(`- ${qty} x ${product.name} (${product.unit}) = ${money(subtotal)}`);
  }

  lines.push('');
  lines.push(`*Total estimado:* ${money(cartTotal())}`);
  lines.push('');
  lines.push(`📍 Ciudad/Zona: ${store.city}`);
  lines.push('🧾 A confirmar stock, envío y total final.');
  return lines.join('\n');
}

function wire(){
  $('#search').addEventListener('input', (e)=>{
    state.query = e.target.value || '';
    filterAndRender();
  });
  $('#sort').addEventListener('change', (e)=>{
    state.sort = e.target.value;
    filterAndRender();
  });

  $('#openCart').addEventListener('click', openCart);
  $('#floatingCart').addEventListener('click', openCart);
  $('#closeCart').addEventListener('click', closeCart);
  $('#cartBackdrop').addEventListener('click', closeCart);

  $('#checkoutBtn').addEventListener('click', ()=>{
    const msg = buildOrderMessage();
    const url = waLink(state.config.store.whatsapp, msg);
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  // Smooth scroll
  $all('a[data-scroll]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const id = a.getAttribute('href');
      document.querySelector(id)?.scrollIntoView({ behavior:'smooth', block:'start' });
    });
  });
}

async function init(){
  await loadConfig();
  applyBrand();
  wire();
  renderCategories();
  filterAndRender();
}

init();
