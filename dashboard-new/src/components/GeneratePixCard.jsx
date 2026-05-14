import React, { useState } from 'react';
import { QrCode, Bolt, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GeneratePixCard({ onGenerate, disabled = false }) {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        const val = amount.toString().replace(',', '.');
        if (!val || parseFloat(val) < 1) {
            alert('Valor mínimo: R$ 1,00');
            return;
        }

        setLoading(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch('/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken || ''
                },
                body: JSON.stringify({ amount: val })
            });

            const data = await response.json();
            console.log('API Response:', JSON.stringify(data));

            if (data.error) {
                alert('Erro: ' + (data.message || data.error));
            } else if (data.success || data.pix_id) {
                // Dados podem estar no nível raiz ou dentro de data.data
                const pixInfo = data.data || data;
                const pixResult = {
                    id: pixInfo.pix_id || pixInfo.payment_id || '',
                    amount: pixInfo.amount || val,
                    code: pixInfo.pix_code || pixInfo.qr_code || pixInfo.payload || '',
                    image: pixInfo.qr_image || pixInfo.qr_image_url || pixInfo.qr_code_url || ''
                };
                console.log('Pix Result para Modal:', JSON.stringify(pixResult));
                if (pixResult.id) {
                    onGenerate(pixResult);
                } else {
                    console.warn('PIX gerado mas sem ID:', data);
                    alert('PIX gerado mas houve um problema ao exibir. Verifique suas vendas.');
                }
            } else {
                alert('Resposta inesperada da API. Verifique o console.');
                console.error('Resposta inesperada:', data);
            }
        } catch (err) {
            console.error('Fetch Error:', err);
            alert('Falha ao gerar Pix. Verifique sua conexão.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-purple-100 shadow-[0_4px_24px_rgba(124,58,237,0.1)] p-6 rounded-2xl relative overflow-hidden"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <QrCode size={20} />
                </div>
                <h3 className="font-bold text-gray-900">Gerar Cobrança Pix</h3>
            </div>

            <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">R$</span>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0,00"
                    step="0.01"
                    min="1"
                    disabled={disabled || loading}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-12 pr-4 text-gray-900 font-bold text-2xl focus:outline-none focus:border-primary/50 focus:bg-white transition-all placeholder:text-gray-200"
                />
            </div>

            <p className="text-gray-400 text-xs mb-6 px-1">Valor mínimo sugerido: R$ 1,00</p>

            <button
                onClick={handleGenerate}
                disabled={disabled || loading || !amount}
                className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-[0_8px_24px_rgba(124,58,237,0.3)]"
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                    <>
                        <Bolt size={18} fill="currentColor" />
                        Gerar Agora
                    </>
                )}
            </button>

            <div className="mt-6 space-y-2 border-t border-gray-100 pt-6">
                <div className="flex items-center gap-2 text-gray-400 text-xs justify-center">
                    <CheckCircle size={14} className="text-primary/50" />
                    <span>Confirmado pelo Banco Central</span>
                </div>
                <p className="text-gray-400 text-[10px] text-center">Crédito imediato após confirmação do pagamento.</p>
            </div>
        </motion.div>
    );
}
