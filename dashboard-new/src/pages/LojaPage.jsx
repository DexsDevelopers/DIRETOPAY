import React, { useState, useEffect } from 'react';
import { Store, Package, ShoppingBag, Star, TrendingUp, ExternalLink, Pencil, Check, X, Sparkles, BarChart3, Users } from 'lucide-react';

export default function LojaPage() {
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchStore = async () => {
    setLoading(true);
    try {
      const res = await fetch('/get_products.php?view=store');
      const data = await res.json();
      if (data.success) setStoreData(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchStore(); }, []);

  const handleSaveField = async (field) => {
    setSaving(true);
    try {
      const res = await fetch('/manage_product.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content || '' },
        body: JSON.stringify({ action: 'update_store', field, value: editValue }),
      });
      const data = await res.json();
      if (data.success) { fetchStore(); setEditingField(null); }
    } catch {}
    setSaving(false);
  };

  const startEdit = (field, value) => { setEditingField(field); setEditValue(value || ''); };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <div className="text-center"><Store size={32} className="mx-auto mb-3 opacity-30 animate-pulse" /><p>Carregando sua loja...</p></div>
    </div>
  );

  const stats = storeData?.stats || {};
  const products = storeData?.products || [];
  const store = storeData?.store || {};

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Minha <span className="text-primary italic">Loja</span></h1>
          <p className="text-gray-500 text-sm mt-1">Visão geral da sua loja na plataforma</p>
        </div>
        {store.slug && (
          <a href={`/loja/${store.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-900 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-all">
            <ExternalLink size={14} /> Ver Loja
          </a>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Produtos Ativos', value: stats.active_products || 0, icon: <Package size={18} />, color: 'text-primary' },
          { label: 'Pedidos Total', value: stats.total_orders || 0, icon: <ShoppingBag size={18} />, color: 'text-blue-400' },
          { label: 'Avaliação Média', value: stats.avg_rating ? `${parseFloat(stats.avg_rating).toFixed(1)}★` : '—', icon: <Star size={18} />, color: 'text-yellow-400' },
          { label: 'Receita Total', value: stats.total_revenue ? `R$ ${parseFloat(stats.total_revenue).toFixed(2).replace('.', ',')}` : 'R$ 0,00', icon: <TrendingUp size={18} />, color: 'text-green-400' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
            <div className={`${s.color} mb-3`}>{s.icon}</div>
            <p className="text-2xl font-black text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Store Info */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 space-y-5">
          <h2 className="font-black text-base flex items-center gap-2 text-gray-900"><Store size={16} className="text-primary" />Informações da Loja</h2>

          {[
            { field: 'store_name', label: 'Nome da Loja', value: store.store_name || '', placeholder: 'Minha Loja Digital' },
            { field: 'store_description', label: 'Descrição', value: store.store_description || '', placeholder: 'Descrição da sua loja...', textarea: true },
            { field: 'store_banner', label: 'URL do Banner', value: store.store_banner || '', placeholder: 'https://...' },
          ].map(({ field, label, value, placeholder, textarea }) => (
            <div key={field}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</label>
                {editingField !== field && (
                  <button onClick={() => startEdit(field, value)} className="p-1 rounded text-gray-400 hover:text-gray-700 transition-colors"><Pencil size={12} /></button>
                )}
              </div>
              {editingField === field ? (
                <div className="flex gap-2">
                  {textarea ? (
                    <textarea rows={3} value={editValue} onChange={e => setEditValue(e.target.value)} placeholder={placeholder} className="flex-1 bg-gray-50 border border-primary/30 rounded-xl px-3 py-2 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none resize-none" />
                  ) : (
                    <input value={editValue} onChange={e => setEditValue(e.target.value)} placeholder={placeholder} className="flex-1 bg-gray-50 border border-primary/30 rounded-xl px-3 py-2 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none" />
                  )}
                  <div className="flex flex-col gap-1">
                    <button onClick={() => handleSaveField(field)} disabled={saving} className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-all"><Check size={14} /></button>
                    <button onClick={() => setEditingField(null)} className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all"><X size={14} /></button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 min-h-[38px]">{value || <span className="text-gray-300 italic">{placeholder}</span>}</p>
              )}
            </div>
          ))}
        </div>

        {/* Top Products */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="font-black text-base mb-5 flex items-center gap-2 text-gray-900"><BarChart3 size={16} className="text-primary" />Produtos em Destaque</h2>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-center">
              <Package size={28} className="text-gray-200" />
              <p className="text-sm text-gray-400">Nenhum produto cadastrado ainda</p>
              <a href="/vendedor/produtos" className="text-xs text-primary hover:underline font-semibold">Criar produtos →</a>
            </div>
          ) : (
            <div className="space-y-3">
              {products.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover" onError={e => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center"><Package size={16} className="text-gray-300" /></div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-primary">R$ {parseFloat(p.price).toFixed(2).replace('.', ',')}</p>
                    {p.vitrine ? <span className="text-[10px] text-primary/60 flex items-center gap-0.5 justify-end"><Sparkles size={9} />Vitrine</span> : null}
                  </div>
                </div>
              ))}
              {products.length > 5 && (
                <a href="/vendedor/produtos" className="block text-center text-xs text-gray-400 hover:text-primary transition-colors pt-2 font-semibold">Ver todos os {products.length} produtos →</a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Vitrine CTA */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
            <Sparkles size={22} className="text-primary" />
          </div>
          <div>
            <p className="font-black text-base">Vitrine PixGhost</p>
            <p className="text-sm text-gray-500">Ative seus produtos na vitrine global e alcance mais compradores</p>
          </div>
        </div>
        <a href="/vitrine" className="flex-shrink-0 px-5 py-2.5 bg-primary text-white font-black rounded-xl hover:bg-primary/90 transition-all text-sm">
          Explorar Vitrine
        </a>
      </div>
    </div>
  );
}
