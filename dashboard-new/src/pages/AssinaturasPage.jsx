import React, { useState, useEffect } from 'react';
import {
  RefreshCw, Users, TrendingUp, XCircle, AlertCircle,
  ChevronDown, ChevronUp, Copy, Check, Loader2, QrCode,
  Calendar, DollarSign, Mail, User, X
} from 'lucide-react';

const INTERVAL_LABELS = { weekly: 'Semanal', monthly: 'Mensal', yearly: 'Anual' };
const STATUS_STYLE = {
  active:    'bg-green-500/15 text-green-400 border-green-500/20',
  pending:   'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/20',
  expired:   'bg-gray-100 text-gray-400 border-gray-200',
};
const STATUS_LABELS = { active: 'Ativa', pending: 'Aguardando', cancelled: 'Cancelada', expired: 'Expirada' };

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 flex items-start gap-4">
      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">{icon}</div>
      <div>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function BillModal({ sub, onClose, onBilled }) {
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const csrf = document.querySelector('meta[name="csrf-token"]')?.content || '';

  const bill = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/manage_subscriptions.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        body: JSON.stringify({ action: 'bill', id: sub.id }),
      });
      const data = await res.json();
      if (data.success) { setPixData(data); onBilled(); }
      else setError(data.error || 'Erro ao gerar cobrança.');
    } catch { setError('Erro de conexão.'); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-black text-gray-900">Cobrar Renovação</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          {!pixData ? (
            <>
              <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                <p className="font-bold text-sm text-gray-900">{sub.product_name}</p>
                <p className="text-xs text-gray-500">{sub.subscriber_name} — {sub.subscriber_email}</p>
                <p className="text-primary font-black">R$ {parseFloat(sub.billing_amount).toFixed(2).replace('.', ',')}</p>
              </div>
              {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</p>}
              <button onClick={bill} disabled={loading}
                className="w-full py-3 bg-primary text-white font-black rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={15} className="animate-spin" /> Gerando...</> : <><QrCode size={15} /> Gerar PIX de Renovação</>}
              </button>
            </>
          ) : (
            <div className="space-y-3 text-center">
              {pixData.qr_image && <img src={pixData.qr_image} alt="QR" className="w-40 h-40 mx-auto rounded-xl border border-gray-200" />}
              <p className="text-sm text-gray-500">Envie este QR Code ao assinante</p>
              {pixData.pix_code && (
                <button onClick={() => { navigator.clipboard.writeText(pixData.pix_code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${copied ? 'bg-green-500/20 text-green-400' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                  {copied ? <><Check size={13} /> Copiado!</> : <><Copy size={13} /> Copiar Código PIX</>}
                </button>
              )}
              <button onClick={onClose} className="w-full py-2.5 bg-gray-50 rounded-xl text-gray-500 text-sm hover:bg-gray-100 transition-all">Fechar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SubscriptionRow({ sub, onCancel, onBill }) {
  const [open, setOpen] = useState(false);
  const fmt = (v) => parseFloat(v).toFixed(2).replace('.', ',');

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden transition-all shadow-sm">
      <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-all" onClick={() => setOpen(o => !o)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-sm text-gray-900 truncate">{sub.subscriber_name}</p>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${STATUS_STYLE[sub.status]}`}>
              {STATUS_LABELS[sub.status]}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{sub.product_name} · {INTERVAL_LABELS[sub.subscription_interval] || 'Mensal'}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-primary font-black text-sm">R$ {fmt(sub.billing_amount)}</p>
          <p className="text-[10px] text-gray-400">{sub.payments_count || 0} pgtos</p>
        </div>
        {open ? <ChevronUp size={14} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />}
      </div>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 text-gray-500">
              <Mail size={12} /> <span className="truncate">{sub.subscriber_email || '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <User size={12} /> <span>Doc: {sub.subscriber_document || '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar size={12} /> <span>Criada: {new Date(sub.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            {sub.next_billing_at && (
              <div className="flex items-center gap-2 text-gray-500">
                <Calendar size={12} /> <span>Próx. cobrança: {new Date(sub.next_billing_at).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {sub.status === 'active' && (
              <button onClick={() => onBill(sub)}
                className="flex-1 py-2 text-xs font-black bg-primary text-white rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5">
                <QrCode size={12} /> Cobrar Renovação
              </button>
            )}
            {(sub.status === 'active' || sub.status === 'pending') && (
              <button onClick={() => onCancel(sub.id)}
                className="flex-1 py-2 text-xs font-black bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all flex items-center justify-center gap-1.5">
                <XCircle size={12} /> Cancelar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AssinaturasPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [billTarget, setBillTarget] = useState(null);
  const [filter, setFilter] = useState('all');
  const csrf = document.querySelector('meta[name="csrf-token"]')?.content || '';

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/manage_subscriptions.php?action=list');
      const data = await res.json();
      if (data.success) {
        setSubscriptions(data.subscriptions || []);
        setStats(data.stats || {});
      } else setError(data.error || 'Erro ao carregar.');
    } catch { setError('Erro de conexão.'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const cancelSub = async (id) => {
    if (!confirm('Cancelar esta assinatura?')) return;
    try {
      await fetch('/manage_subscriptions.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        body: JSON.stringify({ action: 'cancel', id }),
      });
      load();
    } catch {}
  };

  const filtered = filter === 'all' ? subscriptions : subscriptions.filter(s => s.status === filter);
  const mrr = parseFloat(stats?.mrr || 0).toFixed(2).replace('.', ',');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10 animate-in fade-in duration-500">

      {billTarget && (
        <BillModal sub={billTarget} onClose={() => setBillTarget(null)} onBilled={() => { setBillTarget(null); load(); }} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">
            Assinaturas <span className="text-primary italic">Recorrentes</span>
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Gerencie assinantes e cobranças recorrentes via PIX</p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-all">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Atualizar
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={<Users size={18} className="text-green-400" />} label="Ativas" value={stats.active_count ?? 0} />
          <StatCard icon={<AlertCircle size={18} className="text-yellow-400" />} label="Aguardando" value={stats.pending_count ?? 0} />
          <StatCard icon={<XCircle size={18} className="text-red-400" />} label="Canceladas" value={stats.cancelled_count ?? 0} />
          <StatCard icon={<DollarSign size={18} className="text-primary" />} label="Receita Mensal" value={`R$ ${mrr}`} sub="das assinaturas ativas" />
        </div>
      )}

      {/* Info box */}
      <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl text-xs text-blue-300/70 leading-relaxed">
        <strong className="text-blue-300">Como funciona:</strong> Quando um cliente assina um produto de tipo <em>Assinatura</em> na vitrine, uma cobrança PIX é gerada automaticamente. Após o pagamento confirmado, a assinatura fica ativa. Para renovar, clique em <strong>Cobrar Renovação</strong> — um novo QR Code será gerado para o cliente.
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" /> {error}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-50 border border-gray-100 p-1 rounded-xl w-fit">
        {[['all', 'Todas'], ['active', 'Ativas'], ['pending', 'Aguardando'], ['cancelled', 'Canceladas']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${filter === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto">
            <RefreshCw size={24} className="text-gray-300" />
          </div>
          <p className="text-gray-400 font-bold">
            {subscriptions.length === 0 ? 'Nenhuma assinatura ainda.' : 'Nenhuma assinatura neste filtro.'}
          </p>
          {subscriptions.length === 0 && (
            <p className="text-gray-300 text-xs">Crie um produto do tipo <strong className="text-gray-500">Assinatura</strong> e compartilhe o link da vitrine.</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(sub => (
            <SubscriptionRow key={sub.id} sub={sub} onCancel={cancelSub} onBill={setBillTarget} />
          ))}
        </div>
      )}
    </div>
  );
}
