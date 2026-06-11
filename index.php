<?php
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
header('X-LiteSpeed-Purge: *');

// Servir arquivos PHP diretamente se existirem
$requestPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$phpFile = __DIR__ . $requestPath;

if (file_exists($phpFile) && pathinfo($phpFile, PATHINFO_EXTENSION) === 'php') {
    require_once $phpFile;
    exit;
}

require_once 'includes/db.php';

// affiliate tracking logic
if (isset($_GET['ref'])) {
    $refToken = substr(strip_tags($_GET['ref']), 0, 32);
    try {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE referral_token = ?");
        $stmt->execute([$refToken]);
        if ($stmt->fetch()) {
            setcookie('direto_pay_ref', $refToken, time() + (86400 * 30), "/");
        }
    } catch (\Throwable $e) {}
}


$isAuth = isLoggedIn();
$requestPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Rastrear visita ao site (apenas páginas principais, sem APIs)
if (in_array($requestPath, ['/', '/login', '/register', '/vitrine', '/docs'])) {
    try {
        $pdo->prepare("INSERT INTO daily_stats (stat_date, stat_key, stat_value) VALUES (CURDATE(), 'page_views', 1) ON DUPLICATE KEY UPDATE stat_value = stat_value + 1")->execute();
        // Contar visitantes únicos por IP (1 por dia)
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        $checkVisitor = $pdo->prepare("SELECT 1 FROM daily_stats WHERE stat_date = CURDATE() AND stat_key = CONCAT('uv_', ?)");
        $checkVisitor->execute([$ip]);
        if (!$checkVisitor->fetch()) {
            $pdo->prepare("INSERT IGNORE INTO daily_stats (stat_date, stat_key, stat_value) VALUES (CURDATE(), CONCAT('uv_', ?), 1)")->execute([$ip]);
            $pdo->prepare("INSERT INTO daily_stats (stat_date, stat_key, stat_value) VALUES (CURDATE(), 'unique_visitors', 1) ON DUPLICATE KEY UPDATE stat_value = stat_value + 1")->execute();
        }
    } catch (Throwable $e) {}
}

// Se logado e acessando a raiz, redireciona direto pro dashboard
if ($isAuth && $requestPath === '/') {
    header('Location: /dashboard');
    exit;
}

// Otimização de Checkout: Buscar dados e pregar chunk no primeiro render
$checkoutData = null;
$checkoutPageFile = '';

if ($requestPath && strpos($requestPath, '/p/') === 0) {
    $parts = explode('/', trim($requestPath, '/'));
    if (count($parts) >= 2 && $parts[0] === 'p') {
        $slug = $parts[1];
        try {
            $stmt = $pdo->prepare("SELECT * FROM checkouts WHERE slug = ? AND active = 1");
            $stmt->execute([$slug]);
            $checkout = $stmt->fetch();

            if ($checkout) {
                $stmt = $pdo->prepare("SELECT * FROM checkout_items WHERE checkout_id = ?");
                $stmt->execute([$checkout['id']]);
                $items = $stmt->fetchAll();

                $total = 0;
                foreach ($items as $it) {
                    $total += (float)$it['price'];
                }

                $hasUtmify = false;
                try {
                    $uStmt = $pdo->prepare("SELECT utmify_api_token FROM users WHERE id = ? LIMIT 1");
                    $uStmt->execute([$checkout['user_id']]);
                    $utmToken = $uStmt->fetchColumn();
                    $hasUtmify = !empty($utmToken);
                } catch (\Throwable $e) {}

                $checkoutData = [
                    'success' => true,
                    'has_utmify' => $hasUtmify,
                    'checkout' => [
                        'id' => $checkout['id'],
                        'user_id' => $checkout['user_id'],
                        'title' => $checkout['title'],
                        'primary_color' => $checkout['primary_color'],
                        'secondary_color' => $checkout['secondary_color'],
                        'banner_url' => $checkout['checkout_banner_url'],
                        'custom_html_head' => $checkout['custom_html_head'] ?? '',
                        'custom_html_body' => $checkout['custom_html_body'] ?? '',
                        'custom_settings' => $checkout['custom_settings'] ? json_decode($checkout['custom_settings'], true) : (object)[],
                    ],
                    'items' => $items,
                    'total' => $total
                ];
            }
        } catch (\Throwable $e) {}
    }
}
?>
<!doctype html>
<html lang="pt-BR" translate="no" class="notranslate">
  <head>
    <script>
      // Prevent React from crashing when browser extensions or translation tools modify the DOM
      if (typeof window !== 'undefined') {
        const originalRemoveChild = Node.prototype.removeChild;
        Node.prototype.removeChild = function (child) {
          try {
            return originalRemoveChild.call(this, child);
          } catch (error) {
            if (error.name === 'NotFoundError') {
              console.warn('Prevented React removeChild crash:', error);
              return child;
            }
            throw error;
          }
        };
        const originalInsertBefore = Node.prototype.insertBefore;
        Node.prototype.insertBefore = function (newNode, referenceNode) {
          try {
            return originalInsertBefore.call(this, newNode, referenceNode);
          } catch (error) {
            if (error.name === 'NotFoundError') {
              console.warn('Prevented React insertBefore crash:', error);
              return newNode;
            }
            throw error;
          }
        };
      }
    </script>
    <base href="/">
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <link rel="manifest" href="/manifest.json" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="DiretoPay" />
    <link rel="apple-touch-icon" href="/favicon.ico" />
    <meta name="csrf-token" content="<?php echo csrf_token(); ?>">
    <script>
      window.__AUTH__ = <?php echo json_encode($isAuth); ?>;
      <?php if ($checkoutData): ?>
      window.__CHECKOUT_DATA__ = <?php echo json_encode($checkoutData); ?>;
      <?php endif; ?>
    </script>
    <title>DiretoPay - Plataforma de Pagamentos</title>

    <!-- React Build Assets -->
    <script type="module" crossorigin src="/assets/dashboard-react/index-CMwN5K3T.js?v=71"></script>
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/rolldown-runtime-WehaI0Q3.js?v=71">
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/vendor-charts-DkalkS0U.js?v=71">
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/vendor-router-Crjtektr.js?v=71">
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/vendor-motion-CnwbPiI9.js?v=71">
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/vendor-icons-BUPMymzo.js?v=71">
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/vendor-react-zlTQWXeU.js?v=71">
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/utils-BItpez6K.js?v=71">
    <link rel="stylesheet" crossorigin href="/assets/dashboard-react/index-DMDOx-HM.css?v=71">

    <!-- React Checkout Chunk Preload -->
    <?php if ($requestPath && strpos($requestPath, '/p/') === 0): ?>
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/CheckoutPage-UIY5PQuE.js?v=44">
    <?php endif; ?>
    <!-- React Checkout Chunk Preload End -->

    <!-- Preload fonts to avoid layout shift -->
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <style>
      body {
        margin: 0;
        background-color: #0a0a0c;
        color: #f8fafc;
        font-family: 'Outfit', sans-serif;
      }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(30,164,101,0.3); border-radius: 10px; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(30,164,101,0.5); }

      /* Splash screen — visível até o React montar */
      #lp-splash {
        position: fixed;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
        z-index: 9999;
        transition: opacity 0.3s ease;
        background: #0a0a0c;
      }

      #lp-splash.hidden {
        opacity: 0;
        pointer-events: none;
      }

      .lp-logo-ring {
        width: 64px;
        height: 64px;
        border-radius: 20px;
        background: linear-gradient(135deg, #1ea465, #126b41);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 40px rgba(30,164,101,0.4);
        animation: lp-pulse 1.8s ease-in-out infinite;
      }

      .lp-logo-ring svg {
        width: 36px;
        height: 36px;
        fill: white;
      }

      .lp-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid rgba(30,164,101,0.2);
        border-top-color: #1ea465;
        border-radius: 50%;
        animation: lp-spin 0.8s linear infinite;
      }

      @keyframes lp-spin {
        to { transform: rotate(360deg); }
      }

      @keyframes lp-pulse {
        0%, 100% { box-shadow: 0 0 30px rgba(30,164,101,0.35); transform: scale(1); }
        50% { box-shadow: 0 0 60px rgba(30,164,101,0.6); transform: scale(1.05); }
      }
    </style>
  </head>
  <body>
    <!-- Splash visível imediatamente, antes do bundle JS carregar -->
    <div id="lp-splash">
      <div class="lp-logo-ring">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"/>
        </svg>
      </div>
      <div class="lp-spinner"></div>
    </div>

    <div id="root"></div>

    <!-- Remove o splash assim que o React montar -->
    <script>
      (function () {
        var splash = document.getElementById('lp-splash');
        if (!splash) return;
        var observer = new MutationObserver(function () {
          var root = document.getElementById('root');
          if (root && root.children.length > 0) {
            splash.classList.add('hidden');
            setTimeout(function () { splash.remove(); }, 350);
            observer.disconnect();
          }
        });
        observer.observe(document.getElementById('root'), { childList: true });
        // Fallback: remove após 5s caso algo falhe
        setTimeout(function () { splash.remove(); }, 5000);
      })();
    </script>
  </body>
</html>
