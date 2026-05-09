<?php
require_once 'includes/db.php';

$isAuth = isLoggedIn();

// Se não logado, redireciona pro login
if (!$isAuth) {
    header('Location: /login');
    exit;
}
?>
<!doctype html>
<html lang="pt-BR">
  <head>
    <base href="/">
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/logo_lunarpay.png" />
    <link rel="manifest" href="/manifest.json" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Ghost Pix" />
    <link rel="apple-touch-icon" href="/logo_premium.png" />
    <meta name="csrf-token" content="<?php echo csrf_token(); ?>">
    <script>window.__AUTH__ = true;</script>
    <title>Ghost Pix - Dashboard Premium</title>
    
    <!-- React Build Assets -->
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/rolldown-runtime-WehaI0Q3.js?v=12">
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/vendor-charts-He-U0hDw.js?v=12">
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/vendor-react-CIFpnPib.js?v=12">
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/vendor-motion-BKEh_tME.js?v=12">
    <script type="module" crossorigin src="/assets/dashboard-react/index-CEna3Vp7.js?v=12"></script>
    <link rel="stylesheet" crossorigin href="/assets/dashboard-react/index-Dv6a6K4u.css?v=12">
    
    <!-- Preload fonts to avoid layout shift -->
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
      body {
        margin: 0;
        background-color: #08080a;
        color: white;
        font-family: 'Outfit', sans-serif;
      }
      /* Custom scrollbar for better aesthetics */
      ::-webkit-scrollbar {
        width: 6px;
      }
      ::-webkit-scrollbar-track {
        background: #08080a;
      }
      ::-webkit-scrollbar-thumb {
        background: #222;
        border-radius: 10px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #333;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <!-- Os dados são buscados via fetch('../get_dashboard_data.php') no App.jsx -->
  </body>
</html>
