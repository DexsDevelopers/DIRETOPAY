<?php
require_once 'includes/db.php';

if (!isLoggedIn()) {
    redirect('auth/login.php');
}

$userId = $_SESSION['user_id'];
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <title>Suporte & FAQ - LunarPay</title>
    <link rel="icon" type="image/png" href="logo_lunarpay.png">
    <link rel="stylesheet" href="style.css?v=125.0">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <meta name="csrf-token" content="<?php echo csrf_token(); ?>">
    <style>
        .faq-container { max-width: 800px; margin: 0 auto; }
        .faq-item { margin-bottom: 1rem; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; transition: all 0.3s var(--ease); background: var(--bg-card); }
        .faq-question { padding: 1.2rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.01); font-weight: 600; color: var(--text); }
        .faq-question:hover { background: rgba(255,255,255,0.04); }
        .faq-answer { padding: 0 1.2rem; max-height: 0; overflow: hidden; transition: all 0.3s var(--ease); background: rgba(0,0,0,0.15); font-size: 0.9rem; line-height: 1.6; color: var(--text-2); }
        .faq-item.active { border-color: var(--border-h); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
        .faq-item.active .faq-answer { padding: 1.2rem; max-height: 600px; }
        .faq-item.active .faq-question i { transform: rotate(180deg); color: var(--text); }
        .support-contact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-top: 2rem; }
        .contact-method { padding: 1.5rem; text-align: center; border-radius: 16px; border: 1px solid var(--border); background: var(--bg-card); transition: all 0.3s var(--ease); text-decoration: none; color: var(--text); display: flex; flex-direction: column; align-items: center; }
        .contact-method:hover { transform: translateY(-5px); border-color: var(--border-h); background: var(--bg-card-h); box-shadow: 0 15px 40px rgba(0,0,0,0.4); }
        .contact-method i { font-size: 2rem; margin-bottom: 1rem; color: var(--green); }
    </style>
    </style>
</head>
<body>
    <?php include 'includes/sidebar.php'; ?>

        <main class="main-content">
            <header class="top-header">
                <div>
                    <h1>Central de Suporte</h1>
                    <p style="color: var(--text-dim);">Dúvidas frequentes e atendimento humano</p>
                </div>
                <a href="dashboard.php" class="badge sent" style="text-decoration:none">Voltar ao Dashboard</a>
            </header>

            <div class="faq-container">
                <div class="card" style="margin-bottom: 2rem;">
                    <div class="card-header">
                        <div class="card-title-group">
                            <div class="card-icon"><i class="fas fa-shield-halved"></i></div>
                            <h3 class="card-title">Sobre a Plataforma</h3>
                        </div>
                    </div>
                    <p style="color: var(--text-2); line-height: 1.7; margin-bottom: 1rem; font-size: 0.95rem;">
                        A <strong>LunarPay</strong> é uma plataforma de intermediação de pagamentos digitais que permite a vendedores e empreendedores gerenciar cobranças via Pix, criar checkouts personalizados, vender produtos digitais e físicos, e acompanhar suas finanças em tempo real.
                    </p>
                    <p style="color: var(--text-2); line-height: 1.7; font-size: 0.95rem;">
                        Nossa missão é simplificar os recebimentos online, com tecnologia robusta, suporte humanizado e conformidade total com a legislação brasileira.
                    </p>
                </div>

                <h3>Perguntas Frequentes (FAQ)</h3>
                
                <div class="faq-item">
                    <div class="faq-question">Como funciona a geração de cobranças via Pix? <i class="fas fa-chevron-down"></i></div>
                    <div class="faq-answer">Acesse o Dashboard e clique em "Gerar Cobrança". Defina o valor, e o sistema criará um QR Code Pix dinâmico com validade de 20 minutos. Assim que o pagamento for confirmado, o valor é creditado automaticamente no seu saldo LunarPay.</div>
                </div>

                <div class="faq-item">
                    <div class="faq-question">Como criar um checkout de vendas? <i class="fas fa-chevron-down"></i></div>
                    <div class="faq-answer">No menu lateral, acesse "Vendas" → "Criar Checkout". Você pode personalizar cores, imagens, textos, campos do comprador, pixel de rastreamento e muito mais. Após salvar, você receberá um link único para divulgar aos seus clientes.</div>
                </div>

                <div class="faq-item">
                    <div class="faq-question">Qual o prazo para receber meu saque? <i class="fas fa-chevron-down"></i></div>
                    <div class="faq-answer">Os saques são processados em até 2 dias úteis após a solicitação. O valor é transferido para a chave Pix cadastrada no seu perfil. Certifique-se de que sua chave está correta em Configurações → Dados Financeiros.</div>
                </div>

                <div class="faq-item">
                    <div class="faq-question">Por que meu Pix expirou ou foi rejeitado? <i class="fas fa-chevron-down"></i></div>
                    <div class="faq-answer">Cada QR Code gerado tem validade de 20 minutos por segurança do sistema. Se o pagador demorar além desse prazo, basta gerar uma nova cobrança com o mesmo valor. Em caso de rejeição pelo banco, peça ao pagador que tente novamente ou use outro banco.</div>
                </div>

                <div class="faq-item">
                    <div class="faq-question">Como configurar minha chave Pix para saques? <i class="fas fa-chevron-down"></i></div>
                    <div class="faq-answer">Acesse o menu "Configurações" no painel lateral. Na seção "Dados Financeiros", insira sua chave Pix (CPF, e-mail, telefone ou chave aleatória). Essa chave será usada exclusivamente para o recebimento dos seus saques.</div>
                </div>

                <div class="faq-item">
                    <div class="faq-question">Posso vender produtos físicos e digitais? <i class="fas fa-chevron-down"></i></div>
                    <div class="faq-answer">Sim! A LunarPay suporta ambos os tipos. Para produtos digitais, você pode configurar entrega automática por e-mail ou link após o pagamento. Para produtos físicos, é possível coletar endereço de entrega no checkout.</div>
                </div>

                <div class="faq-item">
                    <div class="faq-question">A plataforma tem integração com API? <i class="fas fa-chevron-down"></i></div>
                    <div class="faq-answer">Sim! Disponibilizamos uma API REST completa para integrar cobranças, consultar transações e receber webhooks de pagamento em tempo real. Acesse a documentação completa em Configurações → API Docs.</div>
                </div>

                <div class="faq-item">
                    <div class="faq-question">Como funciona o programa de afiliados? <i class="fas fa-chevron-down"></i></div>
                    <div class="faq-answer">No menu "Afiliado", você pode se cadastrar para promover produtos de outros vendedores e ganhar comissões por cada venda realizada através do seu link. As comissões são creditadas automaticamente no seu saldo.</div>
                </div>

                <div class="card" style="margin-top: 3rem; text-align: center;">
                    <div class="card-header" style="justify-content: center;">
                        <div class="card-title-group">
                            <div class="card-icon"><i class="fas fa-headset"></i></div>
                            <h3 class="card-title">Ainda precisa de ajuda?</h3>
                        </div>
                    </div>
                    <p style="color: var(--text-2); margin-bottom: 1.5rem; font-size: 0.95rem;">Fale diretamente com nossa equipe de suporte humano.</p>
                    
                    <div class="support-contact-grid">
                        <a href="https://wa.me/5511998627674" target="_blank" class="contact-method">
                            <i class="fab fa-whatsapp"></i>
                            <h4 style="margin-bottom: 0.3rem;">WhatsApp</h4>
                            <p style="font-size: 0.8rem; color: var(--text-2);">Atendimento Instantâneo</p>
                        </a>
                        <a href="mailto:contato@lunarpay.site" class="contact-method">
                            <i class="far fa-envelope"></i>
                            <h4 style="margin-bottom: 0.3rem;">E-mail</h4>
                            <p style="font-size: 0.8rem; color: var(--text-2);">Suporte Corporativo</p>
                        </a>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script src="script.js?v=124.0"></script>
</body>
</html>

