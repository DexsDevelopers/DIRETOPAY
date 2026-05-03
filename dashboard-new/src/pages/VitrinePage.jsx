import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Sparkles, Star, ShoppingCart, RefreshCw, Search, Filter, Package, TrendingUp, Award, ChevronDown, X, ExternalLink, Check, Copy, Link, CreditCard, QrCode, Shield } from 'lucide-react';

const CATEGORIES = ['Todos', 'Digital', 'Físico', 'Serviço', 'Curso', 'Software', 'Template', 'E-book', 'Outro'];
const SORTS = [
  { value: 'popular', label: 'Mais Vendidos' },
  { value: 'recent', label: 'Mais Recentes' },
  { value: 'rating', label: 'Melhor Avaliados' },
  { value: 'price_asc', label: 'Menor Preço' },
  { value: 'price_desc', label: 'Maior Preço' },
];

function StarRating({ rating, count }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(i => (
          <Star key={i} size={11} className={i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
        ))}
      </div>
      <span className="text-[11px] text-gray-400">{count ? `(${count})` : ''}</span>
    </div>
  );
}

function ProductCard({ product, onBuy, onResell }) {
  const [showActions, setShowActions] = useState(false);
  const price = parseFloat(product.price).toFixed(2).replace('.', ',');

  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-300 group flex flex-col">
      <RouterLink to={`/vitrine/produto/${product.id}`} className="block">
        <div className="relative overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" onError={e => { e.target.parentElement.classList.add('hidden'); }} />
          ) : (
            <div className="w-full h-44 bg-gray-50 flex items-center justify-center">
              <Package size={36} className="text-gray-200" />
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            <span className="text-[10px] font-black px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white uppercase tracking-wide">{product.category}</span>
            {product.type === 'digital' && <span className="text-[10px] font-black px-2 py-1 rounded-full bg-primary/20 backdrop-blur-sm text-primary uppercase tracking-wide">Digital</span>}
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <div className="flex-1">
            <p className="font-bold text-sm mb-1 line-clamp-2 leading-snug text-gray-900">{product.name}</p>
            <p className="text-xs text-gray-400 mb-2 truncate">por <span className="text-gray-600">{product.seller_name}</span></p>
            {product.description && <p className="text-xs text-gray-400 line-clamp-2 mb-3">{product.description}</p>}
            <StarRating rating={product.avg_rating || 0} count={product.review_count || 0} />
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <p className="text-xl font-black text-primary">R$ {price}</p>
              {product.orders_count > 0 && (
                <span className="text-[10px] text-gray-400 flex items-center gap-1"><ShoppingCart size={10} />{product.orders_count} vendas</span>
              )}
            </div>
          </div>
        </div>
      </RouterLink>

      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={(e) => { e.preventDefault(); onBuy(product); }}
          className="flex-1 py-2.5 bg-primary text-white font-black text-xs rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5"
        >
          <ShoppingCart size={13} /> Comprar
        </button>
        <button
          onClick={(e) => { e.preventDefault(); onResell(product); }}
          title="Revender este produto"
          className="px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-all"
        >
          <RefreshCw size={13} />
        </button>
      </div>
    </div>
  );
}

function BuyModal({ product, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [doc, setDoc] = useState('');
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [couponCode, setCouponCode] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponInfo, setCouponInfo] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const [copied, setCopied] = useState(false);
  const deliveryUrl = pixData?.delivery_token ? `${window.location.origin}/entrega/${pixData.delivery_token}` : null;

  const copyDelivery = () => {
    if (deliveryUrl) {
      navigator.clipboard.writeText(deliveryUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true); setCouponError(''); setCouponInfo(null);
    try {
      const res = await fetch('/validate_coupon.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, product_id: product.id, amount: parseFloat(product.price) }),
      });
      const data = await res.json();
      if (data.valid) { setCouponInfo(data); setCouponCode(code); setCouponError(''); }
      else setCouponError(data.error || 'Cupom inválido');
    } catch { setCouponError('Erro ao validar cupom.'); }
    setCouponLoading(false);
  };

  const removeCoupon = () => { setCouponInfo(null); setCouponCode(''); setCouponInput(''); setCouponError(''); };

  const finalPrice = couponInfo ? couponInfo.final_amount : parseFloat(product.price);

  const handleCheckout = async () => {
    if (!name.trim()) { setError('Informe seu nome.'); return; }
    setLoading(true); setError('');
    try {
      if (paymentMethod === 'card') {
        const res = await fetch('/buy_product_card.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: product.id, customer_name: name, customer_document: doc, coupon_code: couponCode }),
        });
        const data = await res.json();
        if (data.success && data.checkout_url) {
          window.open(data.checkout_url, '_blank');
          onClose();
        } else {
          setError(data.message || 'Erro ao gerar link de cartão.');
        }
      } else {
        const res = await fetch('/buy_product.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: product.id, customer_name: name, customer_document: doc, coupon_code: couponCode }),
        });
        const data = await res.json();
        if (data.success) { setPixData(data); setStep(2); }
        else setError(data.message || 'Erro ao gerar pagamento.');
      }
    } catch { setError('Erro de conexão.'); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white border border-gray-200 shadow-xl rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-black text-gray-900">{step === 1 ? 'Finalizar Compra' : paymentMethod === 'card' ? 'Pagar com Cartão' : 'Pagar com PIX'}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all"><X size={16} /></button>
        </div>

        {step === 1 ? (
          <div className="p-5 space-y-4">
            <div className="flex gap-3 p-3 bg-gray-50 rounded-xl">
              {product.image_url && <img src={product.image_url} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900">{product.name}</p>
                <div className="flex items-center gap-2">
                  {couponInfo ? (
                    <>
                      <span className="text-gray-400 line-through text-xs">R$ {parseFloat(product.price).toFixed(2).replace('.', ',')}</span>
                      <span className="text-primary font-black">R$ {finalPrice.toFixed(2).replace('.', ',')}</span>
                      <span className="text-xs bg-green-500/15 text-green-400 border border-green-500/20 rounded-full px-2 py-0.5 font-bold">{couponInfo.label}</span>
                    </>
                  ) : (
                    <p className="text-primary font-black">R$ {parseFloat(product.price).toFixed(2).replace('.', ',')}</p>
                  )}
                </div>
              </div>
            </div>
            {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</p>}

            {/* Payment method selector */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Forma de Pagamento</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm transition-all ${
                    paymentMethod === 'pix'
                      ? 'bg-primary/15 border-primary/40 text-primary'
                      : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <QrCode size={15} /> PIX
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-blue-500/15 border-blue-500/40 text-blue-500'
                      : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <CreditCard size={15} /> Cartão
                </button>
              </div>
            </div>

            {/* Coupon field */}
            {!couponInfo ? (
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Cupom de Desconto</label>
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), applyCoupon())}
                    placeholder="Código do cupom (opcional)"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-primary/40 font-mono uppercase"
                  />
                  <button type="button" onClick={applyCoupon} disabled={couponLoading || !couponInput.trim()}
                    className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-all disabled:opacity-40 flex-shrink-0">
                    {couponLoading ? '...' : 'Aplicar'}
                  </button>
                </div>
                {couponError && <p className="text-red-400 text-xs mt-1.5">{couponError}</p>}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                <Check size={14} className="text-green-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-green-400">Cupom aplicado: <span className="font-mono">{couponInfo.code}</span></p>
                  <p className="text-xs text-green-300/60">Economia de R$ {couponInfo.discount_amount.toFixed(2).replace('.', ',')}</p>
                </div>
                <button onClick={removeCoupon} className="p-1 text-gray-400 hover:text-gray-700 transition-colors"><X size={13} /></button>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Seu Nome *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome completo" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-primary/40" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">CPF (opcional)</label>
              <input value={doc} onChange={e => setDoc(e.target.value)} placeholder="000.000.000-00" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-primary/40" />
            </div>
            <button onClick={handleCheckout} disabled={loading} className={`w-full py-3 font-black rounded-xl transition-all disabled:opacity-50 ${
              paymentMethod === 'card'
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-primary text-white hover:bg-primary/90'
            }`}>
              {loading
                ? (paymentMethod === 'card' ? 'Gerando link...' : 'Gerando PIX...')
                : paymentMethod === 'card'
                  ? `Pagar com Cartão — R$ ${finalPrice.toFixed(2).replace('.', ',')}`
                  : `Gerar PIX — R$ ${finalPrice.toFixed(2).replace('.', ',')}`
              }
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-4 text-center">
            {pixData?.qr_image && <img src={pixData.qr_image} alt="QR Code" className="w-48 h-48 mx-auto rounded-xl border border-gray-200" />}
            <p className="text-sm text-gray-500">Escaneie o QR Code ou copie o código PIX</p>
            {pixData?.pix_code && (
              <button onClick={() => navigator.clipboard.writeText(pixData.pix_code)} className="w-full py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-600 hover:bg-gray-100 transition-all truncate px-4">
                {pixData.pix_code.substring(0, 40)}... (clique para copiar)
              </button>
            )}
            {/* Delivery link */}
          {deliveryUrl && (
            <div className="space-y-2">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Seu link de entrega</p>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono text-gray-500 truncate">{deliveryUrl}</div>
                <button onClick={copyDelivery} className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${copied ? 'bg-green-500/20 text-green-400' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {copied ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
                </button>
              </div>
              <p className="text-[11px] text-gray-400">Salve este link — após o pagamento você verá seu produto aqui.</p>
            </div>
          )}

            <div className="flex items-center gap-2 justify-center p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
              <Check size={14} className="text-green-400" />
              <p className="text-xs text-green-400 font-semibold">Pagamento confirmado automaticamente após o PIX</p>
            </div>

            {deliveryUrl && (
              <a href={deliveryUrl} target="_blank" rel="noopener noreferrer"
                className="w-full py-3 bg-primary text-white font-black rounded-xl hover:bg-primary/90 transition-all text-sm flex items-center justify-center gap-2"
              >
                <ExternalLink size={14} /> Ir para página de entrega
              </a>
            )}
            <button onClick={onClose} className="w-full py-3 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 transition-all text-sm font-semibold">Fechar</button>
          </div>
        )}
      </div>
    </div>
  );
}

function ResellModal({ product, onClose }) {
  const [copied, setCopied] = useState(false);
  const resellUrl = `${window.location.origin}/p/revenda-${product.id}`;

  const copy = () => {
    navigator.clipboard.writeText(resellUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white border border-gray-200 shadow-xl rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-black flex items-center gap-2 text-gray-900"><RefreshCw size={16} className="text-primary" />Revender Produto</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
            <p className="text-sm font-bold mb-1 text-gray-900">{product.name}</p>
            <p className="text-xs text-gray-500">Compartilhe este link e ganhe comissão em cada venda</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Seu Link de Revenda</label>
            <div className="flex gap-2">
              <input value={resellUrl} readOnly className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-600 focus:outline-none" />
              <button onClick={copy} className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${copied ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'}`}>
                {copied ? <Check size={14} /> : 'Copiar'}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center">A comissão de revenda é definida pelo vendedor original</p>
        </div>
      </div>
    </div>
  );
}

export default function VitrinePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [sort, setSort] = useState('popular');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [buyModal, setBuyModal] = useState(null);
  const [resellModal, setResellModal] = useState(null);

  const fetchVitrine = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, category: category === 'Todos' ? '' : category, sort, page });
      const res = await fetch(`/vitrine.php?${params}`);
      const data = await res.json();
      if (data.success) { setProducts(data.products || []); setTotal(data.total || 0); }
    } catch {}
    setLoading(false);
  }, [search, category, sort, page]);

  useEffect(() => { fetchVitrine(); }, [fetchVitrine]);

  const perPage = 12;
  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {buyModal && <BuyModal product={buyModal} onClose={() => setBuyModal(null)} onSuccess={() => { setBuyModal(null); }} />}
      {resellModal && <ResellModal product={resellModal} onClose={() => setResellModal(null)} />}

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 rounded-2xl p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Sparkles size={18} />
            <span className="text-xs font-black uppercase tracking-widest">Vitrine PixGhost</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Explore & <span className="text-primary italic">Compre</span></h1>
          <p className="text-gray-500 max-w-lg">Descubra produtos exclusivos de vendedores verificados. Compre, revenda e acompanhe suas entregas.</p>
          <div className="flex gap-4 mt-4">
            <div className="text-center"><p className="text-lg font-black text-primary">{total}</p><p className="text-xs text-gray-400">Produtos</p></div>
          </div>
        </div>
      </div>

      {/* ── Segurança da Plataforma ── */}
      <div className="flex items-start gap-4 rounded-2xl px-5 py-5 bg-green-500/[0.08] border border-green-500/25">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-green-500/15">
          <Shield size={20} className="text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-green-400 mb-1">🛡️ Compra Protegida pela Plataforma</p>
          <p className="text-[13px] text-gray-700 leading-relaxed">
            <strong className="text-gray-900">Todos os produtos possuem segurança Ghost Pix.</strong>{' '}
            O pagamento ao vendedor só é liberado após a confirmação de entrega do produto. Compre com tranquilidade e segurança total.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar produtos, categorias, vendedores..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary/30"
          />
        </div>
        <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-primary/30">
          {SORTS.map(s => <option key={s.value} value={s.value} className="bg-white text-gray-900">{s.label}</option>)}
        </select>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => { setCategory(c); setPage(1); }}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${category === c ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Results count */}
      {!loading && <p className="text-xs text-gray-400 font-semibold">{total} produto{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}</p>}

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-100 border border-gray-200 rounded-2xl h-72 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center"><Sparkles size={28} className="text-gray-300" /></div>
          <div>
            <p className="font-bold text-gray-500">Nenhum produto encontrado</p>
            <p className="text-sm text-gray-400 mt-1">Tente outros filtros ou termos de busca</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => (
            <ProductCard key={p.id} product={p} onBuy={setBuyModal} onResell={setResellModal} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-30 text-sm font-semibold transition-all">Anterior</button>
          <span className="px-4 py-2 text-sm text-gray-400 font-semibold">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-30 text-sm font-semibold transition-all">Próximo</button>
        </div>
      )}
    </div>
  );
}
