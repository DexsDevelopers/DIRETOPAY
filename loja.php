<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ghost Pix — Loja de Produtos Digitais</title>
<meta name="description" content="Descubra e compre produtos digitais, cursos, templates e serviços de vendedores verificados. Pagamento 100% via PIX.">
<link rel="icon" href="/logo_premium.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
:root {
  --bg:      #06060a;
  --card:    #0d0d12;
  --card2:   #111118;
  --border:  rgba(255,255,255,0.07);
  --border2: rgba(255,255,255,0.13);
  --primary: #a855f7;
  --pd:      #7c3aed;
  --pg:      linear-gradient(135deg,#a855f7,#7c3aed);
  --success: #22c55e;
  --text:    #fff;
  --muted:   rgba(255,255,255,0.45);
  --dim:     rgba(255,255,255,0.18);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'Outfit',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
img{max-width:100%;display:block}
button{cursor:pointer;border:none;outline:none;font-family:inherit}
input,select{font-family:inherit;outline:none}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-thumb{background:rgba(168,85,247,.3);border-radius:3px}

.container{max-width:1200px;margin:0 auto;padding:0 24px}

/* ── Navbar ── */
.navbar{position:sticky;top:0;z-index:100;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);background:rgba(6,6,10,.9);border-bottom:1px solid var(--border)}
.nav-inner{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 0}
.brand{display:flex;align-items:center;gap:10px;font-size:1.05rem;font-weight:900;letter-spacing:-.03em}
.brand img{width:34px;height:34px;border-radius:10px;box-shadow:0 0 18px rgba(168,85,247,.25)}
.brand span{color:var(--primary);font-style:italic}
.nav-right{display:flex;align-items:center;gap:12px}
.btn-login{background:rgba(168,85,247,.12);border:1px solid rgba(168,85,247,.25);color:var(--primary);border-radius:50px;padding:8px 20px;font-size:.78rem;font-weight:800;transition:all .2s}
.btn-login:hover{background:rgba(168,85,247,.22)}
.secure-badge{display:flex;align-items:center;gap:6px;font-size:.68rem;font-weight:700;color:var(--muted);background:rgba(34,197,94,.07);border:1px solid rgba(34,197,94,.14);padding:6px 12px;border-radius:50px}
.secure-badge svg{color:var(--success)}

/* ── Hero ── */
.hero{padding:72px 0 56px;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% -10%,rgba(168,85,247,.15),transparent);pointer-events:none}
.hero::after{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:600px;height:1px;background:linear-gradient(90deg,transparent,rgba(168,85,247,.4),transparent)}
.hero-content{position:relative;text-align:center;max-width:700px;margin:0 auto}
.hero-eyebrow{display:inline-flex;align-items:center;gap:8px;background:rgba(168,85,247,.1);border:1px solid rgba(168,85,247,.2);border-radius:50px;padding:6px 16px;font-size:.72rem;font-weight:800;color:var(--primary);text-transform:uppercase;letter-spacing:.1em;margin-bottom:24px}
.hero-title{font-size:3.2rem;font-weight:900;line-height:1.05;letter-spacing:-.05em;margin-bottom:16px}
.hero-title em{color:var(--primary);font-style:italic}
@media(max-width:600px){.hero-title{font-size:2rem}}
.hero-sub{font-size:1rem;color:var(--muted);line-height:1.7;margin-bottom:40px;max-width:500px;margin-left:auto;margin-right:auto}
.stats-row{display:flex;align-items:center;justify-content:center;gap:32px;margin-top:16px;flex-wrap:wrap}
.stat{text-align:center}
.stat-num{font-size:1.6rem;font-weight:900;color:var(--primary);letter-spacing:-.04em}
.stat-label{font-size:.7rem;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:.1em;margin-top:2px}
.stat-divider{width:1px;height:40px;background:var(--border2)}

/* ── Search ── */
.search-bar{display:flex;gap:10px;max-width:580px;margin:0 auto 0;position:relative}
.search-bar svg{position:absolute;left:18px;top:50%;transform:translateY(-50%);color:var(--dim);pointer-events:none}
.search-input{flex:1;background:rgba(255,255,255,.05);border:1.5px solid var(--border2);border-radius:50px;padding:14px 18px 14px 48px;font-size:.9rem;color:var(--text);transition:border-color .2s}
.search-input:focus{border-color:rgba(168,85,247,.5);background:rgba(168,85,247,.03)}
.search-input::placeholder{color:var(--dim)}
.btn-search{background:var(--pg);border-radius:50px;padding:14px 28px;font-size:.9rem;font-weight:800;color:#fff;white-space:nowrap;transition:all .2s;box-shadow:0 8px 24px rgba(168,85,247,.25)}
.btn-search:hover{box-shadow:0 12px 32px rgba(168,85,247,.35);transform:translateY(-1px)}

/* ── Section ── */
.section{padding:48px 0}
.section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;flex-wrap:wrap;gap:12px}
.section-title{font-size:1.2rem;font-weight:900;letter-spacing:-.03em}
.results-count{font-size:.78rem;color:var(--muted);font-weight:600}

/* ── Filters ── */
.filters{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:20px}
.cat-scroll{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;flex:1}
.cat-scroll::-webkit-scrollbar{height:3px}
.cat-btn{flex-shrink:0;padding:8px 18px;border-radius:50px;font-size:.75rem;font-weight:800;background:rgba(255,255,255,.05);border:1.5px solid var(--border);color:var(--muted);transition:all .2s;cursor:pointer}
.cat-btn:hover{background:rgba(255,255,255,.08);color:var(--text)}
.cat-btn.active{background:var(--text);border-color:var(--text);color:#000}
.sort-select{background:rgba(255,255,255,.05);border:1.5px solid var(--border);border-radius:50px;padding:8px 16px;font-size:.75rem;font-weight:700;color:var(--text);cursor:pointer;flex-shrink:0}
.sort-select option{background:#111}

/* ── Type filter pills ── */
.type-filters{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:20px}
.type-pill{display:flex;align-items:center;gap:5px;padding:5px 14px;border-radius:50px;font-size:.7rem;font-weight:800;background:rgba(255,255,255,.04);border:1px solid var(--border);color:var(--dim);cursor:pointer;transition:all .2s}
.type-pill:hover{border-color:rgba(168,85,247,.3);color:var(--primary)}
.type-pill.active{background:rgba(168,85,247,.12);border-color:rgba(168,85,247,.35);color:var(--primary)}

/* ── Grid ── */
.products-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
@media(max-width:1100px){.products-grid{grid-template-columns:repeat(3,1fr)}}
@media(max-width:760px){.products-grid{grid-template-columns:repeat(2,1fr);gap:14px}}
@media(max-width:420px){.products-grid{grid-template-columns:1fr}}

/* ── Product Card ── */
.pcard{background:var(--card);border:1px solid var(--border);border-radius:24px;overflow:hidden;display:flex;flex-direction:column;transition:all .25s;cursor:pointer;position:relative}
.pcard:hover{border-color:rgba(168,85,247,.3);transform:translateY(-4px);box-shadow:0 20px 50px rgba(0,0,0,.5)}
.pcard-img{position:relative;overflow:hidden;aspect-ratio:4/3;background:var(--card2)}
.pcard-img img{width:100%;height:100%;object-fit:cover;transition:transform .5s}
.pcard:hover .pcard-img img{transform:scale(1.06)}
.pcard-img-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0d0d12,#141420)}
.pcard-img-ph svg{opacity:.15}
.pcard-badges{position:absolute;top:10px;left:10px;display:flex;gap:5px;flex-wrap:wrap}
.badge{padding:4px 10px;border-radius:50px;font-size:.6rem;font-weight:900;text-transform:uppercase;letter-spacing:.06em;backdrop-filter:blur(10px)}
.badge-cat{background:rgba(0,0,0,.6);color:rgba(255,255,255,.6)}
.badge-sub{background:rgba(168,85,247,.25);border:1px solid rgba(168,85,247,.4);color:var(--primary)}
.badge-new{background:rgba(34,197,94,.2);border:1px solid rgba(34,197,94,.3);color:#4ade80}
.pcard-body{padding:16px;display:flex;flex-direction:column;flex:1;gap:10px}
.pcard-seller{font-size:.68rem;font-weight:700;color:var(--dim)}
.pcard-seller span{color:var(--muted)}
.pcard-name{font-size:.9rem;font-weight:800;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.pcard-stars{display:flex;align-items:center;gap:4px}
.pcard-stars svg{color:#f59e0b}
.pcard-stars span{font-size:.68rem;color:var(--dim);margin-left:2px}
.pcard-footer{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:10px;border-top:1px solid var(--border)}
.pcard-price{font-size:1.15rem;font-weight:900;letter-spacing:-.03em}
.pcard-sold{font-size:.65rem;color:var(--dim);font-weight:600}
.btn-ver{background:var(--pg);border-radius:14px;padding:9px 16px;font-size:.75rem;font-weight:900;color:#fff;transition:all .2s;box-shadow:0 4px 16px rgba(168,85,247,.2);white-space:nowrap}
.btn-ver:hover{box-shadow:0 8px 24px rgba(168,85,247,.35)}

/* ── Skeleton ── */
.skel-card{background:var(--card);border:1px solid var(--border);border-radius:24px;overflow:hidden;height:320px}
.skel{background:linear-gradient(90deg,var(--card) 25%,var(--card2) 50%,var(--card) 75%);background-size:200% 100%;animation:skel 1.4s ease infinite;border-radius:8px}
@keyframes skel{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* ── Empty ── */
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 20px;gap:16px;text-align:center}
.empty-icon{width:72px;height:72px;border-radius:20px;background:rgba(255,255,255,.04);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--dim)}
.empty h3{font-size:1.1rem;font-weight:800;color:var(--muted)}
.empty p{font-size:.85rem;color:var(--dim)}

/* ── Pagination ── */
.pagination{display:flex;align-items:center;justify-content:center;gap:8px;padding:32px 0 48px}
.page-btn{width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,.05);border:1px solid var(--border);color:var(--muted);font-size:.8rem;font-weight:700;transition:all .2s;display:flex;align-items:center;justify-content:center}
.page-btn:hover:not(:disabled){background:rgba(255,255,255,.1);color:var(--text)}
.page-btn:disabled{opacity:.3;cursor:not-allowed}
.page-btn.active{background:var(--primary);border-color:var(--primary);color:#fff}
.page-info{font-size:.8rem;color:var(--dim);font-weight:600;padding:0 8px}

/* ── Trust bar ── */
.trust-bar{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:20px 28px;display:flex;align-items:center;justify-content:center;gap:32px;flex-wrap:wrap;margin-bottom:48px}
.trust-item{display:flex;align-items:center;gap:8px;font-size:.75rem;font-weight:700;color:var(--muted)}
.trust-item svg{color:var(--primary)}
@media(max-width:600px){.trust-bar{gap:16px;padding:16px}}

/* ── Footer ── */
footer{border-top:1px solid var(--border);padding:32px 0;text-align:center;color:var(--dim);font-size:.75rem}
.footer-logo{display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:10px;font-weight:900;font-size:.9rem;color:var(--muted)}
</style>
</head>
<body>

<!-- ── Navbar ── -->
<nav class="navbar">
  <div class="container nav-inner">
    <a href="/loja" class="brand">
      <img src="/logo_premium.png" alt="Ghost Pix">
      GHOST<span>PIX</span>
    </a>
    <div class="nav-right">
      <div class="secure-badge">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        Pagamento Seguro
      </div>
      <a href="/dashboard" class="btn-login">Área do Vendedor</a>
    </div>
  </div>
</nav>

<!-- ── Hero ── -->
<section class="hero">
  <div class="container">
    <div class="hero-content">
      <div class="hero-eyebrow">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        Marketplace Oficial
      </div>
      <h1 class="hero-title">
        Produtos digitais<br><em>incríveis</em> te esperam
      </h1>
      <p class="hero-sub">Cursos, templates, softwares e muito mais — de vendedores verificados. Compre com segurança via PIX, sem criar conta.</p>

      <div class="search-bar" style="margin-bottom:32px">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="search-input" class="search-input" placeholder="Buscar produtos, cursos, templates...">
        <button class="btn-search" onclick="doSearch()">Buscar</button>
      </div>

      <div class="stats-row" id="stats-row">
        <div class="stat"><div class="stat-num" id="stat-products">...</div><div class="stat-label">Produtos</div></div>
        <div class="stat-divider"></div>
        <div class="stat"><div class="stat-num">PIX</div><div class="stat-label">Pagamento</div></div>
        <div class="stat-divider"></div>
        <div class="stat"><div class="stat-num">100%</div><div class="stat-label">Seguro</div></div>
      </div>
    </div>
  </div>
</section>

<!-- ── Main Content ── -->
<main>
  <div class="container">

    <!-- Trust bar -->
    <div class="trust-bar">
      <div class="trust-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        Vendedores Verificados
      </div>
      <div class="trust-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        PIX Instantâneo
      </div>
      <div class="trust-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Entrega Imediata
      </div>
      <div class="trust-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        Sem Cadastro
      </div>
    </div>

    <!-- Filters -->
    <div class="filters">
      <div class="cat-scroll" id="cat-scroll">
        <!-- filled by JS -->
      </div>
      <select class="sort-select" id="sort-select" onchange="applyFilters()">
        <option value="popular">Mais Vendidos</option>
        <option value="recent">Mais Recentes</option>
        <option value="rating">Melhor Avaliados</option>
        <option value="price_asc">Menor Preço</option>
        <option value="price_desc">Maior Preço</option>
      </select>
    </div>

    <!-- Section header -->
    <div class="section-header">
      <h2 class="section-title" id="section-title">Todos os Produtos</h2>
      <span class="results-count" id="results-count"></span>
    </div>

    <!-- Grid -->
    <div class="products-grid" id="products-grid">
      <!-- filled by JS -->
    </div>

    <!-- Pagination -->
    <div class="pagination" id="pagination" style="display:none">
      <!-- filled by JS -->
    </div>

  </div>
</main>

<!-- ── Footer ── -->
<footer>
  <div class="container">
    <div class="footer-logo">
      <img src="/logo_premium.png" style="width:22px;height:22px;border-radius:6px" alt="">
      GHOST PIX
    </div>
    <p>Marketplace de produtos digitais · Pagamentos seguros via PIX · © 2026 Ghost Pix Technology</p>
    <p style="margin-top:6px"><a href="/dashboard" style="color:var(--primary)">Quero vender aqui</a> &nbsp;·&nbsp; <a href="/" style="color:var(--muted)">Início</a></p>
  </div>
</footer>

<script>
const CATEGORIES = ['Todos','Digital','Físico','Serviço','Curso','Software','Template','E-book','Outro'];
const CAT_ICONS  = {'Todos':'🛒','Digital':'💾','Físico':'📦','Serviço':'🛠️','Curso':'📚','Software':'⚙️','Template':'🎨','E-book':'📖','Outro':'📦'};

let state = { search:'', category:'Todos', sort:'popular', page:1, total:0, perPage:12 };

/* ── Build category buttons ── */
function buildCats() {
  const scroll = document.getElementById('cat-scroll');
  scroll.innerHTML = CATEGORIES.map(c =>
    `<button class="cat-btn${c==='Todos'?' active':''}" onclick="selectCat('${c}')">${CAT_ICONS[c]||''} ${c}</button>`
  ).join('');
}

function selectCat(cat) {
  state.category = cat; state.page = 1;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('active', b.textContent.trim().endsWith(cat)));
  updateSectionTitle();
  loadProducts();
}

function doSearch() {
  state.search = document.getElementById('search-input').value.trim();
  state.page = 1;
  updateSectionTitle();
  loadProducts();
}

document.getElementById('search-input').addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });

function applyFilters() {
  state.sort = document.getElementById('sort-select').value;
  state.page = 1;
  loadProducts();
}

function updateSectionTitle() {
  const title = document.getElementById('section-title');
  if (state.search) title.textContent = `Resultados para "${state.search}"`;
  else if (state.category !== 'Todos') title.textContent = (CAT_ICONS[state.category]||'') + ' ' + state.category;
  else title.textContent = 'Todos os Produtos';
}

/* ── Star HTML ── */
function stars(rating, count) {
  if (!rating) return '';
  let html = '<div class="pcard-stars">';
  for (let i = 1; i <= 5; i++) {
    const fill = i <= Math.round(rating) ? 'fill="#f59e0b"' : 'fill="none" stroke="#f59e0b" stroke-width="2"';
    html += `<svg width="11" height="11" viewBox="0 0 24 24" ${fill}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  }
  html += `<span>${rating ? Number(rating).toFixed(1) : ''} ${count ? '('+count+')' : ''}</span></div>`;
  return html;
}

/* ── Render card ── */
function renderCard(p) {
  const price = parseFloat(p.price).toFixed(2).replace('.', ',');
  const isSub = p.type === 'subscription';
  const isNew = new Date(p.created_at) > new Date(Date.now() - 7*24*60*60*1000);
  const imgHtml = p.image_url
    ? `<img src="${escHtml(p.image_url)}" alt="${escHtml(p.name)}" loading="lazy" onerror="this.parentElement.classList.add('error')">`
    : `<div class="pcard-img-ph"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;

  return `
  <a href="/p/${p.id}" class="pcard">
    <div class="pcard-img">
      ${imgHtml}
      <div class="pcard-badges">
        <span class="badge badge-cat">${escHtml(p.category)}</span>
        ${isSub ? '<span class="badge badge-sub">🔄 Assinatura</span>' : ''}
        ${isNew ? '<span class="badge badge-new">Novo</span>' : ''}
      </div>
    </div>
    <div class="pcard-body">
      <div class="pcard-seller">por <span>${escHtml(p.seller_store || p.seller_name)}</span></div>
      <div class="pcard-name">${escHtml(p.name)}</div>
      ${stars(p.avg_rating, p.review_count)}
      <div class="pcard-footer">
        <div>
          <div class="pcard-price">R$ ${price}</div>
          ${p.orders_count > 0 ? `<div class="pcard-sold">⚡ ${p.orders_count} vendas</div>` : ''}
        </div>
        <div class="btn-ver">Ver produto →</div>
      </div>
    </div>
  </a>`;
}

function escHtml(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── Skeletons ── */
function showSkeletons(n) {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = Array.from({length:n}).map(() =>
    `<div class="skel-card"><div class="skel" style="height:100%"></div></div>`
  ).join('');
}

/* ── Load products ── */
async function loadProducts() {
  showSkeletons(state.perPage);
  document.getElementById('pagination').style.display = 'none';
  document.getElementById('results-count').textContent = '';

  const params = new URLSearchParams({
    search:   state.search,
    category: state.category === 'Todos' ? '' : state.category,
    sort:     state.sort,
    page:     state.page,
  });

  try {
    const res  = await fetch('/vitrine.php?' + params);
    const data = await res.json();

    if (!data.success) throw new Error();

    state.total = data.total || 0;
    const products = data.products || [];

    document.getElementById('stat-products').textContent = state.total;
    document.getElementById('results-count').textContent =
      state.total + ' produto' + (state.total !== 1 ? 's' : '') + ' encontrado' + (state.total !== 1 ? 's' : '');

    const grid = document.getElementById('products-grid');
    if (products.length === 0) {
      grid.innerHTML = `
        <div class="empty" style="grid-column:1/-1">
          <div class="empty-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
          <h3>Nenhum produto encontrado</h3>
          <p>Tente outros filtros ou termos de busca</p>
        </div>`;
    } else {
      grid.innerHTML = products.map(renderCard).join('');
    }

    renderPagination();
  } catch {
    document.getElementById('products-grid').innerHTML =
      `<div class="empty" style="grid-column:1/-1"><h3>Erro ao carregar produtos</h3><p>Tente recarregar a página</p></div>`;
  }
}

/* ── Pagination ── */
function renderPagination() {
  const total = Math.ceil(state.total / state.perPage);
  const pag   = document.getElementById('pagination');
  if (total <= 1) { pag.style.display = 'none'; return; }

  let html = `<button class="page-btn" onclick="goPage(${state.page-1})" ${state.page===1?'disabled':''}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
  </button>`;

  const start = Math.max(1, state.page - 2);
  const end   = Math.min(total, state.page + 2);
  if (start > 1) html += `<button class="page-btn" onclick="goPage(1)">1</button>${start>2?'<span class="page-info">…</span>':''}`;
  for (let i = start; i <= end; i++)
    html += `<button class="page-btn${i===state.page?' active':''}" onclick="goPage(${i})">${i}</button>`;
  if (end < total) html += `${end<total-1?'<span class="page-info">…</span>':''}<button class="page-btn" onclick="goPage(${total})">${total}</button>`;

  html += `<button class="page-btn" onclick="goPage(${state.page+1})" ${state.page===total?'disabled':''}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
  </button>`;

  pag.innerHTML = html;
  pag.style.display = 'flex';
}

function goPage(p) {
  const total = Math.ceil(state.total / state.perPage);
  if (p < 1 || p > total) return;
  state.page = p;
  window.scrollTo({top:0, behavior:'smooth'});
  loadProducts();
}

/* ── Init ── */
buildCats();
loadProducts();
</script>
</body>
</html>
