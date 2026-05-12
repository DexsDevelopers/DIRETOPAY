<?php
// Security Headers
header("X-Frame-Options: DENY");
header("X-Content-Type-Options: nosniff");
header("X-XSS-Protection: 1; mode=block");
header("Referrer-Policy: strict-origin-when-cross-origin");

error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();
require_once 'includes/db.php';

// affiliate tracking logic
if (isset($_GET['ref'])) {
    $refToken = substr(strip_tags($_GET['ref']), 0, 32);
    $stmt = $pdo->prepare("SELECT id FROM users WHERE referral_token = ?");
    $stmt->execute([$refToken]);
    if ($stmt->fetch()) {
        setcookie('ghost_pix_ref', $refToken, time() + (86400 * 30), "/");
    }
}

if (isLoggedIn() && (isset($_GET['utm_source']) && $_GET['utm_source'] === 'pwa')) {
    redirect('dashboard.php');
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <link rel="icon" type="image/png" href="logo_lunarpay.png">
    <meta name="theme-color" content="#080808">
    <title>Ghost Pix - Receba com Total Blindagem e Privacidade</title>
    <link rel="stylesheet" href="style.css?v=126.0">
    <link rel="stylesheet" href="css/mobile-menu.css?v=108.0">
    <style>
        :root {
            --primary: #a855f7;
            --primary-dark: #7c3aed;
            --green: #4ade80;
            --gold: #fbbf24;
            --platinum: #e5e7eb;
            --emerald: #10b981;
            --wine: #9f1239;
            --glass-bg: rgba(255, 255, 255, 0.03);
            --glass-border: rgba(255, 255, 255, 0.08);
            --glass-blur: blur(20px);
            --spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        * { box-sizing: border-box; }

        body {
            background: #000;
            color: #fff;
            font-family: 'Outfit', sans-serif;
            margin: 0;
            overflow-x: hidden;
        }

        /* ===== GLASSMORPHISM SYSTEM ===== */
        .glass-card {
            background: var(--glass-bg);
            backdrop-filter: var(--glass-blur);
            -webkit-backdrop-filter: var(--glass-blur);
            border: 1px solid var(--glass-border);
            border-radius: 24px;
        }

        .glass-card-hover {
            transition: all 0.4s var(--spring);
        }

        .glass-card-hover:hover {
            transform: translateY(-8px) scale(1.02);
            background: rgba(255, 255, 255, 0.06);
            border-color: rgba(255, 255, 255, 0.15);
            box-shadow: 0 30px 60px rgba(0,0,0,0.5);
        }

        /* ===== HERO SECTION WITH DASHBOARD MOCKUP ===== */
        .hero-v2 {
            min-height: 100vh;
            padding: 120px 20px 80px;
            position: relative;
            display: flex;
            align-items: center;
        }

        .hero-container-v2 {
            max-width: 1400px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 1.2fr;
            gap: 60px;
            align-items: center;
        }

        .hero-content-v2 {
            z-index: 10;
        }

        .hero-badge-v2 {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: rgba(168, 85, 247, 0.15);
            border: 1px solid rgba(168, 85, 247, 0.3);
            padding: 10px 20px;
            border-radius: 100px;
            font-size: 0.85rem;
            font-weight: 600;
            color: #fff;
            margin-bottom: 30px;
        }

        .hero-badge-v2::before {
            content: '';
            width: 8px;
            height: 8px;
            background: var(--green);
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.8); }
        }

        .hero-title-v2 {
            font-size: 3.5rem;
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 20px;
            letter-spacing: -2px;
        }

        .hero-title-v2 span {
            background: linear-gradient(135deg, #fff 0%, #a855f7 50%, #fff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .hero-subtitle-v2 {
            font-size: 1.2rem;
            color: rgba(255,255,255,0.7);
            line-height: 1.7;
            margin-bottom: 35px;
            max-width: 500px;
        }

        .hero-ctas {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }

        .btn-glow {
            background: #fff;
            color: #000;
            padding: 16px 35px;
            border-radius: 100px;
            font-weight: 800;
            font-size: 0.95rem;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            transition: all 0.3s ease;
            border: none;
            position: relative;
            overflow: hidden;
        }

        .btn-glow::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent);
            transform: rotate(45deg);
            animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
            0% { transform: translateX(-100%) rotate(45deg); }
            100% { transform: translateX(100%) rotate(45deg); }
        }

        .btn-glow:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 40px rgba(255,255,255,0.3);
        }

        .btn-outline-glow {
            background: transparent;
            color: #fff;
            padding: 16px 35px;
            border-radius: 100px;
            font-weight: 700;
            font-size: 0.95rem;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            border: 1px solid rgba(255,255,255,0.2);
            transition: all 0.3s ease;
        }

        .btn-outline-glow:hover {
            background: rgba(255,255,255,0.1);
            border-color: rgba(255,255,255,0.4);
        }

        /* ===== DASHBOARD MOCKUP ===== */
        .dashboard-mockup {
            position: relative;
            perspective: 1000px;
        }

        .dashboard-card {
            background: linear-gradient(145deg, rgba(20,20,25,0.95), rgba(10,10,15,0.98));
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 24px;
            padding: 25px;
            box-shadow: 
                0 50px 100px rgba(0,0,0,0.5),
                0 0 0 1px rgba(255,255,255,0.05) inset;
            transform: rotateY(-5deg) rotateX(5deg);
            animation: float-dashboard 6s ease-in-out infinite;
        }

        @keyframes float-dashboard {
            0%, 100% { transform: rotateY(-5deg) rotateX(5deg) translateY(0); }
            50% { transform: rotateY(-5deg) rotateX(5deg) translateY(-15px); }
        }

        .dash-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .dash-user {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .dash-avatar {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.1rem;
        }

        .dash-greeting {
            font-size: 0.9rem;
            color: rgba(255,255,255,0.6);
        }

        .dash-greeting b {
            color: #fff;
            font-weight: 600;
        }

        .dash-stats-row {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 20px;
        }

        .dash-stat-mini {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 16px;
            padding: 15px;
        }

        .dash-stat-label {
            font-size: 0.75rem;
            color: rgba(255,255,255,0.5);
            margin-bottom: 5px;
        }

        .dash-stat-value {
            font-size: 1.3rem;
            font-weight: 700;
            color: #fff;
        }

        .dash-stat-value.up {
            color: var(--green);
        }

        .dash-chart {
            background: rgba(255,255,255,0.02);
            border-radius: 16px;
            padding: 20px;
            height: 120px;
            display: flex;
            align-items: flex-end;
            gap: 8px;
        }

        .chart-bar {
            flex: 1;
            background: linear-gradient(to top, var(--primary-dark), var(--primary));
            border-radius: 4px 4px 0 0;
            opacity: 0.7;
            transition: all 0.3s ease;
        }

        .chart-bar:hover {
            opacity: 1;
        }

        .chart-bar:nth-child(3) { height: 60%; }
        .chart-bar:nth-child(4) { height: 80%; }
        .chart-bar:nth-child(5) { height: 45%; }
        .chart-bar:nth-child(6) { height: 90%; }
        .chart-bar:nth-child(7) { height: 70%; }

        /* Live Sales Ticker */
        .live-sales-ticker {
            position: absolute;
            bottom: -30px;
            left: -30px;
            background: rgba(0,0,0,0.9);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px;
            padding: 15px 20px;
            backdrop-filter: blur(20px);
            display: flex;
            align-items: center;
            gap: 15px;
            animation: ticker-in 0.5s ease;
        }

        @keyframes ticker-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .ticker-icon {
            width: 45px;
            height: 45px;
            background: linear-gradient(135deg, var(--green), #22c55e);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
        }

        .ticker-content {
            flex: 1;
        }

        .ticker-title {
            font-size: 0.8rem;
            color: rgba(255,255,255,0.6);
        }

        .ticker-amount {
            font-size: 1.1rem;
            font-weight: 700;
            color: #fff;
        }

        .ticker-time {
            font-size: 0.7rem;
            color: rgba(255,255,255,0.4);
        }

        /* ===== AWARDS SECTION ===== */
        .awards-section {
            padding: 100px 20px;
            position: relative;
        }

        .section-header {
            text-align: center;
            max-width: 700px;
            margin: 0 auto 60px;
        }

        .section-tag {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(251, 191, 36, 0.15);
            border: 1px solid rgba(251, 191, 36, 0.3);
            padding: 8px 16px;
            border-radius: 100px;
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--gold);
            margin-bottom: 20px;
        }

        .section-title {
            font-size: 2.8rem;
            font-weight: 800;
            margin-bottom: 15px;
            letter-spacing: -1px;
        }

        .section-subtitle {
            font-size: 1.1rem;
            color: rgba(255,255,255,0.6);
        }

        .awards-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 25px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .award-card {
            background: linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 24px;
            padding: 35px 25px;
            text-align: center;
            position: relative;
            overflow: hidden;
            transition: all 0.4s var(--spring);
        }

        .award-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: var(--award-color, #fff);
        }

        .award-card:hover {
            transform: translateY(-10px) scale(1.03);
            border-color: rgba(255,255,255,0.2);
            box-shadow: 0 30px 60px rgba(0,0,0,0.4);
        }

        .award-card.platinum { --award-color: var(--platinum); }
        .award-card.gold { --award-color: var(--gold); }
        .award-card.wine { --award-color: var(--wine); }
        .award-card.emerald { --award-color: var(--emerald); }

        .award-trophy {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
            position: relative;
        }

        .award-trophy::after {
            content: '';
            position: absolute;
            inset: -2px;
            border-radius: 22px;
            padding: 2px;
            background: linear-gradient(135deg, var(--award-color), transparent);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
        }

        .award-amount {
            font-size: 2rem;
            font-weight: 800;
            color: var(--award-color);
            margin-bottom: 5px;
        }

        .award-name {
            font-size: 1rem;
            font-weight: 700;
            color: #fff;
            margin-bottom: 10px;
        }

        .award-desc {
            font-size: 0.85rem;
            color: rgba(255,255,255,0.5);
            line-height: 1.5;
        }

        /* ===== MULTI-ADQUIRENTE VISUALIZATION ===== */
        .routing-section {
            padding: 100px 20px;
            background: linear-gradient(180deg, transparent 0%, rgba(168,85,247,0.03) 50%, transparent 100%);
        }

        .routing-container {
            max-width: 1100px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 1.5fr;
            gap: 60px;
            align-items: center;
        }

        .routing-visual {
            position: relative;
            height: 400px;
        }

        .routing-node {
            position: absolute;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px;
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            transition: all 0.3s ease;
        }

        .routing-node.active {
            background: rgba(168, 85, 247, 0.15);
            border-color: var(--primary);
            box-shadow: 0 0 30px rgba(168, 85, 247, 0.3);
        }

        .routing-node.client {
            top: 50%;
            left: 0;
            transform: translateY(-50%);
        }

        .routing-node.acquirer {
            top: 20%;
            right: 20%;
        }

        .routing-node.acquirer:nth-child(3) {
            top: 50%;
            right: 10%;
        }

        .routing-node.acquirer:nth-child(4) {
            top: 80%;
            right: 20%;
        }

        .routing-node.success {
            top: 50%;
            right: 0;
            transform: translateY(-50%);
            background: rgba(74, 222, 128, 0.15);
            border-color: var(--green);
        }

        .node-icon {
            width: 40px;
            height: 40px;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
        }

        .routing-node.active .node-icon,
        .routing-node.success .node-icon {
            background: rgba(255,255,255,0.2);
        }

        .node-label {
            font-size: 0.85rem;
            font-weight: 600;
        }

        .routing-line {
            position: absolute;
            background: linear-gradient(90deg, rgba(255,255,255,0.1), rgba(168,85,247,0.5));
            height: 2px;
            transform-origin: left center;
        }

        .routing-line::after {
            content: '';
            position: absolute;
            width: 8px;
            height: 8px;
            background: var(--primary);
            border-radius: 50%;
            top: 50%;
            transform: translateY(-50%);
            animation: route-flow 2s linear infinite;
        }

        @keyframes route-flow {
            from { left: 0; }
            to { left: 100%; }
        }

        .routing-content h3 {
            font-size: 2.2rem;
            font-weight: 800;
            margin-bottom: 20px;
        }

        .routing-content p {
            font-size: 1.1rem;
            color: rgba(255,255,255,0.7);
            line-height: 1.7;
            margin-bottom: 30px;
        }

        .routing-features {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }

        .routing-feature {
            display: flex;
            align-items: center;
            gap: 12px;
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.06);
            padding: 15px 20px;
            border-radius: 12px;
            font-size: 0.9rem;
            font-weight: 600;
        }

        .routing-feature i {
            color: var(--green);
        }

        /* ===== RANKING SECTION ===== */
        .ranking-section {
            padding: 100px 20px;
        }

        .ranking-container {
            max-width: 1000px;
            margin: 0 auto;
        }

        .ranking-card {
            background: linear-gradient(145deg, rgba(20,20,25,0.95), rgba(10,10,15,0.98));
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 28px;
            padding: 40px;
            position: relative;
        }

        .ranking-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 30px;
        }

        .ranking-title {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .ranking-title i {
            font-size: 2rem;
            color: var(--gold);
        }

        .ranking-title h3 {
            font-size: 1.5rem;
            font-weight: 700;
        }

        .ranking-badge {
            background: rgba(251, 191, 36, 0.15);
            border: 1px solid rgba(251, 191, 36, 0.3);
            padding: 8px 16px;
            border-radius: 100px;
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--gold);
        }

        .ranking-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .ranking-item {
            display: flex;
            align-items: center;
            gap: 20px;
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.05);
            padding: 18px 25px;
            border-radius: 16px;
            transition: all 0.3s ease;
        }

        .ranking-item:hover {
            background: rgba(255,255,255,0.06);
            transform: translateX(5px);
        }

        .rank-position {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 1.1rem;
            border-radius: 12px;
        }

        .rank-position.gold {
            background: rgba(251, 191, 36, 0.2);
            color: var(--gold);
        }

        .rank-position.silver {
            background: rgba(203, 213, 225, 0.2);
            color: #cbd5e1;
        }

        .rank-position.bronze {
            background: rgba(249, 115, 22, 0.2);
            color: #f97316;
        }

        .rank-avatar {
            width: 45px;
            height: 45px;
            border-radius: 12px;
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
        }

        .rank-info {
            flex: 1;
        }

        .rank-name {
            font-weight: 600;
            margin-bottom: 3px;
        }

        .rank-sales {
            font-size: 0.8rem;
            color: rgba(255,255,255,0.5);
        }

        .rank-amount {
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--green);
        }

        /* ===== FINAL CTA SECTION ===== */
        .final-cta-section {
            padding: 120px 20px;
            position: relative;
            overflow: hidden;
        }

        .final-cta-section::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 800px;
            height: 800px;
            background: radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%);
            pointer-events: none;
        }

        .final-cta-container {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
            position: relative;
            z-index: 10;
        }

        .final-cta-title {
            font-size: 3rem;
            font-weight: 800;
            margin-bottom: 20px;
            letter-spacing: -1px;
        }

        .final-cta-subtitle {
            font-size: 1.2rem;
            color: rgba(255,255,255,0.7);
            margin-bottom: 40px;
        }

        .final-cta-buttons {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .btn-final {
            padding: 20px 50px;
            border-radius: 100px;
            font-weight: 800;
            font-size: 1.1rem;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 12px;
            transition: all 0.4s var(--spring);
        }

        .btn-final-primary {
            background: #fff;
            color: #000;
        }

        .btn-final-primary:hover {
            transform: scale(1.05);
            box-shadow: 0 20px 60px rgba(255,255,255,0.3);
        }

        .btn-final-outline {
            background: transparent;
            color: #fff;
            border: 2px solid rgba(255,255,255,0.3);
        }

        .btn-final-outline:hover {
            background: rgba(255,255,255,0.1);
            border-color: rgba(255,255,255,0.5);
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 1100px) {
            .hero-container-v2 {
                grid-template-columns: 1fr;
                text-align: center;
            }

            .hero-content-v2 {
                order: 2;
            }

            .hero-subtitle-v2 {
                margin-left: auto;
                margin-right: auto;
            }

            .hero-ctas {
                justify-content: center;
            }

            .dashboard-mockup {
                order: 1;
                max-width: 500px;
                margin: 0 auto;
            }

            .dashboard-card {
                transform: none;
                animation: none;
            }

            .awards-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .routing-container {
                grid-template-columns: 1fr;
            }

            .routing-visual {
                order: 2;
                height: 300px;
            }

            .hero-title-v2 {
                font-size: 2.5rem;
            }

            .section-title {
                font-size: 2rem;
            }
        }

        @media (max-width: 600px) {
            .awards-grid {
                grid-template-columns: 1fr;
            }

            .routing-features {
                grid-template-columns: 1fr;
            }

            .hero-title-v2 {
                font-size: 2rem;
            }

            .final-cta-title {
                font-size: 2rem;
            }

            .ranking-card {
                padding: 25px;
            }

            .btn-glow, .btn-outline-glow {
                padding: 14px 25px;
                font-size: 0.9rem;
            }
        }

        /* ===== NAVBAR ===== */
        .gnavbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .gnavbar-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 15px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .gnavbar-logo {
            display: flex;
            align-items: center;
            gap: 12px;
            text-decoration: none;
        }

        .gnavbar-logo-img {
            height: 40px;
            width: auto;
        }

        .gnavbar-logo-text {
            font-size: 1.5rem;
            font-weight: 800;
            color: #fff;
            letter-spacing: -1px;
        }

        .gnavbar-logo-text span {
            color: var(--primary);
        }

        .gnavbar-links {
            display: flex;
            align-items: center;
            gap: 30px;
        }

        .gnavbar-link {
            color: rgba(255,255,255,0.7);
            text-decoration: none;
            font-weight: 500;
            font-size: 0.95rem;
            transition: color 0.3s ease;
        }

        .gnavbar-link:hover {
            color: #fff;
        }

        .gnavbar-auth {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .gbtn {
            padding: 10px 22px;
            border-radius: 100px;
            font-weight: 600;
            font-size: 0.9rem;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
        }

        .gbtn-primary {
            background: #fff;
            color: #000;
        }

        .gbtn-primary:hover {
            background: #f0f0f0;
            transform: translateY(-2px);
        }

        .gbtn-outline {
            background: transparent;
            color: #fff;
            border: 1px solid rgba(255,255,255,0.3);
        }

        .gbtn-outline:hover {
            background: rgba(255,255,255,0.1);
            border-color: rgba(255,255,255,0.5);
        }

        .gnavbar-mobile-toggle {
            display: none;
            background: none;
            border: none;
            color: #fff;
            font-size: 1.5rem;
            cursor: pointer;
        }

        .gnavbar-mobile {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(10, 10, 15, 0.98);
            backdrop-filter: blur(20px);
            padding: 20px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .gnavbar-mobile.active {
            display: block;
        }

        .gnavbar-mobile-link {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 15px;
            color: rgba(255,255,255,0.8);
            text-decoration: none;
            font-weight: 500;
            border-radius: 12px;
            transition: all 0.3s ease;
        }

        .gnavbar-mobile-link:hover {
            background: rgba(255,255,255,0.05);
            color: #fff;
        }

        @media (max-width: 900px) {
            .gnavbar-links,
            .gnavbar-auth {
                display: none;
            }
            .gnavbar-mobile-toggle {
                display: block;
            }
        }

        /* ===== FOOTER ===== */
        .gfooter {
            background: linear-gradient(180deg, transparent 0%, rgba(168,85,247,0.05) 100%);
            border-top: 1px solid rgba(255,255,255,0.05);
            padding: 60px 20px 30px;
        }

        .gfooter-container {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            gap: 60px;
            margin-bottom: 40px;
        }

        .gfooter-brand {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .gfooter-logo {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .gfooter-logo-img {
            height: 45px;
        }

        .gfooter-logo-text {
            font-size: 1.8rem;
            font-weight: 800;
            color: #fff;
        }

        .gfooter-logo-text span {
            color: var(--primary);
        }

        .gfooter-tagline {
            color: rgba(255,255,255,0.5);
            font-size: 1rem;
            line-height: 1.6;
            margin: 0;
        }

        .gfooter-social {
            display: flex;
            gap: 15px;
        }

        .gfooter-social a {
            width: 40px;
            height: 40px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 1.1rem;
            text-decoration: none;
            transition: all 0.3s ease;
        }

        .gfooter-social a:hover {
            background: rgba(168,85,247,0.2);
            border-color: var(--primary);
            transform: translateY(-3px);
        }

        .gfooter-col h4 {
            font-size: 1rem;
            font-weight: 700;
            color: #fff;
            margin-bottom: 20px;
        }

        .gfooter-col a {
            display: block;
            color: rgba(255,255,255,0.5);
            text-decoration: none;
            padding: 8px 0;
            font-size: 0.95rem;
            transition: color 0.3s ease;
        }

        .gfooter-col a:hover {
            color: #fff;
        }

        .gfooter-bottom {
            max-width: 1200px;
            margin: 0 auto;
            padding-top: 30px;
            border-top: 1px solid rgba(255,255,255,0.05);
            text-align: center;
        }

        .gfooter-bottom p {
            color: rgba(255,255,255,0.4);
            font-size: 0.9rem;
            margin: 0;
        }

        @media (max-width: 768px) {
            .gfooter-container {
                grid-template-columns: 1fr;
                gap: 40px;
            }
        }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://unpkg.com/aos@next/dist/aos.css" />
</head>
<body>
    <!-- NAVBAR -->
    <nav class="gnavbar">
        <div class="gnavbar-container">
            <a href="/" class="gnavbar-logo">
                <img src="logo_premium.png" alt="Ghost Pix" class="gnavbar-logo-img">
                <span class="gnavbar-logo-text">GHOST<span>PIX</span></span>
            </a>
            
            <div class="gnavbar-links">
                <a href="#" class="gnavbar-link">Início</a>
                <a href="#awards" class="gnavbar-link">Premiações</a>
                <a href="#ranking" class="gnavbar-link">Ranking</a>
                <a href="suporte.php" class="gnavbar-link">Suporte</a>
            </div>
            
            <div class="gnavbar-auth">
                <?php if(isLoggedIn()): ?>
                    <a href="dashboard.php" class="gbtn gbtn-primary">Painel</a>
                <?php else: ?>
                    <a href="auth/login.php" class="gbtn gbtn-outline">Entrar</a>
                    <a href="auth/register.php" class="gbtn gbtn-primary">Cadastrar</a>
                <?php endif; ?>
            </div>
            
            <button class="gnavbar-mobile-toggle" onclick="document.querySelector('.gnavbar-mobile').classList.toggle('active')">
                <i class="fas fa-bars"></i>
            </button>
        </div>
        
        <!-- Mobile Menu -->
        <div class="gnavbar-mobile">
            <a href="#" class="gnavbar-mobile-link"><i class="fas fa-home"></i> Início</a>
            <a href="#awards" class="gnavbar-mobile-link"><i class="fas fa-trophy"></i> Premiações</a>
            <a href="#ranking" class="gnavbar-mobile-link"><i class="fas fa-chart-line"></i> Ranking</a>
            <a href="suporte.php" class="gnavbar-mobile-link"><i class="fas fa-headset"></i> Suporte</a>
            <hr style="border-color: rgba(255,255,255,0.1); margin: 15px 0;">
            <?php if(isLoggedIn()): ?>
                <a href="dashboard.php" class="gbtn gbtn-primary" style="width: 100%; text-align: center;">Acessar Painel</a>
            <?php else: ?>
                <a href="auth/login.php" class="gbtn gbtn-outline" style="width: 100%; text-align: center; margin-bottom: 10px;">Entrar</a>
                <a href="auth/register.php" class="gbtn gbtn-primary" style="width: 100%; text-align: center;">Criar Conta</a>
            <?php endif; ?>
        </div>
    </nav>

    <!-- HERO SECTION WITH DASHBOARD MOCKUP -->
    <section class="hero-v2">
        <div class="hero-container-v2">
            <div class="hero-content-v2" data-aos="fade-right">
                <div class="hero-badge-v2">
                    +3.000 Sellers que confiam em nós!
                </div>
                <h1 class="hero-title-v2">
                    O lado invisível que faz <span>sua operação crescer!</span>
                </h1>
                <p class="hero-subtitle-v2">
                    Receba via Pix com <strong>anonimato garantido</strong>. Sem exposição de CPF/CNPJ, 
                    saques instantâneos e <strong>blindagem total contra MED</strong>.
                </p>
                <div class="hero-ctas">
                    <?php if(isLoggedIn()): ?>
                        <a href="dashboard.php" class="btn-glow">
                            <i class="fas fa-th-large"></i> Acessar Painel
                        </a>
                    <?php else: ?>
                        <a href="auth/register.php" class="btn-glow">
                            <i class="fas fa-ghost"></i> Quero ser um Ghost
                        </a>
                    <?php endif; ?>
                    <a href="#como-funciona" class="btn-outline-glow">
                        <i class="fas fa-play"></i> Ver como funciona
                    </a>
                </div>
            </div>

            <div class="dashboard-mockup" data-aos="fade-left">
                <div class="dashboard-card">
                    <div class="dash-header">
                        <div class="dash-user">
                            <div class="dash-avatar">G</div>
                            <div class="dash-greeting">Bem-vindo, <b>Ghost Seller</b> 👋</div>
                        </div>
                        <div style="font-size: 0.8rem; color: rgba(255,255,255,0.5);">
                            <i class="fas fa-circle" style="color: var(--green); font-size: 0.6rem;"></i> Online
                        </div>
                    </div>
                    <div class="dash-stats-row">
                        <div class="dash-stat-mini">
                            <div class="dash-stat-label">Faturamento Hoje</div>
                            <div class="dash-stat-value up">R$ 12.450,00</div>
                        </div>
                        <div class="dash-stat-mini">
                            <div class="dash-stat-label">Vendas Aprovadas</div>
                            <div class="dash-stat-value">847</div>
                        </div>
                    </div>
                    <div class="dash-chart">
                        <div class="chart-bar" style="height: 40%;"></div>
                        <div class="chart-bar" style="height: 65%;"></div>
                        <div class="chart-bar" style="height: 45%;"></div>
                        <div class="chart-bar" style="height: 80%;"></div>
                        <div class="chart-bar" style="height: 55%;"></div>
                        <div class="chart-bar" style="height: 90%;"></div>
                        <div class="chart-bar" style="height: 70%;"></div>
                    </div>
                </div>
                <div class="live-sales-ticker" id="salesTicker">
                    <div class="ticker-icon">
                        <i class="fas fa-check"></i>
                    </div>
                    <div class="ticker-content">
                        <div class="ticker-title">Venda realizada no Pix!</div>
                        <div class="ticker-amount" id="tickerAmount">Comissão: R$ 69,95</div>
                    </div>
                    <div class="ticker-time">agora</div>
                </div>
            </div>
        </div>
    </section>

    <!-- AWARDS/PREMIACOES SECTION -->
    <section class="awards-section">
        <div class="section-header" data-aos="fade-up">
            <div class="section-tag">
                <i class="fas fa-trophy"></i> Programa de Recompensas
            </div>
            <h2 class="section-title">A Ghosts vibra a cada meta batida!</h2>
            <p class="section-subtitle">
                Reconhecemos sua performance com prêmios exclusivos. Cada marco é uma conquista celebrada.
            </p>
        </div>

        <div class="awards-grid">
            <div class="award-card platinum" data-aos="fade-up" data-aos-delay="100">
                <div class="award-trophy">
                    <i class="fas fa-medal" style="color: var(--platinum);"></i>
                </div>
                <div class="award-amount">100 Mil</div>
                <div class="award-name">Ghost Platinum</div>
                <div class="award-desc">Para quem transforma os primeiros 100 mil em apenas o começo.</div>
            </div>

            <div class="award-card gold" data-aos="fade-up" data-aos-delay="200">
                <div class="award-trophy">
                    <i class="fas fa-trophy" style="color: var(--gold);"></i>
                </div>
                <div class="award-amount">500 Mil</div>
                <div class="award-name">Ghost Gold</div>
                <div class="award-desc">Reconhece a ousadia de quem encara grandes desafios.</div>
            </div>

            <div class="award-card wine" data-aos="fade-up" data-aos-delay="300">
                <div class="award-trophy">
                    <i class="fas fa-crown" style="color: var(--wine);"></i>
                </div>
                <div class="award-amount">1 Milhão</div>
                <div class="award-name">Ghost Wine</div>
                <div class="award-desc">Celebra a excelência rara e sofisticação estratégica.</div>
            </div>

            <div class="award-card emerald" data-aos="fade-up" data-aos-delay="400">
                <div class="award-trophy">
                    <i class="fas fa-gem" style="color: var(--emerald);"></i>
                </div>
                <div class="award-amount">5 Milhões</div>
                <div class="award-name">Ghost Emerald</div>
                <div class="award-desc">Para quem chega aos 5 milhões não por acaso, mas por legado.</div>
            </div>
        </div>
    </section>

    <!-- MULTI-ADQUIRENTE ROUTING SECTION -->
    <section class="routing-section">
        <div class="routing-container">
            <div class="routing-content" data-aos="fade-right">
                <div class="section-tag" style="background: rgba(168, 85, 247, 0.15); border-color: rgba(168, 85, 247, 0.3); color: var(--primary);">
                    <i class="fas fa-network-wired"></i> Multi-Adquirentes
                </div>
                <h3>Adquirente falhou?<br>A Ghosts encontra outra rota na mesma hora.</h3>
                <p>
                    Deixe a Ghosts encontrar a rota com maior chance de aprovação 
                    enquanto você foca em vender! Nosso sistema inteligente alterna 
                    automaticamente entre múltiplos processadores.
                </p>
                <div class="routing-features">
                    <div class="routing-feature">
                        <i class="fas fa-check-circle"></i> Fácil
                    </div>
                    <div class="routing-feature">
                        <i class="fas fa-check-circle"></i> Rápido
                    </div>
                    <div class="routing-feature">
                        <i class="fas fa-check-circle"></i> Seguro
                    </div>
                    <div class="routing-feature">
                        <i class="fas fa-check-circle"></i> Eficaz
                    </div>
                </div>
            </div>

            <div class="routing-visual" data-aos="fade-left">
                <div class="routing-node client active">
                    <div class="node-icon"><i class="fas fa-user"></i></div>
                    <div class="node-label">Seu Cliente</div>
                </div>
                <div class="routing-node acquirer">
                    <div class="node-icon"><i class="fas fa-university"></i></div>
                    <div class="node-label">Adquirente 1</div>
                </div>
                <div class="routing-node acquirer active">
                    <div class="node-icon"><i class="fas fa-university"></i></div>
                    <div class="node-label">Adquirente 2</div>
                </div>
                <div class="routing-node acquirer">
                    <div class="node-icon"><i class="fas fa-university"></i></div>
                    <div class="node-label">Adquirente 3</div>
                </div>
                <div class="routing-node success">
                    <div class="node-icon"><i class="fas fa-check"></i></div>
                    <div class="node-label">Pix Gerado!</div>
                </div>
            </div>
        </div>
    </section>

    <!-- RANKING SECTION -->
    <section class="ranking-section">
        <div class="ranking-container">
            <div class="section-header" data-aos="fade-up">
                <div class="section-tag" style="background: rgba(74, 222, 128, 0.15); border-color: rgba(74, 222, 128, 0.3); color: var(--green);">
                    <i class="fas fa-fire"></i> Competição Mensal
                </div>
                <h2 class="section-title">Na Ghosts, sua performance importa!</h2>
                <p class="section-subtitle">
                    Todos os meses, os sellers disputam o ranking para ganhar prêmios exclusivos. 
                    Vendeu mais? Sobe no ranking. Atingiu o topo? Premiação garantida!
                </p>
            </div>

            <div class="ranking-card" data-aos="fade-up">
                <div class="ranking-header">
                    <div class="ranking-title">
                        <i class="fas fa-trophy"></i>
                        <h3>Top Sellers - Maio 2025</h3>
                    </div>
                    <div class="ranking-badge">
                        <i class="fas fa-gift"></i> Prêmios todos os meses
                    </div>
                </div>

                <div class="ranking-list">
                    <div class="ranking-item">
                        <div class="rank-position gold">1</div>
                        <div class="rank-avatar">MR</div>
                        <div class="rank-info">
                            <div class="rank-name">Marcos R.</div>
                            <div class="rank-sales">1.247 vendas este mês</div>
                        </div>
                        <div class="rank-amount">R$ 89.420,00</div>
                    </div>

                    <div class="ranking-item">
                        <div class="rank-position silver">2</div>
                        <div class="rank-avatar">AL</div>
                        <div class="rank-info">
                            <div class="rank-name">Ana L.</div>
                            <div class="rank-sales">982 vendas este mês</div>
                        </div>
                        <div class="rank-amount">R$ 67.890,00</div>
                    </div>

                    <div class="ranking-item">
                        <div class="rank-position bronze">3</div>
                        <div class="rank-avatar">JS</div>
                        <div class="rank-info">
                            <div class="rank-name">João S.</div>
                            <div class="rank-sales">756 vendas este mês</div>
                        </div>
                        <div class="rank-amount">R$ 54.230,00</div>
                    </div>

                    <div class="ranking-item">
                        <div class="rank-position" style="background: rgba(255,255,255,0.1); color: #fff;">4</div>
                        <div class="rank-avatar">CF</div>
                        <div class="rank-info">
                            <div class="rank-name">Carla F.</div>
                            <div class="rank-sales">634 vendas este mês</div>
                        </div>
                        <div class="rank-amount">R$ 45.120,00</div>
                    </div>

                    <div class="ranking-item">
                        <div class="rank-position" style="background: rgba(255,255,255,0.1); color: #fff;">5</div>
                        <div class="rank-avatar">RP</div>
                        <div class="rank-info">
                            <div class="rank-name">Rafael P.</div>
                            <div class="rank-sales">523 vendas este mês</div>
                        </div>
                        <div class="rank-amount">R$ 38.450,00</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- FINAL CTA SECTION -->
    <section class="final-cta-section">
        <div class="final-cta-container" data-aos="zoom-in">
            <h2 class="final-cta-title">Pronto para se tornar um Ghost?</h2>
            <p class="final-cta-subtitle">
                Então crie agora sua conta na GhostsPay e receba todo o atendimento necessário 
                para escalar sua operação com segurança máxima.
            </p>
            <div class="final-cta-buttons">
                <a href="auth/register.php" class="btn-final btn-final-primary">
                    <i class="fas fa-ghost"></i> Cadastrar-se Agora
                </a>
                <a href="https://wa.me/5511998627674" class="btn-final btn-final-outline" target="_blank">
                    <i class="fab fa-whatsapp"></i> Falar com Gerente
                </a>
            </div>
        </div>
    </section>

    <!-- FOOTER -->
    <footer class="gfooter">
        <div class="gfooter-container">
            <div class="gfooter-brand">
                <div class="gfooter-logo">
                    <img src="logo_premium.png" alt="Ghost Pix" class="gfooter-logo-img">
                    <span class="gfooter-logo-text">GHOST<span>PIX</span></span>
                </div>
                <p class="gfooter-tagline">O lado invisível que faz sua operação crescer!</p>
                <div class="gfooter-social">
                    <a href="#" target="_blank"><i class="fab fa-instagram"></i></a>
                    <a href="#" target="_blank"><i class="fab fa-tiktok"></i></a>
                </div>
            </div>
            
            <div class="gfooter-links">
                <div class="gfooter-col">
                    <h4>Links Rápidos</h4>
                    <a href="auth/register.php">Criar Conta</a>
                    <a href="auth/login.php">Login</a>
                    <a href="suporte.php">Suporte</a>
                </div>
                <div class="gfooter-col">
                    <h4>Legal</h4>
                    <a href="termos.php">Termos de Uso</a>
                    <a href="privacidade.php">Privacidade</a>
                </div>
            </div>
        </div>
        
        <div class="gfooter-bottom">
            <p>&copy; 2025 Ghost Pix. Todos os direitos reservados.</p>
        </div>
    </footer>

    <script src="https://unpkg.com/aos@next/dist/aos.js"></script>
    <script>
        AOS.init({
            duration: 800,
            once: true,
            offset: 100
        });

        // Live Sales Ticker Animation
        const salesData = [
            { amount: 'R$ 69,95', product: 'E-book Premium' },
            { amount: 'R$ 149,90', product: 'Curso Completo' },
            { amount: 'R$ 297,00', product: 'Mentoria Elite' },
            { amount: 'R$ 47,00', product: 'Template Pro' },
            { amount: 'R$ 97,00', product: 'Pack Ferramentas' }
        ];

        let currentSale = 0;
        const tickerAmount = document.getElementById('tickerAmount');
        const salesTicker = document.getElementById('salesTicker');

        function updateTicker() {
            salesTicker.style.animation = 'none';
            setTimeout(() => {
                currentSale = (currentSale + 1) % salesData.length;
                tickerAmount.textContent = `Comissão: ${salesData[currentSale].amount}`;
                salesTicker.style.animation = 'ticker-in 0.5s ease';
            }, 100);
        }

        setInterval(updateTicker, 4000);

        // Routing Animation
        const acquirers = document.querySelectorAll('.routing-node.acquirer');
        let activeAcquirer = 1;

        function rotateAcquirer() {
            acquirers.forEach((acc, index) => {
                acc.classList.remove('active');
                if (index === activeAcquirer) {
                    acc.classList.add('active');
                }
            });
            activeAcquirer = (activeAcquirer + 1) % acquirers.length;
        }

        setInterval(rotateAcquirer, 2500);
    </script>
</body>
</html>
