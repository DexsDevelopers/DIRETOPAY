<?php
require_once 'includes/db.php';
try {
    require_once 'includes/PushService.php';
} catch (Throwable $e) {}
require_once 'includes/MailService.php';
require_once 'includes/TelegramService.php';
try { require_once 'includes/WhatsAppService.php'; } catch (Throwable $e) {}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Log imediato de depuração para qualquer hit no webhook
write_log('INFO', 'Webhook Hit Recebido', [
    'input_raw' => $input,
    'headers' => getallheaders(),
    'ip' => $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'
]);

// Webhook de pagamento PIX
if (isset($data['event']) && ($data['event'] === 'payment.completed' || $data['event'] === 'payment.paid')) {
    $pixData = $data['data'] ?? [];
    
    // Suporte a diferentes chaves de ID (payment_id ou id)
    $pixId = $pixData['payment_id'] ?? ($pixData['id'] ?? ($data['id'] ?? ''));
    
    // Suporte a diferentes nomes de status (completed ou paid)
    $status = $pixData['status'] ?? ($data['status'] ?? '');
    
    // external_id enviado pelo gateway
    $externalId = $pixData['external_id'] ?? ($data['external_id'] ?? '');

    if (($status === 'completed' || $status === 'paid' || $status === 'PAID') && (!empty($pixId) || !empty($externalId))) {
        write_log('INFO', 'Webhook Identificado para Processamento', ['pix_id' => $pixId, 'external_id' => $externalId, 'status' => $status]);

    // Buscar a transação pendente — tenta pix_id primeiro, depois external_id como fallback
    $transaction = null;
    if (!empty($pixId)) {
        $stmt = $pdo->prepare("SELECT * FROM transactions WHERE pix_id = ? AND status = 'pending'");
        $stmt->execute([$pixId]);
        $transaction = $stmt->fetch() ?: null;
    }
    if (!$transaction && !empty($externalId)) {
        $stmt = $pdo->prepare("SELECT * FROM transactions WHERE external_id = ? AND status = 'pending'");
        $stmt->execute([$externalId]);
        $transaction = $stmt->fetch() ?: null;
        if ($transaction && !empty($pixId)) {
            // Atualiza o pix_id na transação para futuras referências
            $pdo->prepare("UPDATE transactions SET pix_id = ? WHERE id = ?")->execute([$pixId, $transaction['id']]);
        }
    }
    write_log('INFO', 'Transação Lookup', ['found' => (bool)$transaction, 'via_pix_id' => !empty($pixId), 'via_external_id' => !empty($externalId)]);

    if ($transaction) {
        $pdo->beginTransaction();
        try {
            // Nome real do pagador
            $realPayerName = $pixData['payer']['name'] ?? ($pixData['payer_name'] ?? ($pixData['customer_name'] ?? null));

            // 1. Atualizar status da transação e nome do pagador (se disponível)
            if ($realPayerName) {
                $upd = $pdo->prepare("UPDATE transactions SET status = 'paid', customer_name = ? WHERE id = ?");
                $upd->execute([$realPayerName, $transaction['id']]);
            } else {
                $upd = $pdo->prepare("UPDATE transactions SET status = 'paid' WHERE id = ?");
                $upd->execute([$transaction['id']]);
            }

            // 2. Adicionar valor ao saldo do usuário (VALOR BRUTO conforme solicitado)
            adjustBalance(
                (int)$transaction['user_id'],
                (float)$transaction['amount_brl'],
                'sale',
                'tx_' . $transaction['id'],
                'Venda confirmada PIX #' . $transaction['id'] . ' — R$ ' . number_format($transaction['amount_brl'], 2, ',', '.')
            );

            // 3. Calcular e Credit lucro do Admin e Afiliado
            // Lucro plataforma = Valor Bruto - Valor Líquido - Taxa Gateway (8% + R$0,99)
            $gatewayFee = $transaction['amount_brl'] * 0.08 + 0.99;
            $platformGrossProfit = $transaction['amount_brl'] - $transaction['amount_net_brl'] - $gatewayFee;
            
            if ($platformGrossProfit > 0) {
                // Verificar se o usuário da transação possui um afiliado
                $userAffStmt = $pdo->prepare("SELECT affiliate_id FROM users WHERE id = ?");
                $userAffStmt->execute([$transaction['user_id']]);
                $userAff = $userAffStmt->fetch();

                $affiliateCommission = 0;
                if ($userAff && !empty($userAff['affiliate_id'])) {
                    // Buscar taxa de comissão de afiliados
                    $affRateStmt = $pdo->query("SELECT `value` FROM settings WHERE `key` = 'affiliate_commission_rate'");
                    $affRate = (float)$affRateStmt->fetchColumn();
                    
                    $affiliateCommission = $platformGrossProfit * ($affRate / 100);
                    
                    // Creditar ao afiliado
                    adjustBalance(
                        (int)$userAff['affiliate_id'],
                        $affiliateCommission,
                        'affiliate',
                        'tx_' . $transaction['id'],
                        'Comissão afiliado — venda #' . $transaction['id']
                    );
                }

                $adminProfit = $platformGrossProfit - $affiliateCommission;
                
                if ($adminProfit > 0) {
                    // Creditar ao primeiro admin encontrado
                    $adminStmt = $pdo->query("SELECT id FROM users WHERE is_admin = 1 LIMIT 1");
                    $admin = $adminStmt->fetch();
                    if ($admin) {
                        adjustBalance(
                            (int)$admin['id'],
                            $adminProfit,
                            'admin_profit',
                            'tx_' . $transaction['id'],
                            'Lucro plataforma — venda #' . $transaction['id']
                        );
                    }
                }
            }

            $pdo->commit();
            write_log('INFO', 'Transação Confirmada', ['transaction_id' => $transaction['id'], 'user_id' => $transaction['user_id']]);

            // === AUTO-DELIVERY: assign stock item to product order ===
            try {
                $orderStmt = $pdo->prepare("SELECT o.*, p.delivery_method, p.delivery_info FROM orders o JOIN products p ON p.id = o.product_id WHERE o.transaction_id = ? AND o.status = 'pending' LIMIT 1");
                $orderStmt->execute([$transaction['id']]);
                $order = $orderStmt->fetch();

                if ($order) {
                    // Try to pick an available stock item
                    $pdo->beginTransaction();
                    $stockItem = $pdo->prepare("SELECT id, content FROM product_stock_items WHERE product_id = ? AND status = 'available' ORDER BY id ASC LIMIT 1 FOR UPDATE");
                    $stockItem->execute([$order['product_id']]);
                    $item = $stockItem->fetch();

                    $deliveredContent = null;
                    if ($item) {
                        // Mark stock item as used
                        $pdo->prepare("UPDATE product_stock_items SET status = 'used', order_id = ?, used_at = NOW() WHERE id = ?")->execute([$order['id'], $item['id']]);
                        // Update product stock count
                        $pdo->prepare("UPDATE products SET stock = (SELECT COUNT(*) FROM product_stock_items WHERE product_id = ? AND status = 'available'), orders_count = orders_count + 1 WHERE id = ?")->execute([$order['product_id'], $order['product_id']]);
                        $deliveredContent = $item['content'];
                    } else {
                        // No stock items — use delivery_info as fallback
                        $pdo->prepare("UPDATE products SET orders_count = orders_count + 1 WHERE id = ?")->execute([$order['product_id']]);
                        $deliveredContent = $order['delivery_info'];
                    }

                    // Update order status and delivered_content
                    $pdo->prepare("UPDATE orders SET status = 'paid', delivered_content = ? WHERE id = ?")->execute([$deliveredContent, $order['id']]);
                    $pdo->commit();

                    // Notify seller of new sale
                    try {
                        $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'success')")
                            ->execute([$order['seller_id'], '🛒 Novo Pedido!', 'Você vendeu 1x produto #' . $order['product_id'] . ' por R$ ' . number_format($order['amount'], 2, ',', '.') . '.']);
                    } catch (Throwable $e) {}

                    // Auto-create chat room for buyer-seller communication
                    try {
                        $chatToken = bin2hex(random_bytes(16));
                        $pdo->prepare("INSERT INTO chat_rooms (order_id, product_id, seller_id, buyer_name, buyer_email, chat_token, last_message_at) VALUES (?, ?, ?, ?, ?, ?, NOW())")
                            ->execute([$order['id'], $order['product_id'], $order['seller_id'], $transaction['customer_name'] ?? $order['buyer_name'], null, $chatToken]);
                    } catch (Throwable $chatErr) {
                        write_log('WARNING', 'Chat room creation failed', ['order_id' => $order['id'], 'error' => $chatErr->getMessage()]);
                    }

                    write_log('INFO', 'Auto-Delivery Processado', ['order_id' => $order['id'], 'has_stock_item' => (bool)$item]);
                }
            } catch (Throwable $e) {
                if ($pdo->inTransaction()) $pdo->rollBack();
                write_log('ERROR', 'Auto-Delivery Falhou', ['error' => $e->getMessage()]);
            }
            // === END AUTO-DELIVERY ===
            
            // 3.5 Enviar Notificações
            $userData = getUser($transaction['user_id']);
            $notifMsg = 'Você recebeu R$ ' . number_format($transaction['amount_brl'], 2, ',', '.') . ' via Pix.';
            if (class_exists('PushService')) {
                try {
                    PushService::notifyUser($transaction['user_id'], '💰 Venda Confirmada!', $notifMsg, 'sale_paid');
                } catch (Throwable $e) {}
                
                // Notificar Admin (Push + In-App)
                try {
                    PushService::notifyAdmins('💰 Venda Confirmada #' . $transaction['id'], 'R$ ' . number_format($transaction['amount_brl'], 2, ',', '.') . ' — Lojista: ' . ($userData['full_name'] ?? 'N/A'), 'success');
                } catch (Throwable $e) {}
            }
            
            // Enviar e-mail para o usuário
            if ($userData && !empty($userData['email'])) {
                MailService::notifySale($userData['email'], $userData['full_name'], $transaction['amount_brl']);
            }

            // Buscar nome do produto/checkout
            $checkoutName = '';
            if (!empty($transaction['external_id'])) {
                $extId = $transaction['external_id'];
                if (strpos($extId, 'chk_') === 0) {
                    $parts = explode('_', $extId);
                    $chkId = (int)($parts[1] ?? 0);
                    if ($chkId > 0) {
                        $cStmt = $pdo->prepare("SELECT name FROM checkouts WHERE id = ?");
                        $cStmt->execute([$chkId]);
                        $checkoutName = (string)($cStmt->fetchColumn() ?: '');
                    }
                } elseif (strpos($extId, 'prod_') === 0) {
                    $parts = explode('_', $extId);
                    $prodId = (int)($parts[1] ?? 0);
                    if ($prodId > 0) {
                        $pStmt = $pdo->prepare("SELECT name FROM products WHERE id = ?");
                        $pStmt->execute([$prodId]);
                        $checkoutName = (string)($pStmt->fetchColumn() ?: '');
                    }
                }
            }

            // Notificar Admin via Telegram
            try {
                TelegramService::notifySale(
                    (float)$transaction['amount_brl'],
                    (float)$transaction['amount_net_brl'],
                    $realPayerName ?: ($transaction['customer_name'] ?? 'Sem nome'),
                    $userData['full_name'] ?? 'N/A',
                    (int)$transaction['id']
                );
            } catch (Throwable $e) {}

            // Notificar Usuário via Telegram User Bot (se vinculado)
            try {
                if (!empty($userData['telegram_chat_id'])) {
                    $tgMsg = TelegramService::getSaleCelebrationMsg(
                        (float)$transaction['amount_brl'],
                        (float)$transaction['amount_net_brl'],
                        $realPayerName ?: ($transaction['customer_name'] ?? 'N/A'),
                        (int)$transaction['id'],
                        $checkoutName
                    );
                    TelegramService::sendToUser($userData['telegram_chat_id'], $tgMsg);
                }
            } catch (Throwable $e) {}

            // Notificar Admin via WhatsApp
            try {
                if (class_exists('WhatsAppService')) {
                    WhatsAppService::notifySale(
                        (float)$transaction['amount_brl'],
                        (float)$transaction['amount_net_brl'],
                        $realPayerName ?: ($transaction['customer_name'] ?? 'Sem nome'),
                        $userData['full_name'] ?? 'N/A',
                        (int)$transaction['id']
                    );
                }
            } catch (Throwable $e) {}

            // Notificar Usuário via WhatsApp Bot (se cadastrado)
            try {
                if (class_exists('WhatsAppService') && WhatsAppService::isEnabled() && !empty($userData['whatsapp'])) {
                    WhatsAppService::notifySaleToUser(
                        $userData['whatsapp'],
                        (float)$transaction['amount_brl'],
                        (float)$transaction['amount_net_brl'],
                        $realPayerName ?: ($transaction['customer_name'] ?? 'N/A'),
                        (int)$transaction['id'],
                        $checkoutName
                    );
                }
            } catch (Throwable $e) {}

            // 4. Disparar Webhook Externo para o Lojista (callback_url da transação)
            $webhookPayload = [
                'event' => 'payment.completed',
                'transaction_id' => $transaction['id'],
                'pix_id' => $transaction['pix_id'],
                'amount' => (float)$transaction['amount_brl'],
                'amount_net' => (float)$transaction['amount_net_brl'],
                'customer_name' => $realPayerName ?: ($transaction['customer_name'] ?? ''),
                'status' => 'paid',
                'external_id' => $transaction['external_id'] ?? '',
                'seller_email' => $userData['email'] ?? '',
                'timestamp' => date('Y-m-d H:i:s')
            ];

            if (!empty($transaction['callback_url']) && is_safe_external_url($transaction['callback_url'])) {
                $ch = curl_init($transaction['callback_url']);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($webhookPayload));
                curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'User-Agent: GhostPix-Webhook/1.0', 'X-GhostPix-Event: payment.completed']);
                curl_setopt($ch, CURLOPT_TIMEOUT, 10);
                
                $out = curl_exec($ch);
                $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);

                write_log('INFO', 'Webhook Externo Disparado (callback_url)', [
                    'url' => $transaction['callback_url'],
                    'http_code' => $code,
                    'response' => $out
                ]);
            }

            // 5. Notificar UTMify (rastreamento de conversão)
            try {
                require_once __DIR__ . '/includes/UtmifyService.php';
                $utmTokenStmt = $pdo->prepare("SELECT utmify_api_token FROM users WHERE id = ? LIMIT 1");
                $utmTokenStmt->execute([$transaction['user_id']]);
                $utmToken = (string)($utmTokenStmt->fetchColumn() ?: '');

                // Token UTMify do ADMIN (recebe TODAS as vendas da plataforma)
                $adminUtmStmt = $pdo->query("SELECT utmify_api_token FROM users WHERE is_admin = 1 ORDER BY id ASC LIMIT 1");
                $adminUtmToken = (string)($adminUtmStmt->fetchColumn() ?: '');

                if (!empty($utmToken)) {
                    // Busca dados do produto se houver pedido vinculado
                    $utmProduct = [];
                    try {
                        $upStmt = $pdo->prepare("SELECT p.id, p.name FROM orders o JOIN products p ON p.id = o.product_id WHERE o.transaction_id = ? LIMIT 1");
                        $upStmt->execute([$transaction['id']]);
                        $upRow = $upStmt->fetch();
                        if ($upRow) $utmProduct = ['id' => $upRow['id'], 'name' => $upRow['name']];
                    } catch (\Throwable $e) {}

                    // Email do comprador (não do vendedor)
                    $buyerEmail = $pixData['payer']['email'] ?? ($pixData['customer_email'] ?? ($pixData['email'] ?? ''));
                    $utmCustomer = [
                        'name'  => $realPayerName ?: ($transaction['customer_name'] ?? ''),
                        'email' => (string)$buyerEmail,
                    ];
                    $utmResult = UtmifyService::notifySale($utmToken, $transaction, $utmProduct, $utmCustomer);
                    write_log($utmResult['success'] ? 'INFO' : 'WARNING', 'UTMify resultado', [
                        'transaction_id' => $transaction['id'],
                        'http_code'      => $utmResult['http_code'],
                        'response'       => substr($utmResult['response'] ?? '', 0, 400),
                        'error'          => $utmResult['error'] ?? null,
                    ]);
                }

                // Enviar para UTMify do ADMIN também (se configurado e diferente do vendedor)
                if (!empty($adminUtmToken) && $adminUtmToken !== $utmToken) {
                    UtmifyService::notifySale($adminUtmToken, $transaction, $utmProduct ?? [], $utmCustomer ?? [
                        'name'  => $realPayerName ?: ($transaction['customer_name'] ?? ''),
                        'email' => '',
                    ]);
                }
            } catch (\Throwable $e) {
                write_log('WARNING', 'UTMify notify falhou', ['error' => $e->getMessage()]);
            }

            // 6. Notificar bot 7K Community (DM automática ao vendedor)
            try {
                $sevenKSecret = defined('SEVEN_K_WEBHOOK_SECRET') ? SEVEN_K_WEBHOOK_SECRET : 'lunarpay_7kchat_webhook_2026';
                $sevenKUrl    = 'https://7kchat.site/api/webhook_lunarpay.php?token=' . urlencode($sevenKSecret);

                // Busca nome do produto vinculado à transação (se houver)
                $prodName = 'Produto LunarPay';
                try {
                    $prd = $pdo->prepare("SELECT p.name FROM orders o JOIN products p ON p.id = o.product_id WHERE o.transaction_id = ? LIMIT 1");
                    $prd->execute([$transaction['id']]);
                    $prdRow = $prd->fetch();
                    if ($prdRow) $prodName = $prdRow['name'];
                } catch (\Throwable $e) {}

                // Busca seven_k_id do vendedor para localização direta no bot
                $sevenKUserId = null;
                try {
                    $skStmt = $pdo->prepare("SELECT seven_k_id FROM users WHERE id = ? LIMIT 1");
                    $skStmt->execute([$transaction['user_id']]);
                    $skRow = $skStmt->fetch();
                    if ($skRow && !empty($skRow['seven_k_id'])) {
                        $sevenKUserId = (int)$skRow['seven_k_id'];
                    }
                } catch (\Throwable $e) {}

                $sevenKPayload = array_merge($webhookPayload, [
                    'product_name'   => $prodName,
                    'payment_method' => 'PIX',
                    'seller_id_7k'   => $sevenKUserId, // null se não cadastrado → bot busca por e-mail
                ]);

                $ch7k = curl_init($sevenKUrl);
                curl_setopt_array($ch7k, [
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_POST           => true,
                    CURLOPT_POSTFIELDS     => json_encode($sevenKPayload),
                    CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'User-Agent: LunarPay-Bot/1.0'],
                    CURLOPT_TIMEOUT        => 8,
                    CURLOPT_CONNECTTIMEOUT => 4,
                    CURLOPT_SSL_VERIFYPEER => true,
                ]);
                $out7k  = curl_exec($ch7k);
                $code7k = curl_getinfo($ch7k, CURLINFO_HTTP_CODE);
                curl_close($ch7k);
                write_log('INFO', '7K Bot Notificado', ['http_code' => $code7k, 'response' => $out7k]);
            } catch (\Throwable $e) {
                write_log('WARNING', '7K Bot Falhou', ['error' => $e->getMessage()]);
            }

            // 6. Disparar TODOS os webhooks configurados pelo usuário
            try {
                $whStmt = $pdo->prepare("SELECT id, url FROM user_webhooks WHERE user_id = ? AND active = 1");
                $whStmt->execute([$transaction['user_id']]);
                $userWebhooks = $whStmt->fetchAll();

                foreach ($userWebhooks as $wh) {
                    $ch = curl_init($wh['url']);
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_POST, true);
                    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($webhookPayload));
                    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'User-Agent: GhostPix-Webhook/1.0', 'X-GhostPix-Event: payment.completed']);
                    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
                    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);

                    $out = curl_exec($ch);
                    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                    curl_close($ch);

                    // Atualizar status do webhook
                    $pdo->prepare("UPDATE user_webhooks SET last_status = ?, last_triggered_at = NOW() WHERE id = ?")->execute([$code, $wh['id']]);

                    write_log('INFO', 'User Webhook Disparado', [
                        'webhook_id' => $wh['id'],
                        'url' => $wh['url'],
                        'http_code' => $code,
                        'user_id' => $transaction['user_id']
                    ]);
                }
            } catch (PDOException $e) {
                write_log('ERROR', 'Erro ao disparar user webhooks', ['error' => $e->getMessage()]);
            }
        } catch (Exception $e) {
            $pdo->rollBack();
            write_log('ERROR', 'Falha no processamento Webhook', ['error' => $e->getMessage(), 'pix_id' => $pixId]);
        }
        }
    }
}

// Retornar 200 para o gateway não reenviar o webhook
http_response_code(200);
Response::json(['status' => 'received']);
?>

