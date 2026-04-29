<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ghost Pix — Loja</title>
<meta name="description" content="Descubra e compre produtos digitais, cursos e serviços de vendedores verificados. Pagamento 100% via PIX, sem cadastro.">
<link rel="icon" href="/logo_premium.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
/* ── Reset & Base ── */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{font-family:'Outfit',sans-serif;background:#06060a;color:#fff;min-height:100vh;-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:inherit;text-decoration:none}
img{max-width:100%;display:block}
button{cursor:pointer;border:none;outline:none;font-family:inherit}
input,select{font-family:inherit;outline:none;border:none}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-thumb{background:rgba(168,85,247,.3);border-radius:4px}

/* ── Tokens ── */
:root{
  --primary:#a855f7;
  --pd:#7c3aed;
  --bg:#06060a;
  --card:#0e0e16;
  --card2:#131320;
  --border:rgba(255,255,255,.07);
  --border2:rgba(255,255,255,.12);
  --text:#fff;
  --muted:rgba(255,255,255,.45);
  --dim:rgba(255,255,255,.18);
  --success:#22c55e;
  --r:20px;
  --r-sm:12px;
}

/* ── Utilities ── */
.container{max-width:1160px;margin:0 auto;padding:0 16px}
@media(min-width:640px){.container{padding:0 24px}}

/* ─────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────── */
.navbar{position:sticky;top:0;z-index:200;background:rgba(6,6,10,.92);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid var(--border)}
.nav-inner{display:flex;align-items:center;gap:12px;padding:12px 0;min-height:60px}
.brand{display:flex;align-items:center;gap:8px;font-size:.95rem;font-weight:900;letter-spacing:-.03em;flex-shrink:0}
.brand img{width:30px;height:30px;border-radius:8px;box-shadow:0 0 14px rgba(168,85,247,.3)}
.brand em{color:var(--primary);font-style:italic}
.nav-search{flex:1;position:relative;min-width:0}
.nav-search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--dim);pointer-events:none;flex-shrink:0}
.nav-search input{width:100%;background:rgba(255,255,255,.06);border:1.5px solid var(--border);border-radius:50px;padding:9px 14px 9px 38px;font-size:.82rem;color:#fff;transition:border-color .2s}
.nav-search input:focus{border-color:rgba(168,85,247,.45);background:rgba(168,85,247,.04)}
.nav-search input::placeholder{color:var(--dim)}
.nav-actions{display:flex;align-items:center;gap:8px;flex-shrink:0}
.btn-seller{background:rgba(168,85,247,.12);border:1.5px solid rgba(168,85,247,.25);color:var(--primary);border-radius:50px;padding:7px 16px;font-size:.75rem;font-weight:800;white-space:nowrap;transition:all .2s;display:none}
.btn-seller:hover{background:rgba(168,85,247,.22)}
@media(min-width:480px){.btn-seller{display:block}}

/* ─────────────────────────────────────────────
   BANNER SLIDER
───────────────────────────────────────────── */
.slider-wrap{
  position:relative;
  overflow:hidden;
  background:#0e0e16;
  margin:0 auto;
  max-width:1160px;
  border-radius:0;
}
.slider-track{display:flex;transition:transform .5s cubic-bezier(.4,0,.2,1);will-change:transform}
.slide{min-width:100%;position:relative;cursor:pointer;user-select:none}
.slide a{display:block;width:100%}
.slide img{width:100%;height:360px;object-fit:scale-down;display:block;background:#0e0e16}
.slide-placeholder{width:100%;aspect-ratio:3/1;background:linear-gradient(135deg,#0e0e16,#1a1a28);display:flex;align-items:center;justify-content:center}
.slide-placeholder svg{opacity:.08}

/* Mobile: banner card */
@media(max-width:600px){
  .slider-wrap{
    margin:0;
    border-radius:0;
    box-shadow:none;
  }
  .slide img{
    width:100%;
    height:180px;
    object-fit:scale-down;
    background:transparent;
    display:block;
    padding:10px 14px;
  }
  /* Se a imagem for landscape (proporção certa), ela preenche bem o card */
  .slider-dots{padding:6px 0 10px}
  .slider-arrow{display:none}
}

/* Dots */
.slider-dots{display:flex;justify-content:center;gap:6px;padding:10px 0}
.dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.15);cursor:pointer;transition:all .25s}
.dot.active{width:20px;border-radius:3px;background:var(--primary)}

/* Arrows */
.slider-arrow{position:absolute;top:50%;transform:translateY(-50%);z-index:10;width:36px;height:36px;background:rgba(0,0,0,.55);backdrop-filter:blur(8px);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;opacity:0;transition:opacity .2s;border:1px solid rgba(255,255,255,.1)}
.slider-wrap:hover .slider-arrow{opacity:1}
.slider-arrow.prev{left:10px}
.slider-arrow.next{right:10px}
@media(max-width:600px){.slider-arrow{display:none}}

/* ─────────────────────────────────────────────
   TRUST BAR
───────────────────────────────────────────── */
.trust{background:var(--card);border-bottom:1px solid var(--border)}
.trust-inner{display:flex;align-items:center;gap:0;overflow-x:auto;padding:10px 0;scrollbar-width:none}
.trust-inner::-webkit-scrollbar{display:none}
.trust-item{display:flex;align-items:center;gap:6px;padding:4px 16px;font-size:.68rem;font-weight:700;color:var(--muted);white-space:nowrap;flex-shrink:0;border-right:1px solid var(--border)}
.trust-item:last-child{border-right:none}
.trust-item svg{color:var(--primary);flex-shrink:0}

/* ─────────────────────────────────────────────
   FILTERS BAR (sticky)
───────────────────────────────────────────── */
.filters-bar{position:sticky;top:60px;z-index:100;background:rgba(6,6,10,.95);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid var(--border);padding:10px 0}
.filters-inner{display:flex;align-items:center;gap:10px}
.cats{display:flex;gap:6px;overflow-x:auto;flex:1;scrollbar-width:none;padding-bottom:2px}
.cats::-webkit-scrollbar{display:none}
.cat-btn{flex-shrink:0;padding:7px 16px;border-radius:50px;font-size:.72rem;font-weight:800;background:rgba(255,255,255,.05);border:1.5px solid var(--border);color:var(--muted);cursor:pointer;transition:all .2s;white-space:nowrap}
.cat-btn:hover{background:rgba(255,255,255,.08);color:#fff}
.cat-btn.active{background:#fff;border-color:#fff;color:#000}
.sort-select{flex-shrink:0;background:rgba(255,255,255,.05);border:1.5px solid var(--border);border-radius:50px;padding:7px 14px;font-size:.72rem;font-weight:700;color:#fff;cursor:pointer;white-space:nowrap}
.sort-select option{background:#111}
@media(max-width:480px){.sort-select{display:none}}

/* ─────────────────────────────────────────────
   MAIN
───────────────────────────────────────────── */
main{padding:20px 0 60px}
.section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px}
.section-title{font-size:1rem;font-weight:900;letter-spacing:-.02em;display:flex;align-items:center;gap:8px}
.section-title span{width:6px;height:18px;border-radius:3px;background:var(--primary);display:inline-block}
.results-count{font-size:.72rem;color:var(--dim);font-weight:600}

/* ─────────────────────────────────────────────
   PRODUCT GRID
───────────────────────────────────────────── */
.products-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
@media(min-width:640px){.products-grid{grid-template-columns:repeat(3,1fr);gap:16px}}
@media(min-width:960px){.products-grid{grid-template-columns:repeat(4,1fr)}}
@media(min-width:1160px){.products-grid{grid-template-columns:repeat(5,1fr)}}

/* ─────────────────────────────────────────────
   PRODUCT CARD
───────────────────────────────────────────── */
.pcard{background:var(--card);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;display:flex;flex-direction:column;transition:transform .2s,border-color .2s,box-shadow .2s;position:relative}
.pcard:hover{border-color:rgba(168,85,247,.3);transform:translateY(-3px);box-shadow:0 16px 40px rgba(0,0,0,.5)}
.pcard:active{transform:translateY(0)}

/* Image */
.pcard-img{position:relative;overflow:hidden;aspect-ratio:1/1;background:var(--card2)}
.pcard-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s}
.pcard:hover .pcard-img img{transform:scale(1.05)}
.pcard-img-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center}
.pcard-img-ph svg{opacity:.1}

/* Badge */
.pcard-badges{position:absolute;top:7px;left:7px;display:flex;gap:4px;flex-wrap:wrap}
.badge{font-size:.55rem;font-weight:900;text-transform:uppercase;letter-spacing:.05em;padding:3px 7px;border-radius:50px;backdrop-filter:blur(8px)}
.badge-cat{background:rgba(0,0,0,.65);color:rgba(255,255,255,.65)}
.badge-sub{background:rgba(168,85,247,.25);border:1px solid rgba(168,85,247,.4);color:var(--primary)}
.badge-new{background:rgba(34,197,94,.2);border:1px solid rgba(34,197,94,.3);color:#4ade80}

/* Body */
.pcard-body{padding:11px;display:flex;flex-direction:column;flex:1;gap:6px}
.pcard-seller{font-size:.62rem;font-weight:700;color:var(--dim);truncate:true;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.pcard-seller strong{color:var(--muted)}
.pcard-name{font-size:.8rem;font-weight:800;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
@media(min-width:640px){.pcard-name{font-size:.85rem}}

/* Stars */
.pcard-stars{display:flex;align-items:center;gap:3px}
.pcard-stars span{font-size:.6rem;color:var(--dim);margin-left:2px}

/* Footer */
.pcard-foot{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:8px;border-top:1px solid var(--border);gap:4px}
.pcard-price{font-size:1rem;font-weight:900;letter-spacing:-.03em;color:#fff}
@media(min-width:640px){.pcard-price{font-size:1.05rem}}
.pcard-sold{font-size:.58rem;color:var(--dim);font-weight:700}
.btn-ver{background:linear-gradient(135deg,var(--primary),var(--pd));border-radius:10px;padding:6px 10px;font-size:.67rem;font-weight:900;color:#fff;white-space:nowrap;transition:all .2s;box-shadow:0 3px 12px rgba(168,85,247,.25)}
.btn-ver:hover{box-shadow:0 6px 20px rgba(168,85,247,.4);transform:scale(1.03)}
@media(max-width:400px){.btn-ver{display:none}}

/* ─────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────── */
.skel-card{background:var(--card);border:1px solid var(--border);border-radius:var(--r);aspect-ratio:.8/1}
.skel{background:linear-gradient(90deg,var(--card) 25%,var(--card2) 50%,var(--card) 75%);background-size:200% 100%;animation:skel 1.3s ease infinite;border-radius:8px}
@keyframes skel{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* ─────────────────────────────────────────────
   EMPTY
───────────────────────────────────────────── */
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:14px;text-align:center;grid-column:1/-1}
.empty-icon{width:64px;height:64px;border-radius:18px;background:rgba(255,255,255,.03);border:1px solid var(--border);display:flex;align-items:center;justify-content:center}
.empty h3{font-size:1rem;font-weight:800;color:var(--muted)}
.empty p{font-size:.8rem;color:var(--dim)}

/* ─────────────────────────────────────────────
   PAGINATION
───────────────────────────────────────────── */
.pagination{display:flex;align-items:center;justify-content:center;gap:6px;padding:28px 0 16px;flex-wrap:wrap}
.page-btn{min-width:38px;height:38px;border-radius:11px;background:rgba(255,255,255,.05);border:1px solid var(--border);color:var(--muted);font-size:.78rem;font-weight:700;transition:all .2s;display:flex;align-items:center;justify-content:center;padding:0 10px;cursor:pointer}
.page-btn:hover:not(:disabled){background:rgba(255,255,255,.1);color:#fff}
.page-btn:disabled{opacity:.3;cursor:not-allowed}
.page-btn.active{background:var(--primary);border-color:var(--primary);color:#fff}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
footer{border-top:1px solid var(--border);padding:28px 0;text-align:center}
.footer-logo{display:flex;align-items:center;justify-content:center;gap:8px;font-weight:900;font-size:.85rem;color:var(--muted);margin-bottom:8px}
.footer-logo img{width:20px;height:20px;border-radius:6px}
footer p{font-size:.68rem;color:var(--dim);line-height:1.8}
footer a{color:var(--primary)}

/* ─────────────────────────────────────────────
   MOBILE BOTTOM SORT
───────────────────────────────────────────── */
.mobile-sort{display:flex;gap:8px;padding:12px 0 4px;overflow-x:auto;scrollbar-width:none}
.mobile-sort::-webkit-scrollbar{display:none}
.msort-btn{flex-shrink:0;padding:6px 14px;border-radius:50px;font-size:.68rem;font-weight:800;background:rgba(255,255,255,.05);border:1.5px solid var(--border);color:var(--muted);cursor:pointer;transition:all .2s}
.msort-btn.active{background:rgba(168,85,247,.15);border-color:rgba(168,85,247,.4);color:var(--primary)}
@media(min-width:481px){.mobile-sort{display:none}}

/* ─────────────────────────────────────────────
   STATS STRIP
───────────────────────────────────────────── */
.stats-strip{display:none;gap:24px;padding:14px 0 6px;border-bottom:1px solid var(--border);margin-bottom:16px}
@media(min-width:600px){.stats-strip{display:flex}}
.stat-item{text-align:center}
.stat-num{font-size:1.3rem;font-weight:900;color:var(--primary);letter-spacing:-.03em}
.stat-label{font-size:.62rem;text-transform:uppercase;letter-spacing:.1em;color:var(--dim);font-weight:700;margin-top:1px}
</style>
</head>
<body>

<!-- ── Navbar ── -->
<nav class="navbar">
  <div class="container nav-inner">
    <a href="/loja" class="brand">
      <img src="/logo_premium.png" alt="Ghost Pix">
      GHOST<em>PIX</em>
    </a>
    <div class="nav-search">
      <svg class="nav-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" id="search-input" placeholder="Buscar produtos, cursos, templates..." autocomplete="off">
    </div>
    <div class="nav-actions">
      <a href="/dashboard" class="btn-seller">Vender aqui</a>
    </div>
  </div>
</nav>

<!-- ── Banner Slider ── -->
<div>
<div class="slider-wrap" id="slider-wrap" style="display:none">
  <div class="slider-track" id="slider-track"></div>
  <button class="slider-arrow prev" id="slider-prev" aria-label="Anterior">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
  </button>
  <button class="slider-arrow next" id="slider-next" aria-label="Próximo">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
  </button>
  <div class="slider-dots" id="slider-dots"></div>
</div>
</div><!-- /slider padding -->

<!-- ── Trust Bar ── -->
<div class="trust">
  <div class="container">
    <div class="trust-inner">
      <div class="trust-item">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        Vendedores Verificados
      </div>
      <div class="trust-item">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        PIX Instantâneo
      </div>
      <div class="trust-item">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Entrega Imediata
      </div>
      <div class="trust-item">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        Sem Cadastro
      </div>
      <div class="trust-item">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
        Compra Protegida
      </div>
    </div>
  </div>
</div>

<!-- ── Filters ── -->
<div class="filters-bar">
  <div class="container filters-inner">
    <div class="cats" id="cats"></div>
    <select class="sort-select" id="sort-select" onchange="applyFilters()">
      <option value="popular">Mais Vendidos</option>
      <option value="recent">Mais Recentes</option>
      <option value="rating">Melhor Avaliados</option>
      <option value="price_asc">Menor Preço</option>
      <option value="price_desc">Maior Preço</option>
    </select>
  </div>
</div>

<!-- ── Main ── -->
<main>
  <div class="container">

    <!-- Mobile sort pills -->
    <div class="mobile-sort" id="mobile-sort">
      <button class="msort-btn active" data-sort="popular">🔥 Populares</button>
      <button class="msort-btn" data-sort="recent">✨ Novos</button>
      <button class="msort-btn" data-sort="rating">⭐ Avaliados</button>
      <button class="msort-btn" data-sort="price_asc">💰 Menor Preço</button>
      <button class="msort-btn" data-sort="price_desc">💎 Maior Preço</button>
    </div>

    <!-- Stats strip -->
    <div class="stats-strip">
      <div class="stat-item"><div class="stat-num" id="stat-total">—</div><div class="stat-label">Produtos</div></div>
      <div class="stat-item"><div class="stat-num">PIX</div><div class="stat-label">Pagamento</div></div>
      <div class="stat-item"><div class="stat-num">0%</div><div class="stat-label">Taxa</div></div>
      <div class="stat-item"><div class="stat-num">100%</div><div class="stat-label">Seguro</div></div>
    </div>

    <!-- Section header -->
    <div class="section-header">
      <h2 class="section-title"><span></span><span id="section-title">Todos os Produtos</span></h2>
      <span class="results-count" id="results-count"></span>
    </div>

    <!-- Grid -->
    <div class="products-grid" id="products-grid"></div>

    <!-- Pagination -->
    <div class="pagination" id="pagination" style="display:none"></div>

  </div>
</main>

<!-- ── Footer ── -->
<footer>
  <div class="container">
    <div class="footer-logo">
      <img src="/logo_premium.png" alt="">
      GHOST PIX
    </div>
    <p>Marketplace de produtos digitais · Pagamentos seguros via PIX</p>
    <p><a href="/dashboard">Quero vender aqui</a> · <a href="/" style="color:var(--muted)">Início</a> · © 2026 Ghost Pix</p>
  </div>
</footer>

<script>
/* ═══════════════════════════════════════════
   STATE
═══════════════════════════════════════════ */
const CATS = ['Todos','Digital','Físico','Serviço','Curso','Software','Template','E-book','Outro'];
let state = { search:'', category:'Todos', sort:'popular', page:1, total:0, perPage:12 };

/* ═══════════════════════════════════════════
   BANNER SLIDER
═══════════════════════════════════════════ */
(async () => {
  try {
    const res  = await fetch('/manage_banners.php?action=list_public');
    const data = await res.json();
    if (!data.success || !data.banners.length) return;

    const banners = data.banners;
    const wrap    = document.getElementById('slider-wrap');
    const track   = document.getElementById('slider-track');
    const dotsEl  = document.getElementById('slider-dots');
    wrap.style.display = 'block';

    let current = 0, timer = null;

    banners.forEach((b, i) => {
      const slide = document.createElement('div');
      slide.className = 'slide';
      const inner = b.link_url
        ? `<a href="${escHtml(b.link_url)}" target="${escHtml(b.link_target||'_blank')}" rel="noopener">`
        : `<div>`;
      const innerClose = b.link_url ? `</a>` : `</div>`;
      if (b.image_url) {
        const mobileSrc  = b.image_url_mobile || b.image_url;
        const desktopSrc = b.image_url;
        // Use <picture> to serve the right image per breakpoint
        slide.innerHTML = inner +
          `<picture>` +
          (mobileSrc !== desktopSrc ? `<source media="(max-width:600px)" srcset="${escHtml(mobileSrc)}">` : '') +
          `<img src="${escHtml(desktopSrc)}" alt="${escHtml(b.title)}" loading="${i===0?'eager':'lazy'}">` +
          `</picture>` + innerClose;
      } else {
        slide.innerHTML = `<div class="slide-placeholder"><svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;
      }
      track.appendChild(slide);

      const dot = document.createElement('div');
      dot.className = 'dot' + (i===0?' active':'');
      dot.onclick = () => goSlide(i);
      dotsEl.appendChild(dot);
    });

    if (banners.length < 2) {
      document.getElementById('slider-prev').style.display = 'none';
      document.getElementById('slider-next').style.display = 'none';
      dotsEl.style.display = 'none';
    }

    function goSlide(n) {
      current = (n + banners.length) % banners.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      document.querySelectorAll('.dot').forEach((d,i) => d.classList.toggle('active', i===current));
    }

    function nextSlide() { goSlide(current + 1); }

    function startTimer() { timer = setInterval(nextSlide, 4500); }
    function stopTimer()  { clearInterval(timer); }

    startTimer();
    document.getElementById('slider-prev').onclick = () => { stopTimer(); goSlide(current-1); startTimer(); };
    document.getElementById('slider-next').onclick = () => { stopTimer(); goSlide(current+1); startTimer(); };

    // Touch swipe
    let touchX = 0;
    track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; stopTimer(); }, {passive:true});
    track.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) goSlide(dx < 0 ? current+1 : current-1);
      startTimer();
    }, {passive:true});
  } catch {}
})();

/* ═══════════════════════════════════════════
   CATEGORIES
═══════════════════════════════════════════ */
const EMOJIS = {Todos:'',Digital:'💾',Físico:'📦',Serviço:'🛠️',Curso:'📚',Software:'⚙️',Template:'🎨','E-book':'📖',Outro:'📦'};

function buildCats() {
  const el = document.getElementById('cats');
  el.innerHTML = CATS.map(c =>
    `<button class="cat-btn${c==='Todos'?' active':''}" onclick="selectCat('${c}')">${EMOJIS[c]?EMOJIS[c]+' ':''}${c}</button>`
  ).join('');
}

function selectCat(cat) {
  state.category = cat; state.page = 1;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('active', b.textContent.trim() === (EMOJIS[cat]?EMOJIS[cat]+' ':'')+cat || b.textContent.trim().endsWith(cat)));
  updateTitle(); loadProducts();
}

function applyFilters() {
  state.sort = document.getElementById('sort-select').value;
  document.querySelectorAll('.msort-btn').forEach(b => b.classList.toggle('active', b.dataset.sort === state.sort));
  state.page = 1; loadProducts();
}

document.querySelectorAll('.msort-btn').forEach(b => {
  b.onclick = () => {
    state.sort = b.dataset.sort;
    document.getElementById('sort-select').value = state.sort;
    applyFilters();
  };
});

/* Search */
let searchTimer;
document.getElementById('search-input').addEventListener('input', e => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.search = e.target.value.trim();
    state.page = 1;
    updateTitle();
    loadProducts();
  }, 350);
});
document.getElementById('search-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') { clearTimeout(searchTimer); state.search = e.target.value.trim(); state.page = 1; updateTitle(); loadProducts(); }
});

function updateTitle() {
  const el = document.getElementById('section-title');
  if (state.search) el.textContent = `"${state.search}"`;
  else if (state.category !== 'Todos') el.textContent = (EMOJIS[state.category]||'') + ' ' + state.category;
  else el.textContent = 'Todos os Produtos';
}

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
function escHtml(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function stars(r, n) {
  if (!r) return '';
  let h = '<div class="pcard-stars">';
  for (let i = 1; i <= 5; i++) {
    h += `<svg width="10" height="10" viewBox="0 0 24 24" ${i<=Math.round(r)?'fill="#f59e0b"':'fill="none" stroke="#f59e0b" stroke-width="2"'}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  }
  h += `<span>${Number(r).toFixed(1)}${n?` (${n})`:''}</span></div>`;
  return h;
}

/* ═══════════════════════════════════════════
   RENDER CARD
═══════════════════════════════════════════ */
function renderCard(p) {
  const price   = parseFloat(p.price).toFixed(2).replace('.', ',');
  const isSub   = p.type === 'subscription';
  const isNew   = new Date(p.created_at) > new Date(Date.now() - 7*24*60*60*1000);
  const imgHtml = p.image_url
    ? `<img src="${escHtml(p.image_url)}" alt="${escHtml(p.name)}" loading="lazy">`
    : `<div class="pcard-img-ph"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;

  return `
  <a href="/p/${p.id}" class="pcard">
    <div class="pcard-img">
      ${imgHtml}
      <div class="pcard-badges">
        <span class="badge badge-cat">${escHtml(p.category)}</span>
        ${isSub ? '<span class="badge badge-sub">Assinatura</span>' : ''}
        ${isNew ? '<span class="badge badge-new">Novo</span>' : ''}
      </div>
    </div>
    <div class="pcard-body">
      <div class="pcard-seller">por <strong>${escHtml(p.seller_store||p.seller_name)}</strong></div>
      <div class="pcard-name">${escHtml(p.name)}</div>
      ${stars(p.avg_rating, p.review_count)}
      <div class="pcard-foot">
        <div>
          <div class="pcard-price">R$ ${price}</div>
          ${p.orders_count > 0 ? `<div class="pcard-sold">⚡ ${p.orders_count} vendas</div>` : ''}
        </div>
        <div class="btn-ver">Comprar</div>
      </div>
    </div>
  </a>`;
}

/* ═══════════════════════════════════════════
   SKELETONS
═══════════════════════════════════════════ */
function showSkeletons() {
  document.getElementById('products-grid').innerHTML =
    Array.from({length:12}).map(() => `<div class="skel-card"><div class="skel" style="height:100%"></div></div>`).join('');
}

/* ═══════════════════════════════════════════
   LOAD PRODUCTS
═══════════════════════════════════════════ */
async function loadProducts() {
  showSkeletons();
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

    document.getElementById('stat-total').textContent = state.total;
    document.getElementById('results-count').textContent =
      state.total + ' produto' + (state.total!==1?'s':'') + ' encontrado' + (state.total!==1?'s':'');

    const grid = document.getElementById('products-grid');
    if (products.length === 0) {
      grid.innerHTML = `<div class="empty"><div class="empty-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div><h3>Nenhum produto encontrado</h3><p>Tente outros filtros ou termos de busca</p></div>`;
    } else {
      grid.innerHTML = products.map(renderCard).join('');
    }

    renderPagination();
  } catch {
    document.getElementById('products-grid').innerHTML = `<div class="empty"><h3>Erro ao carregar</h3><p>Recarregue a página</p></div>`;
  }
}

/* ═══════════════════════════════════════════
   PAGINATION
═══════════════════════════════════════════ */
function renderPagination() {
  const total = Math.ceil(state.total / state.perPage);
  const pag   = document.getElementById('pagination');
  if (total <= 1) { pag.style.display='none'; return; }

  let h = `<button class="page-btn" onclick="goPage(${state.page-1})" ${state.page===1?'disabled':''}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>`;
  const s = Math.max(1,state.page-2), e = Math.min(total,state.page+2);
  if(s>1)h+=`<button class="page-btn" onclick="goPage(1)">1</button>${s>2?'<span style="color:var(--dim);font-size:.8rem;padding:0 4px">…</span>':''}`;
  for(let i=s;i<=e;i++)h+=`<button class="page-btn${i===state.page?' active':''}" onclick="goPage(${i})">${i}</button>`;
  if(e<total)h+=`${e<total-1?'<span style="color:var(--dim);font-size:.8rem;padding:0 4px">…</span>':''}<button class="page-btn" onclick="goPage(${total})">${total}</button>`;
  h+=`<button class="page-btn" onclick="goPage(${state.page+1})" ${state.page===total?'disabled':''}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>`;

  pag.innerHTML = h;
  pag.style.display = 'flex';
}

function goPage(p) {
  const total = Math.ceil(state.total / state.perPage);
  if(p<1||p>total) return;
  state.page = p;
  window.scrollTo({top:0,behavior:'smooth'});
  loadProducts();
}

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
buildCats();
loadProducts();
</script>
</body>
</html>
