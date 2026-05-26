<?php
// includes/sidebar.php
$current_page = basename($_SERVER['PHP_SELF']);
// Determine active states for sub-items
$is_whatsapp_active = ($current_page == 'whatsapp.php');
?>
<!-- Sidebar Overlay -->
<div class="sidebar-overlay" id="sidebar-overlay"></div>

<!-- Mobile Header -->
<div class="mobile-header" style="background: #13131a; border-bottom: 1px solid rgba(255, 255, 255, 0.07); padding: 0.75rem 1.25rem; display: flex; align-items: center; justify-content: space-between;">
    <div class="logo" style="margin: 0; padding: 0;" onclick="window.location.href='/dashboard'">
        <img src="/logo_premium.png?v=9.0" class="logo-img" style="height: 32px;" alt="Ghost Logo">
        <span class="logo-text" style="font-size: 1.3rem;">Ghost<span> Pix</span></span>
    </div>
    <button class="menu-toggle" id="menu-toggle" style="background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer;">☰</button>
</div>

<div class="app-container">
    <!-- Sidebar -->
    <aside class="sidebar">
        <!-- Header / User Info -->
        <div class="sb-header">
            <div class="sb-user-card">
                <div class="sb-avatar">
                    <?php echo strtoupper(substr($_SESSION['full_name'] ?? 'U', 0, 1)); ?>
                </div>
                <div class="sb-user-info">
                    <span class="sb-name"><?php echo htmlspecialchars(explode(' ', $_SESSION['full_name'] ?? 'Usuário')[0]); ?></span>
                    <span class="sb-sub"><?php echo isAdmin() ? 'Administrador' : 'LunarPay'; ?></span>
                </div>
            </div>
            <button class="sb-close-btn" id="sidebar-close">
                <i class="fas fa-xmark"></i>
            </button>
        </div>

        <!-- Navigation Menu -->
        <nav class="sb-nav">
            <!-- Dashboard -->
            <a href="/dashboard" class="sb-item">
                <i class="fa-solid fa-chart-pie"></i>
                <span>Dashboard</span>
            </a>
            
            <!-- Vitrine -->
            <a href="/vitrine" class="sb-item">
                <i class="fa-solid fa-wand-magic-sparkles"></i>
                <span>Vitrine</span>
            </a>

            <!-- Vendas Group -->
            <div class="sb-group">
                <button class="sb-group-trigger">
                    <i class="fa-solid fa-bag-shopping"></i>
                    <span class="sb-group-title">Vendas</span>
                    <i class="fa-solid fa-chevron-right sb-chevron"></i>
                </button>
                <div class="sb-group-content">
                    <a href="/vendas" class="sb-subitem">
                        <i class="fa-solid fa-clock-rotate-left"></i>
                        <span>Transações</span>
                    </a>
                    <a href="/checkouts" class="sb-subitem">
                        <i class="fa-solid fa-link"></i>
                        <span>Checkouts</span>
                    </a>
                    <a href="/checkout-builder" class="sb-subitem">
                        <i class="fa-solid fa-palette"></i>
                        <span>Criar Checkout</span>
                    </a>
                    <a href="/vendedor/assinaturas" class="sb-subitem">
                        <i class="fa-solid fa-arrows-spin"></i>
                        <span>Assinaturas</span>
                    </a>
                    <a href="/chat" class="sb-subitem">
                        <i class="fa-solid fa-message"></i>
                        <span>Chat</span>
                    </a>
                </div>
            </div>

            <!-- Financeiro Group -->
            <div class="sb-group">
                <button class="sb-group-trigger">
                    <i class="fa-solid fa-chart-simple"></i>
                    <span class="sb-group-title">Financeiro</span>
                    <i class="fa-solid fa-chevron-right sb-chevron"></i>
                </button>
                <div class="sb-group-content">
                    <a href="/relatorios" class="sb-subitem">
                        <i class="fa-solid fa-chart-line"></i>
                        <span>Relatórios</span>
                    </a>
                    <a href="/saques" class="sb-subitem">
                        <i class="fa-solid fa-wallet"></i>
                        <span>Saques</span>
                    </a>
                    <a href="/financeiro/contas" class="sb-subitem">
                        <i class="fa-solid fa-building"></i>
                        <span>Contas Bancárias</span>
                    </a>
                </div>
            </div>

            <!-- Produtos Group -->
            <div class="sb-group">
                <button class="sb-group-trigger">
                    <i class="fa-solid fa-box"></i>
                    <span class="sb-group-title">Produtos</span>
                    <i class="fa-solid fa-chevron-right sb-chevron"></i>
                </button>
                <div class="sb-group-content">
                    <a href="/vendedor/produtos" class="sb-subitem">
                        <i class="fa-solid fa-box-open"></i>
                        <span>Catálogo</span>
                    </a>
                    <a href="/vendedor/cupons" class="sb-subitem">
                        <i class="fa-solid fa-ticket"></i>
                        <span>Cupons</span>
                    </a>
                    <a href="/vendedor/loja" class="sb-subitem">
                        <i class="fa-solid fa-store"></i>
                        <span>Minha Loja</span>
                    </a>
                </div>
            </div>

            <!-- Afiliado -->
            <a href="/afiliado" class="sb-item">
                <i class="fa-solid fa-gift"></i>
                <span>Afiliado</span>
            </a>

            <!-- Parceiros -->
            <a href="/parceiros" class="sb-item">
                <i class="fa-solid fa-handshake"></i>
                <span>Parceiros</span>
            </a>

            <!-- Premiações -->
            <a href="/premiacoes" class="sb-item">
                <i class="fa-solid fa-trophy"></i>
                <span>Premiações</span>
            </a>

            <!-- Configurações -->
            <a href="/config" class="sb-item">
                <i class="fa-solid fa-gear"></i>
                <span>Configurações</span>
            </a>

            <!-- Administração (Admin Only) -->
            <?php if(isAdmin()): ?>
            <div class="sb-group <?php echo $is_whatsapp_active ? 'open' : ''; ?>">
                <button class="sb-group-trigger">
                    <i class="fa-solid fa-shield-halved"></i>
                    <span class="sb-group-title">Administração</span>
                    <i class="fa-solid fa-chevron-right sb-chevron"></i>
                </button>
                <div class="sb-group-content" style="<?php echo $is_whatsapp_active ? 'display: flex !important;' : ''; ?>">
                    <a href="/admin" class="sb-subitem">
                        <i class="fa-solid fa-shield-halved"></i>
                        <span>Admin Geral</span>
                    </a>
                    <a href="/admin/usuarios" class="sb-subitem">
                        <i class="fa-solid fa-users"></i>
                        <span>Usuários</span>
                    </a>
                    <a href="/admin/vendas" class="sb-subitem">
                        <i class="fa-solid fa-bag-shopping"></i>
                        <span>Todas as Vendas</span>
                    </a>
                    <a href="/admin/produtos" class="sb-subitem">
                        <i class="fa-solid fa-box"></i>
                        <span>Produtos</span>
                    </a>
                    <a href="/admin/apis" class="sb-subitem">
                        <i class="fa-solid fa-plug"></i>
                        <span>Gestão de APIs</span>
                    </a>
                    <a href="/admin/whatsapp.php" class="sb-subitem <?php echo $is_whatsapp_active ? 'active' : ''; ?>">
                        <i class="fa-brands fa-whatsapp <?php echo $is_whatsapp_active ? 'text-[#e91e63]' : ''; ?>"></i>
                        <span>WhatsApp Bot</span>
                    </a>
                    <a href="/admin/banners" class="sb-subitem">
                        <i class="fa-solid fa-image"></i>
                        <span>Banners</span>
                    </a>
                    <a href="/admin/anuncios" class="sb-subitem">
                        <i class="fa-solid fa-bullhorn"></i>
                        <span>Anúncios</span>
                    </a>
                    <a href="/admin/chats" class="sb-subitem">
                        <i class="fa-solid fa-comments"></i>
                        <span>Chats</span>
                    </a>
                    <a href="/admin/gateways" class="sb-subitem">
                        <i class="fa-solid fa-cpu"></i>
                        <span>Gateways</span>
                    </a>
                    <a href="/admin/saques" class="sb-subitem">
                        <i class="fa-solid fa-wallet"></i>
                        <span>Saques</span>
                    </a>
                </div>
            </div>
            <?php endif; ?>
        </nav>

        <!-- Footer -->
        <div class="sb-footer">
            <a href="/auth/logout.php" class="sb-logout-btn">
                <i class="fa-solid fa-right-from-bracket"></i>
                <span>Sair da Conta</span>
            </a>
        </div>
    </aside>

    <!-- Interactive Sidebar script and styles -->
    <style>
        /* ── Override design system default sidebar classes ── */
        .sidebar {
            width: 280px !important;
            background: #13131a !important;
            border-right: 1px solid rgba(255, 255, 255, 0.07) !important;
            padding: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            box-shadow: 4px 0 32px rgba(0, 0, 0, 0.6) !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            bottom: 0 !important;
            height: 100vh !important;
            overflow-y: auto !important;
            z-index: 1000 !important;
        }

        .sidebar::-webkit-scrollbar {
            display: none !important;
        }
        .sidebar {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
        }

        .sb-header {
            padding: 1.25rem 1.25rem 1rem !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.07) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
        }

        .sb-user-card {
            display: flex !important;
            align-items: center !important;
            gap: 0.875rem !important;
            min-width: 0 !important;
        }

        .sb-avatar {
            width: 2.5rem !important;
            height: 2.5rem !important;
            border-radius: 1rem !important;
            background: rgba(233, 30, 99, 0.15) !important;
            color: #e91e63 !important;
            border: 1px solid rgba(233, 30, 99, 0.3) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 1.1rem !important;
            font-weight: 900 !important;
            flex-shrink: 0 !important;
        }

        .sb-user-info {
            min-width: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            line-height: 1.2 !important;
        }

        .sb-name {
            font-size: 14px !important;
            font-weight: 700 !important;
            color: #ffffff !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
        }

        .sb-sub {
            font-size: 11px !important;
            font-weight: 600 !important;
            color: #e91e63 !important;
            margin-top: 2px !important;
        }

        .sb-close-btn {
            display: none !important;
            background: none !important;
            border: none !important;
            color: #6b7280 !important;
            cursor: pointer !important;
            padding: 0.5rem !important;
            font-size: 1.2rem !important;
        }

        .sb-close-btn:hover {
            color: #e5e7eb !important;
        }

        .sb-nav {
            flex: 1 !important;
            padding: 1rem 0.75rem !important;
            overflow-y: auto !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 0.25rem !important;
        }

        .sb-nav::-webkit-scrollbar {
            display: none !important;
        }

        .sb-item, .sb-group-trigger {
            width: 100% !important;
            display: flex !important;
            align-items: center !important;
            gap: 0.875rem !important;
            padding: 0.75rem 1rem !important;
            border-radius: 0.75rem !important;
            text-decoration: none !important;
            color: #d1d5db !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            background: none !important;
            border: none !important;
            transition: all 0.15s ease !important;
            cursor: pointer !important;
            text-align: left !important;
            box-shadow: none !important;
        }

        .sb-item i, .sb-group-trigger i.fa-solid:first-child, .sb-group-trigger i.fa-brands:first-child {
            font-size: 18px !important;
            color: #9ca3af !important;
            width: 20px !important;
            text-align: center !important;
            flex-shrink: 0 !important;
        }

        .sb-item:hover, .sb-group-trigger:hover {
            background: rgba(255, 255, 255, 0.06) !important;
            color: #ffffff !important;
        }

        .sb-item:hover i, .sb-group-trigger:hover i.fa-solid:first-child {
            color: #e5e7eb !important;
        }

        .sb-item.active {
            background: #e91e63 !important;
            color: #ffffff !important;
            font-weight: 600 !important;
            box-shadow: 0 4px 14px rgba(233, 30, 99, 0.35) !important;
        }

        .sb-item.active i {
            color: #ffffff !important;
        }

        /* Collapsible groups styling */
        .sb-group {
            display: flex !important;
            flex-direction: column !important;
        }

        .sb-chevron {
            margin-left: auto !important;
            font-size: 12px !important;
            color: #4b5563 !important;
            transition: transform 0.2s ease !important;
        }

        .sb-group.open .sb-chevron {
            transform: rotate(90deg) !important;
            color: #e91e63 !important;
        }

        .sb-group-content {
            display: none;
            flex-direction: column !important;
            overflow: hidden !important;
        }

        .sb-group.open .sb-group-content {
            display: flex !important;
        }

        .sb-subitem {
            display: flex !important;
            align-items: center !important;
            gap: 0.75rem !important;
            padding: 0.625rem 1rem 0.625rem 2.75rem !important;
            border-radius: 0.75rem !important;
            text-decoration: none !important;
            color: #9ca3af !important;
            font-size: 13px !important;
            font-weight: 500 !important;
            transition: all 0.15s ease !important;
        }

        .sb-subitem i {
            font-size: 16px !important;
            color: #6b7280 !important;
            width: 16px !important;
            text-align: center !important;
            flex-shrink: 0 !important;
        }

        .sb-subitem:hover {
            background: rgba(255, 255, 255, 0.05) !important;
            color: #ffffff !important;
        }

        .sb-subitem:hover i {
            color: #9ca3af !important;
        }

        .sb-subitem.active {
            color: #e91e63 !important;
            font-weight: 600 !important;
        }

        .sb-subitem.active i {
            color: #e91e63 !important;
        }

        .sb-footer {
            border-top: 1px solid rgba(255, 255, 255, 0.07) !important;
            padding: 0.75rem 0.75rem 1rem !important;
        }

        .sb-logout-btn {
            width: 100% !important;
            display: flex !important;
            align-items: center !important;
            gap: 0.875rem !important;
            padding: 0.75rem 1rem !important;
            border-radius: 0.75rem !important;
            text-decoration: none !important;
            color: #f87171 !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            transition: all 0.15s ease !important;
            box-shadow: none !important;
        }

        .sb-logout-btn:hover {
            background: rgba(239, 68, 68, 0.1) !important;
        }

        .sb-logout-btn i {
            font-size: 18px !important;
        }

        /* Adjust main page content spacing since the sidebar is 280px */
        @media (min-width: 993px) {
            .main-content {
                margin-left: 280px !important;
                padding-left: 2rem !important;
            }
        }

        /* Responsive sidebar styling */
        @media (max-width: 992px) {
            .sidebar {
                transform: translateX(-100%) !important;
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                z-index: 9999 !important;
            }
            
            .sidebar.active {
                transform: translateX(0) !important;
            }
            
            .sb-close-btn {
                display: flex !important;
            }
            
            .main-content {
                margin-left: 0 !important;
                padding: 1rem !important;
            }
        }
    </style>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // Collapsible accordion submenus logic
            const triggers = document.querySelectorAll('.sb-group-trigger');
            triggers.forEach(trigger => {
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    const group = trigger.parentElement;
                    const isOpen = group.classList.contains('open');
                    const content = group.querySelector('.sb-group-content');
                    
                    // Toggle clicked group
                    if (isOpen) {
                        group.classList.remove('open');
                        if (content) content.style.display = 'none';
                    } else {
                        group.classList.add('open');
                        if (content) content.style.display = 'flex';
                    }
                });
            });

            // Match active link based on window location if it is one of the sub-items
            const currentPath = window.location.pathname;
            document.querySelectorAll('.sb-subitem, .sb-item').forEach(link => {
                const linkHref = link.getAttribute('href');
                if (linkHref && currentPath === linkHref) {
                    link.classList.add('active');
                    if (link.classList.contains('sb-subitem')) {
                        const parentGroup = link.closest('.sb-group');
                        if (parentGroup) {
                            parentGroup.classList.add('open');
                            const content = parentGroup.querySelector('.sb-group-content');
                            if (content) content.style.display = 'flex';
                        }
                    }
                }
            });
        });
    </script>
