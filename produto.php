<?php
require_once __DIR__ . '/includes/db.php';

/* ── Resolve product ID from URL (/p/123) ── */
$uri     = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$parts   = array_values(array_filter(explode('/', $uri)));
$rawSlug = end($parts);
$productId = (int)($rawSlug ?: ($_GET['slug'] ?? 0));

if (!$productId) { http_response_code(404); }

try {
    $stmt = $pdo->prepare("
        SELECT p.id, p.name, p.description, p.price, p.image_url, p.category,
               p.type, p.delivery_info, p.delivery_method, p.stock,
               p.has_variants, p.subscription_interval,
               p.orders_count, p.avg_rating, p.review_count, p.vitrine,
               p.user_id AS seller_id,
               u.full_name AS seller_name, u.status AS seller_status,
               COALESCE(ss.store_name, u.full_name) AS store_name,
               ss.slug AS store_slug
        FROM products p
        JOIN users u ON u.id = p.user_id
        LEFT JOIN store_settings ss ON ss.user_id = p.user_id
        WHERE p.id = ? AND p.status = 'active'
    ");
    $stmt->execute([$productId]);
    $product = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$product) { http_response_code(404); $product = null; }

    $variants = $reviews = [];
    if ($product) {
        $v = $pdo->prepare("SELECT id, name, description, price, stock FROM product_variants WHERE product_id = ? AND active = 1 ORDER BY sort_order, id");
        $v->execute([$productId]);
        $variants = $v->fetchAll(PDO::FETCH_ASSOC);

        $r = $pdo->prepare("SELECT buyer_name, rating, COALESCE(comment,'') AS comment, created_at FROM product_reviews WHERE product_id = ? ORDER BY created_at DESC LIMIT 10");
        $r->execute([$productId]);
        $reviews = $r->fetchAll(PDO::FETCH_ASSOC);
    }
} catch (PDOException $e) {
    $product = null;
}

$csrf      = csrf_token();
$isSub     = ($product['type'] ?? '') === 'subscription';
$hasVars   = !empty($variants);
$rating    = round((float)($product['avg_rating'] ?? 0), 1);
$revCount  = (int)($product['review_count'] ?? 0);
$soldCount = (int)($product['orders_count'] ?? 0);
$basePrice = number_format((float)($product['price'] ?? 0), 2, ',', '.');
$intLabel  = ['weekly'=>'Semanal','monthly'=>'Mensal','yearly'=>'Anual'][$product['subscription_interval'] ?? ''] ?? '';
$catIcons  = ['Digital'=>'💾','Físico'=>'📦','Serviço'=>'🛠️','Curso'=>'📚','Software'=>'⚙️','Template'=>'🎨','E-book'=>'📖','Outro'=>'📦'];
$catIcon   = $catIcons[$product['category'] ?? ''] ?? '📦';
$productJson  = json_encode(['id'=>(int)($product['id']??0),'name'=>$product['name']??'','price'=>(float)($product['price']??0),'type'=>$product['type']??'','has_variants'=>!empty($product['has_variants']),'sub_interval'=>$product['subscription_interval']??null], JSON_HEX_TAG|JSON_HEX_APOS);
$variantsJson = json_encode($variants, JSON_HEX_TAG|JSON_HEX_APOS);
?><!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= $product ? htmlspecialchars($product['name']).' — Ghost Pix' : 'Produto não encontrado — Ghost Pix' ?></title>
<?php if ($product && $product['description']): ?>
<meta name="description" content="<?= htmlspecialchars(mb_substr($product['description'], 0, 155)) ?>">
<?php endif; ?>
<link rel="icon" href="/logo_premium.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
:root {
  --bg:        #06060a;
  --card:      #0d0d12;
  --card2:     #111118;
  --border:    rgba(255,255,255,0.07);
  --border2:   rgba(255,255,255,0.12);
  --primary:   #a855f7;
  --primary-d: #7c3aed;
  --primary-g: linear-gradient(135deg,#a855f7,#7c3aed);
  --success:   #22c55e;
  --danger:    #ef4444;
  --warn:      #f59e0b;
  --text:      #fff;
  --muted:     rgba(255,255,255,0.45);
  --dim:       rgba(255,255,255,0.18);
  --r-sm:      14px;
  --r-md:      20px;
  --r-lg:      28px;
  --r-xl:      40px;
  --shadow:    0 20px 60px rgba(0,0,0,0.6);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'Outfit',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
img{max-width:100%;display:block}
button{cursor:pointer;border:none;outline:none;font-family:inherit}
input,textarea{font-family:inherit;outline:none}

/* ── Scrollbar ── */
::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(168,85,247,.3);border-radius:3px}

/* ── Layout ── */
.container{max-width:1100px;margin:0 auto;padding:0 24px}

/* ── Navbar ── */
.navbar{position:sticky;top:0;z-index:100;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);background:rgba(6,6,10,.85);border-bottom:1px solid var(--border);padding:14px 0}
.navbar-inner{display:flex;align-items:center;justify-content:space-between;gap:16px}
.brand{display:flex;align-items:center;gap:10px;font-size:1.1rem;font-weight:900;letter-spacing:-.03em}
.brand img{width:36px;height:36px;border-radius:10px;box-shadow:0 0 20px rgba(168,85,247,.25)}
.brand span{color:var(--primary);font-style:italic}
.badge-secure{display:flex;align-items:center;gap:6px;font-size:.7rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.15);padding:6px 12px;border-radius:50px}
.badge-secure svg{color:var(--success)}

/* ── Product grid ── */
.product-section{padding:48px 0 40px}
.product-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start}
@media(max-width:820px){.product-grid{grid-template-columns:1fr;gap:32px}}

/* ── Image ── */
.img-wrap{position:relative;border-radius:var(--r-xl);overflow:hidden;background:var(--card);aspect-ratio:1/1;box-shadow:var(--shadow)}
.img-wrap img{width:100%;height:100%;object-fit:cover}
.img-placeholder{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:var(--dim);background:linear-gradient(135deg,#0d0d12,#141420)}
.img-placeholder svg{opacity:.3}
.type-badge{position:absolute;top:16px;left:16px;background:rgba(0,0,0,.7);backdrop-filter:blur(10px);border:1px solid var(--border2);padding:6px 12px;border-radius:50px;font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em}
.sub-badge{background:rgba(168,85,247,.2);border-color:rgba(168,85,247,.4);color:var(--primary)}

/* ── Details panel ── */
.details{display:flex;flex-direction:column;gap:20px}
.store-link{display:inline-flex;align-items:center;gap:6px;font-size:.75rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;transition:color .2s}
.store-link:hover{color:var(--primary)}
.product-name{font-size:2rem;font-weight:900;line-height:1.1;letter-spacing:-.04em}
@media(max-width:600px){.product-name{font-size:1.6rem}}
.meta-row{display:flex;align-items:center;flex-wrap:wrap;gap:12px}
.stars{display:flex;align-items:center;gap:4px;font-size:.78rem;font-weight:700}
.stars svg{color:#f59e0b}
.meta-pill{background:var(--card2);border:1px solid var(--border);padding:4px 10px;border-radius:50px;font-size:.7rem;font-weight:700;color:var(--muted)}
.sold-pill{color:var(--primary);border-color:rgba(168,85,247,.2);background:rgba(168,85,247,.06)}

/* ── Variants ── */
.section-label{font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:var(--dim);margin-bottom:8px}
.variants-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px}
.var-btn{background:var(--card2);border:2px solid var(--border);border-radius:var(--r-sm);padding:10px 12px;text-align:left;transition:all .2s;cursor:pointer}
.var-btn:hover{border-color:rgba(168,85,247,.4);background:rgba(168,85,247,.05)}
.var-btn.selected{border-color:var(--primary);background:rgba(168,85,247,.1)}
.var-btn.out-stock{opacity:.4;cursor:not-allowed}
.var-name{font-size:.8rem;font-weight:700;color:var(--text)}
.var-price{font-size:.7rem;font-weight:600;color:var(--primary);margin-top:2px}
.var-stock{font-size:.6rem;color:var(--muted);margin-top:1px}

/* ── Price ── */
.price-box{background:var(--card);border:1px solid var(--border2);border-radius:var(--r-md);padding:20px 24px}
.price-label{font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--dim);margin-bottom:6px}
.price-main{font-size:2.4rem;font-weight:900;letter-spacing:-.04em;color:var(--text)}
.price-sub{font-size:.75rem;color:var(--muted);margin-top:4px;font-weight:500}
.price-interval{display:inline-block;background:rgba(168,85,247,.15);color:var(--primary);border:1px solid rgba(168,85,247,.3);border-radius:50px;padding:3px 10px;font-size:.68rem;font-weight:800;margin-top:6px;text-transform:uppercase;letter-spacing:.06em}

/* ── Buy button ── */
.btn-buy{width:100%;height:60px;background:var(--primary-g);border-radius:var(--r-md);font-size:1rem;font-weight:900;letter-spacing:.02em;color:#fff;display:flex;align-items:center;justify-content:center;gap:10px;transition:all .2s;box-shadow:0 10px 40px rgba(168,85,247,.3)}
.btn-buy:hover{transform:translateY(-2px);box-shadow:0 16px 50px rgba(168,85,247,.4)}
.btn-buy:active{transform:translateY(0)}
.trust-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.trust-item{display:flex;align-items:center;justify-content:center;gap:6px;font-size:.65rem;font-weight:700;color:var(--dim);background:var(--card2);border:1px solid var(--border);border-radius:var(--r-sm);padding:8px 6px;text-align:center}
.trust-item svg{flex-shrink:0;color:var(--primary)}

/* ── Tabs ── */
.tabs-section{padding:8px 0 48px}
.tabs-nav{display:flex;gap:4px;border-bottom:1px solid var(--border);margin-bottom:28px}
.tab-btn{padding:12px 20px;font-size:.8rem;font-weight:700;color:var(--muted);border-radius:8px 8px 0 0;background:transparent;border:none;border-bottom:2px solid transparent;transition:all .2s;margin-bottom:-1px}
.tab-btn.active{color:var(--primary);border-bottom-color:var(--primary);background:rgba(168,85,247,.06)}
.tab-pane{display:none}.tab-pane.active{display:block}
.desc-text{font-size:.95rem;line-height:1.8;color:var(--muted);white-space:pre-wrap;word-break:break-word}
.delivery-box{background:var(--card);border:1px solid var(--border);border-radius:var(--r-md);padding:20px 24px;margin-top:20px}
.delivery-box h4{font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--dim);margin-bottom:10px}
.delivery-box p{font-size:.9rem;color:var(--muted);line-height:1.7}

/* ── Reviews ── */
.reviews-list{display:flex;flex-direction:column;gap:16px}
.review-card{background:var(--card);border:1px solid var(--border);border-radius:var(--r-md);padding:18px 20px}
.review-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:8px}
.reviewer-name{font-size:.85rem;font-weight:700}
.review-date{font-size:.7rem;color:var(--dim)}
.review-stars{display:flex;gap:2px}
.review-text{font-size:.85rem;color:var(--muted);line-height:1.6}
.empty-reviews{text-align:center;color:var(--dim);font-size:.9rem;padding:40px 0}

/* ── Footer ── */
.page-footer{border-top:1px solid var(--border);padding:32px 0;text-align:center;color:var(--dim);font-size:.75rem;font-weight:600}
.footer-logo{display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:12px;font-weight:900;font-size:.95rem}

/* ══════════════════════════════════════════
   CHECKOUT OVERLAY
══════════════════════════════════════════ */
.overlay{display:none;position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.75);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);align-items:center;justify-content:center;padding:20px}
.overlay.open{display:flex}
.modal{background:var(--card);border:1px solid var(--border2);border-radius:var(--r-xl);width:100%;max-width:460px;max-height:90vh;overflow-y:auto;box-shadow:var(--shadow);animation:slideUp .3s cubic-bezier(.34,1.56,.64,1)}
@keyframes slideUp{from{opacity:0;transform:translateY(40px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
.modal-header{display:flex;align-items:center;justify-content:space-between;padding:24px 28px 0}
.modal-title{font-size:1.1rem;font-weight:900;letter-spacing:-.03em}
.modal-close{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--muted);transition:all .2s}
.modal-close:hover{background:rgba(255,255,255,.1);color:var(--text)}
.modal-body{padding:24px 28px 28px;display:flex;flex-direction:column;gap:20px}
.modal-product-pill{display:flex;align-items:center;gap:12px;background:rgba(168,85,247,.08);border:1px solid rgba(168,85,247,.2);border-radius:var(--r-md);padding:14px 16px}
.modal-product-pill .pname{font-size:.85rem;font-weight:700;line-height:1.2}
.modal-product-pill .pvariante{font-size:.72rem;color:var(--primary);margin-top:2px}
.modal-product-pill .pprice{font-size:1.3rem;font-weight:900;margin-left:auto;white-space:nowrap}

/* Form */
.form-group{display:flex;flex-direction:column;gap:8px}
.form-label{font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--dim)}
.form-input{background:rgba(255,255,255,.04);border:1.5px solid var(--border);border-radius:var(--r-sm);padding:14px 16px;font-size:.9rem;color:var(--text);transition:border-color .2s}
.form-input:focus{border-color:rgba(168,85,247,.5);background:rgba(168,85,247,.03)}
.form-input::placeholder{color:var(--dim)}
.coupon-row{display:flex;gap:8px}
.coupon-row input{flex:1}
.btn-coupon{background:rgba(168,85,247,.15);border:1.5px solid rgba(168,85,247,.3);color:var(--primary);border-radius:var(--r-sm);padding:0 20px;font-size:.8rem;font-weight:800;transition:all .2s;white-space:nowrap}
.btn-coupon:hover{background:rgba(168,85,247,.25)}
.discount-badge{display:flex;align-items:center;gap:8px;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);border-radius:var(--r-sm);padding:10px 14px;font-size:.8rem;font-weight:700;color:var(--success)}
.error-msg{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:var(--r-sm);padding:10px 14px;font-size:.8rem;font-weight:600;color:#f87171;display:none}
.error-msg.show{display:block}
.divider{height:1px;background:var(--border)}
.price-summary{display:flex;flex-direction:column;gap:6px}
.price-row{display:flex;justify-content:space-between;align-items:center;font-size:.85rem;color:var(--muted)}
.price-row.total{font-size:1rem;font-weight:900;color:var(--text);padding-top:8px;border-top:1px solid var(--border)}
.price-row.discount{color:var(--success)}
.btn-submit{width:100%;height:56px;background:var(--primary-g);border-radius:var(--r-md);font-size:.95rem;font-weight:900;color:#fff;display:flex;align-items:center;justify-content:center;gap:10px;transition:all .2s;box-shadow:0 8px 32px rgba(168,85,247,.3)}
.btn-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 40px rgba(168,85,247,.4)}
.btn-submit:disabled{opacity:.6;cursor:not-allowed;transform:none}
.spin{animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* QR Step */
.qr-step{display:flex;flex-direction:column;align-items:center;gap:20px;text-align:center}
.qr-step h3{font-size:1.1rem;font-weight:900}
.qr-step p{font-size:.82rem;color:var(--muted);line-height:1.6}
.qr-frame{background:white;border-radius:var(--r-md);padding:16px;box-shadow:0 0 40px rgba(168,85,247,.2)}
.qr-frame img{width:220px;height:220px;display:block}
.timer{font-size:.75rem;font-weight:700;color:var(--warn);background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:50px;padding:5px 14px}
.copy-box{width:100%;display:flex;gap:8px}
.copy-input{flex:1;background:rgba(255,255,255,.04);border:1.5px solid var(--border);border-radius:var(--r-sm);padding:12px 14px;font-size:.78rem;color:var(--text);overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.btn-copy{background:rgba(168,85,247,.15);border:1.5px solid rgba(168,85,247,.3);color:var(--primary);border-radius:var(--r-sm);padding:0 18px;font-size:.8rem;font-weight:800;white-space:nowrap;transition:all .2s}
.btn-copy.copied{background:rgba(34,197,94,.15);border-color:rgba(34,197,94,.3);color:var(--success)}
.poll-status{display:flex;align-items:center;gap:8px;font-size:.8rem;font-weight:700;color:var(--muted);background:var(--card2);border:1px solid var(--border);border-radius:50px;padding:8px 16px}
.poll-dot{width:8px;height:8px;border-radius:50%;background:var(--warn);animation:pulse 1.5s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}

/* Success Step */
.success-step{display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center}
.success-icon{width:80px;height:80px;border-radius:50%;background:rgba(34,197,94,.12);border:2px solid rgba(34,197,94,.3);display:flex;align-items:center;justify-content:center}
.success-icon svg{color:var(--success)}
.success-step h3{font-size:1.3rem;font-weight:900}
.delivery-content{background:var(--card2);border:1px solid var(--border);border-radius:var(--r-md);padding:20px;width:100%;text-align:left}
.delivery-content h4{font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--dim);margin-bottom:8px}
.delivery-content p{font-size:.9rem;color:var(--muted);line-height:1.7;word-break:break-all}

/* ── Step visibility ── */
.step{display:none}.step.active{display:flex;flex-direction:column}

/* ── Skeleton loader ── */
.skel{background:linear-gradient(90deg,var(--card) 25%,var(--card2) 50%,var(--card) 75%);background-size:200% 100%;animation:skel 1.4s ease-in-out infinite;border-radius:8px}
@keyframes skel{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* ── 404 ── */
.not-found{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:70vh;text-align:center;gap:16px}
.not-found h2{font-size:2rem;font-weight:900}
.not-found p{color:var(--muted)}
.btn-back{display:inline-flex;align-items:center;gap:8px;background:rgba(168,85,247,.15);border:1px solid rgba(168,85,247,.3);color:var(--primary);border-radius:var(--r-md);padding:12px 24px;font-size:.85rem;font-weight:800;transition:all .2s;margin-top:8px}
.btn-back:hover{background:rgba(168,85,247,.25)}
</style>
</head>
<body>

<!-- ── Navbar ── -->
<nav class="navbar">
  <div class="container navbar-inner">
    <a href="/" class="brand">
      <img src="/logo_premium.png" alt="Ghost Pix">
      GHOST<span>PIX</span>
    </a>
    <div class="badge-secure">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      Pagamento Seguro
    </div>
  </div>
</nav>

<?php if (!$product): ?>
<!-- ── 404 ── -->
<div class="container">
  <div class="not-found">
    <div style="font-size:4rem">🔍</div>
    <h2>Produto não encontrado</h2>
    <p>Este produto não está disponível ou o link está incorreto.</p>
    <a href="/vitrine" class="btn-back">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      Ver todos os produtos
    </a>
  </div>
</div>
<?php else: ?>

<!-- ── Product Section ── -->
<section class="product-section">
  <div class="container">
    <div class="product-grid">

      <!-- Image -->
      <div class="img-wrap">
        <?php if ($product['image_url']): ?>
          <img src="<?= htmlspecialchars($product['image_url']) ?>" alt="<?= htmlspecialchars($product['name']) ?>" loading="lazy">
        <?php else: ?>
          <div class="img-placeholder">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <span style="font-size:.8rem;font-weight:700"><?= htmlspecialchars($product['name']) ?></span>
          </div>
        <?php endif; ?>
        <div class="type-badge <?= $isSub ? 'sub-badge' : '' ?>">
          <?= $catIcon ?> <?= htmlspecialchars($product['category']) ?>
          <?php if ($isSub): ?> · <?= htmlspecialchars($intLabel) ?><?php endif; ?>
        </div>
      </div>

      <!-- Details -->
      <div class="details">
        <a href="<?= $product['store_slug'] ? '/loja/'.$product['store_slug'] : '#' ?>" class="store-link">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <?= htmlspecialchars($product['store_name'] ?: $product['seller_name']) ?>
        </a>
        <h1 class="product-name"><?= htmlspecialchars($product['name']) ?></h1>

        <div class="meta-row">
          <?php if ($rating > 0): ?>
          <div class="stars">
            <?php for ($i=1;$i<=5;$i++): ?>
              <?php if ($i <= $rating): ?>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <?php else: ?>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <?php endif; ?>
            <?php endfor; ?>
            <span style="color:var(--muted)"><?= number_format($rating,1) ?> (<?= $revCount ?>)</span>
          </div>
          <?php endif; ?>
          <?php if ($soldCount > 0): ?>
            <span class="meta-pill sold-pill">⚡ <?= $soldCount ?> vendas</span>
          <?php endif; ?>
          <?php if ($product['stock'] > 0): ?>
            <span class="meta-pill"><?= $product['stock'] ?> em estoque</span>
          <?php endif; ?>
        </div>

        <!-- Variants -->
        <?php if ($hasVars): ?>
        <div>
          <div class="section-label">Escolha uma opção</div>
          <div class="variants-grid">
            <?php foreach ($variants as $var): ?>
              <?php $outStock = $var['stock'] !== -1 && $var['stock'] <= 0; ?>
              <button class="var-btn <?= $outStock ? 'out-stock' : '' ?>"
                      data-id="<?= $var['id'] ?>"
                      data-price="<?= $var['price'] ?>"
                      data-name="<?= htmlspecialchars($var['name'], ENT_QUOTES) ?>"
                      <?= $outStock ? 'disabled' : '' ?>>
                <div class="var-name"><?= htmlspecialchars($var['name']) ?></div>
                <div class="var-price">R$ <?= number_format((float)$var['price'],2,',','.') ?></div>
                <?php if ($outStock): ?><div class="var-stock">Esgotado</div><?php endif; ?>
              </button>
            <?php endforeach; ?>
          </div>
        </div>
        <?php endif; ?>

        <!-- Price box -->
        <div class="price-box">
          <div class="price-label"><?= $isSub ? 'Valor da Assinatura' : 'Preço' ?></div>
          <div class="price-main" id="display-price">R$ <?= $basePrice ?></div>
          <?php if ($isSub && $intLabel): ?>
            <div class="price-interval">🔄 Cobrança <?= $intLabel ?></div>
          <?php endif; ?>
          <div class="price-sub" style="margin-top:8px">Pague via PIX — confirmação instantânea</div>
        </div>

        <!-- Buy button -->
        <button class="btn-buy" id="btn-buy">
          <?php if ($isSub): ?>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Assinar Agora
          <?php else: ?>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Comprar Agora
          <?php endif; ?>
        </button>

        <!-- Trust row -->
        <div class="trust-row">
          <div class="trust-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Pagamento Seguro
          </div>
          <div class="trust-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            PIX Instantâneo
          </div>
          <div class="trust-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Sem Cadastro
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ── Tabs Section ── -->
<section class="tabs-section">
  <div class="container">
    <div class="tabs-nav">
      <button class="tab-btn active" data-tab="desc">📄 Descrição</button>
      <?php if ($revCount > 0): ?>
        <button class="tab-btn" data-tab="reviews">⭐ Avaliações (<?= $revCount ?>)</button>
      <?php endif; ?>
    </div>
    <div id="tab-desc" class="tab-pane active">
      <?php if (trim($product['description'] ?? '')): ?>
        <p class="desc-text"><?= htmlspecialchars($product['description']) ?></p>
      <?php else: ?>
        <p class="desc-text" style="color:var(--dim)">Nenhuma descrição disponível.</p>
      <?php endif; ?>
      <?php if ($product['delivery_info'] && !$isSub): ?>
        <div class="delivery-box">
          <h4>📦 Como você vai receber</h4>
          <p><?= htmlspecialchars($product['delivery_info']) ?></p>
        </div>
      <?php endif; ?>
    </div>
    <?php if ($revCount > 0): ?>
    <div id="tab-reviews" class="tab-pane">
      <div class="reviews-list">
        <?php if (empty($reviews)): ?>
          <div class="empty-reviews">Nenhuma avaliação ainda.</div>
        <?php else: ?>
          <?php foreach ($reviews as $rev): ?>
          <div class="review-card">
            <div class="review-header">
              <span class="reviewer-name"><?= htmlspecialchars($rev['buyer_name']) ?></span>
              <div style="display:flex;align-items:center;gap:10px">
                <div class="review-stars">
                  <?php for ($i=1;$i<=5;$i++): ?>
                    <svg width="12" height="12" viewBox="0 0 24 24" <?= $i<=(int)$rev['rating']?'fill="#f59e0b"':'fill="none" stroke="#f59e0b" stroke-width="2"' ?>><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <?php endfor; ?>
                </div>
                <span class="review-date"><?= date('d/m/Y', strtotime($rev['created_at'])) ?></span>
              </div>
            </div>
            <?php if ($rev['comment']): ?>
              <p class="review-text"><?= htmlspecialchars($rev['comment']) ?></p>
            <?php endif; ?>
          </div>
          <?php endforeach; ?>
        <?php endif; ?>
      </div>
    </div>
    <?php endif; ?>
  </div>
</section>

<!-- ── Footer ── -->
<footer class="page-footer">
  <div class="container">
    <div class="footer-logo">
      <img src="/logo_premium.png" alt="Ghost Pix" style="width:24px;height:24px;border-radius:6px">
      GHOST PIX
    </div>
    <div>Pagamentos PIX seguros e instantâneos · © 2026 Ghost Pix Technology</div>
  </div>
</footer>

<!-- ══════════════════════════════════════════
     CHECKOUT OVERLAY
══════════════════════════════════════════ -->
<div class="overlay" id="overlay">
  <div class="modal" id="modal">
    <div class="modal-header">
      <span class="modal-title" id="modal-title">Finalizar Compra</span>
      <button class="modal-close" id="btn-close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="modal-body">

      <!-- Step 1: Form -->
      <div class="step active" id="step-form">
        <div class="modal-product-pill">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <div>
            <div class="pname" id="pill-name"><?= htmlspecialchars($product['name']) ?></div>
            <div class="pvariante" id="pill-variant"></div>
          </div>
          <div class="pprice" id="pill-price">R$ <?= $basePrice ?></div>
        </div>

        <div class="error-msg" id="form-error"></div>

        <div class="form-group">
          <label class="form-label">Seu Nome Completo *</label>
          <input type="text" class="form-input" id="inp-name" placeholder="Ex: João da Silva" autocomplete="name">
        </div>

        <?php if ($isSub): ?>
        <div class="form-group">
          <label class="form-label">Seu E-mail * <small style="text-transform:none;letter-spacing:0">(para receber confirmações)</small></label>
          <input type="email" class="form-input" id="inp-email" placeholder="seu@email.com" autocomplete="email">
        </div>
        <?php endif; ?>

        <div class="form-group">
          <label class="form-label">CPF / CNPJ <small style="text-transform:none;letter-spacing:0">(opcional)</small></label>
          <input type="text" class="form-input" id="inp-doc" placeholder="000.000.000-00" autocomplete="off" maxlength="18">
        </div>

        <div class="form-group">
          <label class="form-label">Chave PIX para Reembolso <small style="text-transform:none;letter-spacing:0">(opcional)</small></label>
          <input type="text" class="form-input" id="inp-pix-key" placeholder="CPF, e-mail, telefone ou chave aleatória" autocomplete="off">
          <div style="display:flex;align-items:flex-start;gap:8px;margin-top:8px;padding:10px 12px;background:rgba(234,179,8,.07);border:1px solid rgba(234,179,8,.2);border-radius:10px">
            <span style="font-size:1rem;line-height:1">⚠️</span>
            <p style="font-size:.72rem;color:rgba(234,179,8,.85);line-height:1.5;margin:0">Em caso de não entrega, o reembolso via PIX pode levar <strong>até 1 dia útil</strong> para ser processado.</p>
          </div>
        </div>

        <?php if (!$isSub): ?>
        <div class="form-group">
          <label class="form-label">Cupom de Desconto</label>
          <div class="coupon-row">
            <input type="text" class="form-input" id="inp-coupon" placeholder="DESCONTO10" style="text-transform:uppercase">
            <button class="btn-coupon" id="btn-coupon">Aplicar</button>
          </div>
          <div class="discount-badge" id="discount-badge" style="display:none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span id="discount-text">Desconto aplicado!</span>
          </div>
        </div>
        <?php endif; ?>

        <div class="divider"></div>

        <div class="price-summary">
          <div class="price-row">
            <span>Subtotal</span>
            <span id="summary-original">R$ <?= $basePrice ?></span>
          </div>
          <div class="price-row discount" id="row-discount" style="display:none">
            <span>Desconto</span>
            <span id="summary-discount">-R$ 0,00</span>
          </div>
          <div class="price-row total">
            <span>Total</span>
            <span id="summary-total">R$ <?= $basePrice ?></span>
          </div>
        </div>

        <button class="btn-submit" id="btn-submit">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" id="btn-icon"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          <span id="btn-text">Gerar PIX</span>
        </button>

        <div style="text-align:center;font-size:.7rem;color:var(--dim)">
          🔒 Seus dados são protegidos. Pagamento 100% seguro via PIX.
        </div>
      </div>

      <!-- Step 2: QR Code -->
      <div class="step" id="step-qr">
        <div class="qr-step">
          <div>
            <div class="modal-title" style="margin-bottom:6px">Escaneie o QR Code PIX</div>
            <p>Abra seu banco, escaneie o código e confirme o pagamento.</p>
          </div>
          <div class="qr-frame">
            <img id="qr-img" src="" alt="QR Code PIX">
          </div>
          <div class="timer" id="qr-timer">⏱ Aguardando confirmação...</div>
          <div style="width:100%">
            <div class="section-label" style="margin-bottom:8px">Código Copia e Cola</div>
            <div class="copy-box">
              <input type="text" class="copy-input" id="pix-code" readonly>
              <button class="btn-copy" id="btn-copy">Copiar</button>
            </div>
          </div>
          <div class="poll-status" id="poll-status">
            <div class="poll-dot"></div>
            Aguardando pagamento...
          </div>
          <div style="font-size:.72rem;color:var(--dim);text-align:center">
            Após o pagamento, a confirmação é automática. Não feche esta janela.
          </div>
        </div>
      </div>

      <!-- Step 3: Success -->
      <div class="step" id="step-success">
        <div class="success-step">
          <div class="success-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <h3>Pagamento Confirmado! 🎉</h3>
            <p style="font-size:.85rem;color:var(--muted);margin-top:6px">Obrigado pela sua compra. Abaixo estão as instruções de entrega.</p>
          </div>
          <div class="delivery-content" id="success-delivery" style="display:none">
            <h4>📦 Como receber seu produto</h4>
            <p id="success-delivery-text"></p>
          </div>

          <!-- ── Chat com Vendedor ── -->
          <div id="chat-section" style="display:none;margin-top:20px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--primary)"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span style="font-size:.8rem;font-weight:800;color:var(--text)">Chat com o Vendedor</span>
              <span id="chat-status-badge" style="font-size:.62rem;font-weight:800;padding:2px 8px;border-radius:50px;background:rgba(34,197,94,.15);color:#4ade80;border:1px solid rgba(34,197,94,.25)">Online</span>
            </div>

            <div id="chat-messages" style="
              background:rgba(255,255,255,.02);
              border:1px solid var(--border);
              border-radius:14px;
              height:220px;
              overflow-y:auto;
              padding:14px;
              display:flex;
              flex-direction:column;
              gap:8px;
              scroll-behavior:smooth;
            ">
              <div id="chat-empty" style="text-align:center;margin:auto;color:var(--dim);font-size:.78rem">
                💬 Nenhuma mensagem ainda. Diga olá para o vendedor!
              </div>
            </div>

            <div style="display:flex;gap:8px;margin-top:8px">
              <input type="text" id="chat-input" placeholder="Digite sua mensagem..." maxlength="500"
                style="flex:1;background:rgba(255,255,255,.05);border:1.5px solid var(--border);border-radius:12px;padding:10px 14px;font-size:.82rem;color:var(--text);font-family:inherit"
                onkeydown="if(event.key==='Enter'){event.preventDefault();sendChatMsg();}">
              <button onclick="sendChatMsg()" id="btn-send-chat"
                style="background:var(--primary);border:none;border-radius:12px;padding:10px 16px;color:#fff;font-weight:800;font-size:.8rem;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:6px">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
            <p style="font-size:.67rem;color:var(--dim);margin-top:6px;text-align:center">O vendedor será notificado e responderá em breve.</p>
          </div>

          <button class="btn-submit" style="background:linear-gradient(135deg,#22c55e,#16a34a);box-shadow:0 8px 32px rgba(34,197,94,.25);margin-top:16px" onclick="closeOverlay()">
            Fechar
          </button>
        </div>
      </div>

    </div>
  </div>
</div>

<script>
const PRODUCT   = <?= $productJson ?>;
const VARIANTS  = <?= $variantsJson ?>;
const CSRF      = <?= json_encode($csrf) ?>;
const IS_SUB    = <?= $isSub ? 'true' : 'false' ?>;

let state = {
  variantId:   null,
  variantName: null,
  price:       PRODUCT.price,
  discount:    0,
  couponCode:  null,
  deliveryToken: null,
  pollTimer:   null,
  qrExpiry:    null,
};

/* ── Format currency ── */
const fmt = v => 'R$ ' + parseFloat(v).toFixed(2).replace('.', ',');

/* ── Update displayed price ── */
function updatePrice(price) {
  state.price = price;
  document.getElementById('display-price').textContent = fmt(price);
  document.getElementById('pill-price').textContent    = fmt(price - state.discount);
  document.getElementById('summary-original').textContent = fmt(price);
  document.getElementById('summary-total').textContent = fmt(price - state.discount);
}

/* ── Variant selection ── */
document.querySelectorAll('.var-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    document.querySelectorAll('.var-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.variantId   = parseInt(btn.dataset.id);
    state.variantName = btn.dataset.name;
    updatePrice(parseFloat(btn.dataset.price));
    document.getElementById('pill-variant').textContent = btn.dataset.name;
    state.discount = 0;
    hideCoupon();
  });
});

/* ── CPF mask ── */
document.getElementById('inp-doc')?.addEventListener('input', e => {
  let v = e.target.value.replace(/\D/g,'').slice(0,14);
  if (v.length <= 11)
    v = v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  else
    v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  e.target.value = v;
});

/* ── Overlay ── */
function openOverlay() {
  if (PRODUCT.has_variants && !state.variantId) {
    alert('Por favor, selecione uma opção antes de continuar.');
    return;
  }
  document.getElementById('overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  showStep('step-form');
  document.getElementById('pill-name').textContent = PRODUCT.name;
  document.getElementById('pill-variant').textContent = state.variantName || '';
  document.getElementById('pill-price').textContent   = fmt(state.price - state.discount);
  document.getElementById('modal-title').textContent  = IS_SUB ? 'Confirmar Assinatura' : 'Finalizar Compra';
  document.getElementById('btn-text').textContent     = IS_SUB ? 'Assinar via PIX' : 'Gerar PIX';
}
function closeOverlay() {
  document.getElementById('overlay').classList.remove('open');
  document.body.style.overflow = '';
  if (state.pollTimer) clearInterval(state.pollTimer);
}
document.getElementById('btn-buy').addEventListener('click', openOverlay);
document.getElementById('btn-close').addEventListener('click', closeOverlay);
document.getElementById('overlay').addEventListener('click', e => { if (e.target === e.currentTarget) closeOverlay(); });

/* ── Steps ── */
function showStep(id) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

/* ── Coupon ── */
async function applyCoupon() {
  const code = document.getElementById('inp-coupon').value.trim().toUpperCase();
  if (!code) return;
  const btn = document.getElementById('btn-coupon');
  btn.textContent = '...'; btn.disabled = true;
  try {
    const res = await fetch('/buy_product.php', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ product_id: PRODUCT.id, variant_id: state.variantId||0, customer_name: 'preview', coupon_code: code, _check_coupon: true })
    });
    const data = await res.json();
    if (data.success && data.discount_amount > 0) {
      state.discount   = data.discount_amount;
      state.couponCode = code;
      document.getElementById('discount-badge').style.display = 'flex';
      document.getElementById('discount-text').textContent = 'Desconto de ' + fmt(data.discount_amount) + ' aplicado!';
      document.getElementById('row-discount').style.display = 'flex';
      document.getElementById('summary-discount').textContent = '-' + fmt(data.discount_amount);
      document.getElementById('summary-total').textContent = fmt(state.price - state.discount);
      document.getElementById('pill-price').textContent   = fmt(state.price - state.discount);
    } else {
      showError('Cupom inválido ou não aplicável.');
    }
  } catch { showError('Erro ao verificar cupom.'); }
  btn.textContent = 'Aplicar'; btn.disabled = false;
}
function hideCoupon() {
  state.couponCode = null; state.discount = 0;
  document.getElementById('discount-badge').style.display = 'none';
  document.getElementById('row-discount').style.display   = 'none';
  document.getElementById('summary-discount').textContent = '';
  document.getElementById('summary-total').textContent    = fmt(state.price);
  document.getElementById('inp-coupon').value = '';
}
document.getElementById('btn-coupon')?.addEventListener('click', applyCoupon);

/* ── Error ── */
function showError(msg) {
  const el = document.getElementById('form-error');
  el.textContent = msg; el.classList.add('show');
}
function clearError() {
  document.getElementById('form-error').classList.remove('show');
}

/* ── Submit purchase ── */
document.getElementById('btn-submit').addEventListener('click', async () => {
  clearError();
  const name = document.getElementById('inp-name').value.trim();
  const doc  = document.getElementById('inp-doc').value.trim();
  const email = document.getElementById('inp-email')?.value.trim() || '';

  if (!name || name.length < 3) { showError('Informe seu nome completo.'); return; }
  if (IS_SUB && !email) { showError('E-mail é obrigatório para assinaturas.'); return; }
  if (PRODUCT.has_variants && !state.variantId) { showError('Selecione uma opção do produto.'); return; }

  const btn = document.getElementById('btn-submit');
  btn.disabled = true;
  document.getElementById('btn-icon').outerHTML = '<svg class="spin" id="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>';
  document.getElementById('btn-text').textContent = 'Gerando PIX...';

  try {
    const endpoint = IS_SUB ? '/subscribe.php' : '/buy_product.php';
    const pixKey   = document.getElementById('inp-pix-key')?.value.trim() || '';
    const payload  = IS_SUB
      ? { product_id: PRODUCT.id, variant_id: state.variantId||0, customer_name: name, customer_email: email, customer_document: doc.replace(/\D/g,''), buyer_pix_key: pixKey }
      : { product_id: PRODUCT.id, variant_id: state.variantId||0, customer_name: name, customer_document: doc.replace(/\D/g,''), coupon_code: state.couponCode||'', buyer_pix_key: pixKey };

    const res  = await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    const data = await res.json();

    if (!data.success) { showError(data.message || data.error || 'Erro ao gerar PIX.'); resetBtn(); return; }

    state.deliveryToken = data.delivery_token || data.subscription_id || null;
    state.chatToken = null;
    document.getElementById('qr-img').src       = data.qr_image || '';
    document.getElementById('pix-code').value   = data.pix_code || '';
    document.getElementById('modal-title').textContent = '🔑 Pague com PIX';

    showStep('step-qr');
    startCountdown(900);
    startPolling();
  } catch (e) { showError('Erro de conexão. Tente novamente.'); resetBtn(); }
});

function resetBtn() {
  const btn = document.getElementById('btn-submit');
  btn.disabled = false;
  document.getElementById('btn-icon')?.remove();
  document.getElementById('btn-text').textContent = IS_SUB ? 'Assinar via PIX' : 'Gerar PIX';
}

/* ── Copy PIX ── */
document.getElementById('btn-copy').addEventListener('click', () => {
  const code = document.getElementById('pix-code').value;
  navigator.clipboard.writeText(code).catch(() => {});
  const btn = document.getElementById('btn-copy');
  btn.textContent = '✓ Copiado'; btn.classList.add('copied');
  setTimeout(() => { btn.textContent = 'Copiar'; btn.classList.remove('copied'); }, 2500);
});

/* ── Countdown ── */
function startCountdown(seconds) {
  let s = seconds;
  const el = document.getElementById('qr-timer');
  const t = setInterval(() => {
    if (!document.getElementById('step-qr').classList.contains('active')) { clearInterval(t); return; }
    s--;
    const m = String(Math.floor(s/60)).padStart(2,'0');
    const sec = String(s%60).padStart(2,'0');
    el.textContent = `⏱ ${m}:${sec} restantes`;
    if (s <= 0) { clearInterval(t); el.textContent = '⏰ Código expirado'; }
  }, 1000);
}

/* ── Polling ── */
function startPolling() {
  if (state.pollTimer) clearInterval(state.pollTimer);
  state.pollTimer = setInterval(async () => {
    if (!state.deliveryToken) return;
    try {
      const res  = await fetch('/check_order.php?token=' + encodeURIComponent(state.deliveryToken));
      const data = await res.json();
      if (data.status === 'paid') {
        clearInterval(state.pollTimer);
        const el = document.getElementById('success-delivery');
        const txt = document.getElementById('success-delivery-text');
        if (data.delivery_info || data.delivery_data) {
          el.style.display = 'block';
          txt.textContent  = data.delivery_info || data.delivery_data || '';
        }
        if (data.chat_token) {
          state.chatToken = data.chat_token;
          document.getElementById('chat-section').style.display = 'block';
          initBuyerChat(data.chat_token);
        }
        document.getElementById('modal-title').textContent = '✅ Confirmado!';
        showStep('step-success');
      } else if (data.status === 'expired') {
        clearInterval(state.pollTimer);
        document.getElementById('poll-status').innerHTML = '<span style="color:var(--danger)">⚠ PIX expirado. Feche e tente novamente.</span>';
      }
    } catch {}
  }, 4000);
}

/* ── Buyer Chat ── */
let chatPollTimer = null;
let chatLastId    = 0;

function initBuyerChat(token) {
  chatLastId = 0;
  loadChatMessages(token, false);
  if (chatPollTimer) clearInterval(chatPollTimer);
  chatPollTimer = setInterval(() => loadChatMessages(token, true), 3000);
}

async function loadChatMessages(token, polling) {
  try {
    const url = '/chat_api.php?action=buyer_get&token=' + encodeURIComponent(token) + (chatLastId ? '&after=' + chatLastId : '');
    const res  = await fetch(url);
    const data = await res.json();
    if (!data.success) return;

    const msgs = data.messages || [];
    if (msgs.length > 0) {
      const box = document.getElementById('chat-messages');
      document.getElementById('chat-empty').style.display = 'none';
      msgs.forEach(m => {
        chatLastId = Math.max(chatLastId, parseInt(m.id));
        const isBuyer = m.sender_type === 'buyer';
        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex;' + (isBuyer ? 'justify-content:flex-end' : 'justify-content:flex-start');
        const bubble = document.createElement('div');
        bubble.style.cssText = 'max-width:80%;padding:8px 12px;border-radius:14px;font-size:.78rem;line-height:1.5;' +
          (isBuyer
            ? 'background:rgba(168,85,247,.18);border:1px solid rgba(168,85,247,.3);color:#e2c4ff'
            : 'background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.09);color:rgba(255,255,255,.85)');
        const name = document.createElement('div');
        name.style.cssText = 'font-size:.62rem;font-weight:800;margin-bottom:3px;' + (isBuyer ? 'color:rgba(168,85,247,.8)' : 'color:rgba(255,255,255,.35)');
        name.textContent = m.sender_name;
        const text = document.createElement('div');
        text.textContent = m.message;
        bubble.appendChild(name);
        bubble.appendChild(text);
        wrap.appendChild(bubble);
        box.appendChild(wrap);
      });
      box.scrollTop = box.scrollHeight;
    }
  } catch {}
}

async function sendChatMsg() {
  const token = state.chatToken;
  const input = document.getElementById('chat-input');
  const msg   = input.value.trim();
  if (!msg || !token) return;
  const btn = document.getElementById('btn-send-chat');
  btn.disabled = true;
  try {
    const res  = await fetch('/chat_api.php?action=buyer_send', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ token, message: msg })
    });
    const data = await res.json();
    if (data.success) {
      input.value = '';
      await loadChatMessages(token, false);
    }
  } catch {}
  btn.disabled = false;
}

/* ── Tabs ── */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const pane = document.getElementById('tab-' + btn.dataset.tab);
    if (pane) pane.classList.add('active');
  });
});
</script>
<?php endif; ?>
</body>
</html>
