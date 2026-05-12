<?php require_once 'includes/db.php'; ?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sobre Nós - LunarPay</title>
    <link rel="icon" type="image/png" href="/logo_lunarpay.png">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Outfit', sans-serif; background: #09090f; color: #c4c4d0; min-height: 100vh; }
        .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 50; padding: 1rem 2rem; display: flex; align-items: center; justify-content: space-between; background: rgba(9,9,15,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .nav-logo { font-size: 1.2rem; font-weight: 800; color: #fff; text-decoration: none; }
        .nav-logo span { color: #C0006A; }
        .nav-back { font-size: 0.85rem; color: #888; text-decoration: none; transition: color 0.2s; }
        .nav-back:hover { color: #C0006A; }
        .container { max-width: 960px; margin: 0 auto; padding: 7rem 2rem 5rem; }
        .badge-doc { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(192,0,106,0.1); border: 1px solid rgba(192,0,106,0.25); color: #C0006A; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 0.3rem 0.85rem; border-radius: 999px; margin-bottom: 1.5rem; }
        h1 { font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 800; color: #fff; line-height: 1.15; margin-bottom: 1rem; }
        h1 span { color: #C0006A; }
        .subtitle { font-size: 1rem; color: #666; max-width: 600px; line-height: 1.7; margin-bottom: 4rem; }
        h2 { font-size: 1.1rem; font-weight: 700; color: #fff; margin: 0 0 0.75rem; }
        p { font-size: 0.92rem; line-height: 1.8; color: #888; }
        strong { color: #e0e0e8; }
        .divider { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 3.5rem 0; }

        /* Mission */
        .mission-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 3.5rem; }
        .mission-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 2rem; }
        .mission-card .icon { font-size: 2rem; margin-bottom: 1rem; }

        /* Stats */
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 3.5rem; }
        .stat-card { background: rgba(192,0,106,0.06); border: 1px solid rgba(192,0,106,0.15); border-radius: 16px; padding: 1.5rem; text-align: center; }
        .stat-value { font-size: 2rem; font-weight: 800; color: #fff; display: block; }
        .stat-label { font-size: 0.75rem; color: #888; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 0.25rem; display: block; }

        /* Company info */
        .info-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 2rem 2.5rem; margin-bottom: 3.5rem; }
        .info-row { display: flex; align-items: flex-start; gap: 1rem; padding: 0.85rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-size: 0.78rem; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.08em; min-width: 130px; padding-top: 0.1rem; }
        .info-value { font-size: 0.9rem; color: #bbb; }

        /* Contact */
        .contact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 3.5rem; }
        .contact-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 1.5rem; text-decoration: none; color: inherit; transition: all 0.2s; display: flex; align-items: center; gap: 1rem; }
        .contact-card:hover { border-color: rgba(192,0,106,0.35); background: rgba(192,0,106,0.06); }
        .contact-icon { width: 44px; height: 44px; border-radius: 12px; background: rgba(192,0,106,0.1); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
        .contact-title { font-size: 0.88rem; font-weight: 700; color: #fff; margin-bottom: 0.15rem; }
        .contact-sub { font-size: 0.78rem; color: #666; }

        /* Footer */
        .footer-doc { padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.06); display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between; }
        .footer-doc p { font-size: 0.78rem; color: #444; margin: 0; }
        .footer-doc a { color: #C0006A; text-decoration: none; font-size: 0.78rem; }
        .footer-doc a:hover { text-decoration: underline; }

        @media (max-width: 640px) {
            .container { padding: 6rem 1.25rem 4rem; }
            .mission-grid { grid-template-columns: 1fr; }
            .info-row { flex-direction: column; gap: 0.25rem; }
            .info-label { min-width: unset; }
        }
    </style>
</head>
<body>
    <nav class="nav">
        <a href="/index.php" class="nav-logo">Lunar<span>Pay</span></a>
        <a href="/index.php" class="nav-back">← Voltar ao início</a>
    </nav>

    <div class="container">
        <div class="badge-doc">🏢 Empresa</div>
        <h1>Somos a <span>LunarPay</span></h1>
        <p class="subtitle">Uma plataforma brasileira de pagamentos digitais construída para empreendedores que querem vender mais, receber com segurança e crescer sem burocracia.</p>

        <!-- Missão / Visão / Valores -->
        <div class="mission-grid">
            <div class="mission-card">
                <div class="icon">🚀</div>
                <h2>Nossa Missão</h2>
                <p>Democratizar o acesso a ferramentas de pagamento profissionais, permitindo que qualquer empreendedor — do iniciante ao avançado — venda online de forma simples, segura e eficiente.</p>
            </div>
            <div class="mission-card">
                <div class="icon">🌙</div>
                <h2>Nossa Visão</h2>
                <p>Ser a principal plataforma de intermediação de pagamentos digitais do Brasil, reconhecida pela confiabilidade, inovação contínua e pelo compromisso com o sucesso dos nossos clientes.</p>
            </div>
            <div class="mission-card">
                <div class="icon">🔒</div>
                <h2>Segurança</h2>
                <p>Operamos em conformidade com as regulamentações do Banco Central do Brasil e com a LGPD. Todos os dados são criptografados e as transações são monitoradas 24/7 contra fraudes.</p>
            </div>
            <div class="mission-card">
                <div class="icon">💜</div>
                <h2>Nossos Valores</h2>
                <p>Transparência, integridade, inovação e foco total no cliente. Acreditamos que a confiança é o pilar mais importante em qualquer relação financeira.</p>
            </div>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
            <div class="stat-card">
                <span class="stat-value">R$ 0</span>
                <span class="stat-label">Para criar conta</span>
            </div>
            <div class="stat-card">
                <span class="stat-value">20min</span>
                <span class="stat-label">Expiração do QR Code</span>
            </div>
            <div class="stat-card">
                <span class="stat-value">2 dias</span>
                <span class="stat-label">Prazo de saque</span>
            </div>
            <div class="stat-card">
                <span class="stat-value">24/7</span>
                <span class="stat-label">Monitoramento</span>
            </div>
        </div>

        <!-- Dados da Empresa -->
        <h2 style="margin-bottom: 1.25rem;">Dados da Empresa</h2>
        <div class="info-card">
            <div class="info-row">
                <span class="info-label">Razão Social</span>
                <span class="info-value">[RAZÃO SOCIAL DA EMPRESA]</span>
            </div>
            <div class="info-row">
                <span class="info-label">CNPJ</span>
                <span class="info-value">[CNPJ]</span>
            </div>
            <div class="info-row">
                <span class="info-label">Endereço</span>
                <span class="info-value">[ENDEREÇO COMPLETO]</span>
            </div>
            <div class="info-row">
                <span class="info-label">Cidade / Estado</span>
                <span class="info-value">São Paulo – SP</span>
            </div>
            <div class="info-row">
                <span class="info-label">E-mail</span>
                <span class="info-value">contato@lunarpay.site</span>
            </div>
            <div class="info-row">
                <span class="info-label">WhatsApp</span>
                <span class="info-value">(11) 99862-7674</span>
            </div>
            <div class="info-row">
                <span class="info-label">Site</span>
                <span class="info-value">https://lunarpay.site</span>
            </div>
            <div class="info-row">
                <span class="info-label">Instagram</span>
                <span class="info-value"><a href="https://instagram.com/user.lunarpay" target="_blank" style="color:#C0006A; text-decoration:none;">@user.lunarpay</a></span>
            </div>
            <div class="info-row">
                <span class="info-label">Horário Suporte</span>
                <span class="info-value">Segunda a Sexta, das 9h às 18h (horário de Brasília)</span>
            </div>
        </div>

        <!-- Contato -->
        <h2 style="margin-bottom: 1.25rem;">Fale Conosco</h2>
        <div class="contact-grid">
            <a href="https://wa.me/5511998627674" target="_blank" class="contact-card">
                <div class="contact-icon">💬</div>
                <div>
                    <div class="contact-title">WhatsApp</div>
                    <div class="contact-sub">(11) 99862-7674</div>
                </div>
            </a>
            <a href="mailto:contato@lunarpay.site" class="contact-card">
                <div class="contact-icon">📧</div>
                <div>
                    <div class="contact-title">E-mail Geral</div>
                    <div class="contact-sub">contato@lunarpay.site</div>
                </div>
            </a>
            <a href="https://instagram.com/user.lunarpay" target="_blank" rel="noopener noreferrer" class="contact-card">
                <div class="contact-icon">📸</div>
                <div>
                    <div class="contact-title">Instagram</div>
                    <div class="contact-sub">@user.lunarpay</div>
                </div>
            </a>
            <a href="mailto:privacidade@lunarpay.site" class="contact-card">
                <div class="contact-icon">🔒</div>
                <div>
                    <div class="contact-title">Privacidade (DPO)</div>
                    <div class="contact-sub">privacidade@lunarpay.site</div>
                </div>
            </a>
        </div>

        <div class="footer-doc">
            <p>© 2026 LunarPay · [RAZÃO SOCIAL] · CNPJ [CNPJ]</p>
            <div style="display:flex; gap:1.5rem;">
                <a href="/termos.php">Termos de Uso</a>
                <a href="/privacidade.php">Privacidade</a>
                <a href="/suporte.php">Suporte</a>
            </div>
        </div>
    </div>
</body>
</html>
