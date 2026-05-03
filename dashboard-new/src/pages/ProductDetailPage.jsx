import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, ArrowLeft, Package, Store, Calendar, Tag, Shield, MessageSquare, Send, Loader2, X, Check, Copy, ExternalLink, CreditCard, QrCode, RefreshCw } from 'lucide-react';

function StarRating({ rating, count, size = 14 }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(i => (
          <Star key={i} size={size} className={i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
        ))}
      </div>
      {count !== undefined && <span className="text-xs text-gray-400">({count})</span>}
    </div>
  );
}

function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className="transition-transform hover:scale-110"
        >
          <Star size={24} className={i <= (hover || value) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
        </button>
      ))}
    </div>
  );
}

const INTERVAL_LABELS = { weekly: 'semana', monthly: 'mês', yearly: 'ano' };

function BuyModal({ product, variants = [], onClose }) {
  const isSubscription = product.type === 'subscription';
  const hasVariants = variants.length > 0;

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [doc, setDoc] = useState('');
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [couponInput, setCouponInput] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponInfo, setCouponInfo] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(hasVariants ? null : undefined);

  const deliveryUrl = pixData?.delivery_token ? `${window.location.origin}/entrega/${pixData.delivery_token}` : null;
  const basePrice = selectedVariant ? parseFloat(selectedVariant.price) : parseFloat(product.price);
  const finalPrice = couponInfo ? couponInfo.final_amount : basePrice;

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true); setCouponError(''); setCouponInfo(null);
    try {
      const res = await fetch('/validate_coupon.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, product_id: product.id, amount: basePrice }),
      });
      const data = await res.json();
      if (data.valid) { setCouponInfo(data); setCouponCode(code); }
      else setCouponError(data.error || 'Cupom inválido');
    } catch { setCouponError('Erro ao validar cupom.'); }
    setCouponLoading(false);
  };

  const removeCoupon = () => { setCouponInfo(null); setCouponCode(''); setCouponInput(''); setCouponError(''); };

  const handleCheckout = async () => {
    if (!name.trim()) { setError('Informe seu nome.'); return; }
    if (isSubscription && !email.trim()) { setError('Informe seu e-mail para a assinatura.'); return; }
    if (hasVariants && !selectedVariant) { setError('Selecione uma opção do produto.'); return; }
    setLoading(true); setError('');
    try {
      if (isSubscription) {
        const res = await fetch('/subscribe.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: product.id, customer_name: name, customer_email: email, customer_document: doc, variant_id: selectedVariant?.id }),
        });
        const data = await res.json();
        if (data.success) { setPixData(data); setStep(2); }
        else setError(data.message || 'Erro ao criar assinatura.');
      } else if (paymentMethod === 'card') {
        const res = await fetch('/buy_product_card.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: product.id, customer_name: name, customer_document: doc, coupon_code: couponCode, variant_id: selectedVariant?.id }),
        });
        const data = await res.json();
        if (data.success && data.checkout_url) { window.open(data.checkout_url, '_blank'); onClose(); }
        else setError(data.message || 'Erro ao gerar link de cartão.');
      } else {
        const res = await fetch('/buy_product.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: product.id, customer_name: name, customer_document: doc, coupon_code: couponCode, variant_id: selectedVariant?.id }),
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
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-black text-gray-900">{step === 1 ? (isSubscription ? 'Assinar Plano' : 'Finalizar Compra') : 'Pagar com PIX'}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all"><X size={16} /></button>
        </div>

        {step === 1 ? (
          <div className="p-5 space-y-4">
            {/* Product/plan summary */}
            <div className="flex gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
              {product.image_url && <img src={product.image_url} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{product.name}</p>
                <div className="flex items-center gap-2">
                  {couponInfo ? (
                    <>
                      <span className="text-gray-400 line-through text-xs">R$ {basePrice.toFixed(2).replace('.', ',')}</span>
                      <span className="text-primary font-black">R$ {finalPrice.toFixed(2).replace('.', ',')}</span>
                    </>
                  ) : (
                    <p className="text-primary font-black">
                      R$ {basePrice.toFixed(2).replace('.', ',')}
                      {isSubscription && <span className="text-gray-400 text-xs font-normal">/{INTERVAL_LABELS[product.subscription_interval] || 'mês'}</span>}
                    </p>
                  )}
                  {selectedVariant && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{selectedVariant.name}</span>}
                </div>
              </div>
            </div>

            {/* Variant selector */}
            {hasVariants && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Selecione uma Opção *</label>
                <div className="grid grid-cols-1 gap-2">
                  {variants.map(v => (
                    <button key={v.id} type="button" onClick={() => { setSelectedVariant(v); setCouponInfo(null); }}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border font-bold text-sm transition-all text-left ${selectedVariant?.id === v.id ? 'bg-primary/15 border-primary/40 text-gray-900' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                      <span>{v.name}{v.description && <span className="text-gray-400 text-xs font-normal block">{v.description}</span>}</span>
                      <span className="text-primary font-black ml-4">R$ {parseFloat(v.price).toFixed(2).replace('.', ',')}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</p>}

            {/* Payment method — not shown for subscriptions */}
            {!isSubscription && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Forma de Pagamento</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setPaymentMethod('pix')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm transition-all ${paymentMethod === 'pix' ? 'bg-primary/15 border-primary/40 text-primary' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
                  <QrCode size={15} /> PIX
                </button>
                <button type="button" onClick={() => setPaymentMethod('card')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm transition-all ${paymentMethod === 'card' ? 'bg-blue-500/15 border-blue-500/40 text-blue-500' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
                  <CreditCard size={15} /> Cartão
                </button>
              </div>
            </div>
            )}

            {/* Coupon — not shown for subscriptions */}
            {!isSubscription && (!couponInfo ? (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Cupom de Desconto</label>
                <div className="flex gap-2">
                  <input value={couponInput} onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), applyCoupon())}
                    placeholder="Código do cupão (opcional)"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary/40 font-mono uppercase" />
                  <button type="button" onClick={applyCoupon} disabled={couponLoading || !couponInput.trim()}
                    className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-200 transition-all disabled:opacity-40">
                    {couponLoading ? '...' : 'Aplicar'}
                  </button>
                </div>
                {couponError && <p className="text-red-400 text-xs mt-1.5">{couponError}</p>}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                <Check size={14} className="text-green-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-green-400">Cupom: <span className="font-mono">{couponInfo.code}</span></p>
                  <p className="text-xs text-green-300/60">-R$ {couponInfo.discount_amount.toFixed(2).replace('.', ',')}</p>
                </div>
                <button onClick={removeCoupon} className="p-1 text-gray-400 hover:text-gray-700"><X size={13} /></button>
              </div>
            )
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Seu Nome *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome completo"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary/40" />
            </div>
            {isSubscription && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">E-mail *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary/40" />
              <p className="text-[10px] text-gray-400 mt-1.5">Usado para enviar cobranças de renovação</p>
            </div>
            )}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">CPF (opcional)</label>
              <input value={doc} onChange={e => setDoc(e.target.value)} placeholder="000.000.000-00"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary/40" />
            </div>
            <button onClick={handleCheckout} disabled={loading}
              className={`w-full py-3 font-black rounded-xl transition-all disabled:opacity-50 ${paymentMethod === 'card' && !isSubscription ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-primary text-white hover:bg-primary/90'}`}>
              {loading ? 'Processando...' : isSubscription ? `Assinar — R$ ${finalPrice.toFixed(2).replace('.', ',')}/${INTERVAL_LABELS[product.subscription_interval] || 'mês'}` : `Pagar R$ ${finalPrice.toFixed(2).replace('.', ',')}`}
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-4 text-center">
            {isSubscription && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300 font-semibold">
                🔄 Após o pagamento sua assinatura será ativada automaticamente
              </div>
            )}
            {pixData?.qr_image && <img src={pixData.qr_image} alt="QR Code" className="w-48 h-48 mx-auto rounded-xl border border-gray-200" />}
            <p className="text-sm text-gray-500">Escaneie o QR Code ou copie o código PIX</p>
            {pixData?.pix_code && (
              <button onClick={() => navigator.clipboard.writeText(pixData.pix_code)}
                className="w-full py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-600 hover:bg-gray-100 transition-all truncate px-4">
                {pixData.pix_code.substring(0, 40)}... (clique para copiar)
              </button>
            )}
            {deliveryUrl && (
              <div className="space-y-2">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Seu link de entrega</p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono text-gray-500 truncate">{deliveryUrl}</div>
                  <button onClick={() => { navigator.clipboard.writeText(deliveryUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${copied ? 'bg-green-500/20 text-green-400' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {copied ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
                  </button>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 justify-center p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
              <Check size={14} className="text-green-400" />
              <p className="text-xs text-green-400 font-semibold">Pagamento confirmado automaticamente</p>
            </div>
            <button onClick={onClose} className="w-full py-3 bg-gray-100 rounded-xl text-gray-500 hover:bg-gray-200 transition-all text-sm font-semibold">Fechar</button>
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewCard({ review }) {
  const date = new Date(review.created_at);
  const timeAgo = getTimeAgo(date);

  return (
    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
            {(review.user_name || review.buyer_name || 'A').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{review.user_name || review.buyer_name || 'Anônimo'}</p>
            <p className="text-[10px] text-gray-400">{timeAgo}</p>
          </div>
        </div>
        <StarRating rating={review.rating} size={12} />
      </div>
      {review.comment && <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>}
    </div>
  );
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'agora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d atrás`;
  return date.toLocaleDateString('pt-BR');
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [buyModal, setBuyModal] = useState(false);

  // Review form
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/get_product.php?id=${id}`);
      const data = await res.json();
      if (data.success) {
        setProduct(data.product);
        setVariants(data.variants || []);
        setReviews(data.reviews || []);
        setRelated(data.related || []);
        setCanReview(data.can_review);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const submitReview = async () => {
    if (reviewRating < 1) { setReviewResult({ error: 'Selecione uma nota' }); return; }
    setReviewLoading(true); setReviewResult(null);
    try {
      const res = await fetch('/submit_review.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: parseInt(id), rating: reviewRating, comment: reviewComment }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews(prev => [data.review, ...prev]);
        setCanReview(false);
        setReviewRating(0);
        setReviewComment('');
        setReviewResult({ success: data.message });
        if (product) {
          setProduct(p => ({ ...p, avg_rating: data.avg_rating, review_count: data.review_count }));
        }
      } else {
        setReviewResult({ error: data.error });
      }
    } catch { setReviewResult({ error: 'Erro de conexão' }); }
    setReviewLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="h-8 w-32 bg-gray-100 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-4 w-1/2 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-5xl mx-auto text-center py-24 space-y-4">
        <Package size={48} className="text-gray-300 mx-auto" />
        <p className="text-xl font-bold text-gray-500">Produto não encontrado</p>
        <Link to="/vitrine" className="text-primary font-bold text-sm hover:underline">Voltar à vitrine</Link>
      </div>
    );
  }

  const price = parseFloat(product.price).toFixed(2).replace('.', ',');

  // Rating distribution
  const ratingDist = [5,4,3,2,1].map(r => ({
    stars: r,
    count: reviews.filter(rv => rv.rating === r).length,
    pct: reviews.length ? Math.round((reviews.filter(rv => rv.rating === r).length / reviews.length) * 100) : 0,
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {buyModal && <BuyModal product={product} variants={variants} onClose={() => setBuyModal(false)} />}

      {/* Back */}
      <button onClick={() => navigate('/vitrine')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 font-bold transition-colors">
        <ArrowLeft size={16} /> Voltar à Vitrine
      </button>

      {/* Product Main */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative overflow-hidden rounded-2xl bg-gray-50 border border-gray-100">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full aspect-square object-cover" />
          ) : (
            <div className="w-full aspect-square flex items-center justify-center">
              <Package size={64} className="text-gray-300" />
            </div>
          )}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white/60 uppercase tracking-wide">{product.category}</span>
            {product.type === 'digital' && <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-primary/20 backdrop-blur-sm text-primary uppercase tracking-wide">Digital</span>}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight mb-2 text-gray-900">{product.name}</h1>
            <div className="flex items-center gap-3 text-sm">
              <Link to={product.store_slug ? `/loja/${product.store_slug}` : '#'} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors">
                <Store size={14} />
                <span className="font-semibold">{product.seller_store || product.seller_name}</span>
              </Link>
              <span className="text-gray-200">•</span>
              <StarRating rating={product.avg_rating || 0} count={product.review_count || 0} />
            </div>
          </div>

          <div className="text-4xl font-black text-primary">R$ {price}</div>

          <div className="flex flex-wrap gap-4 text-xs text-gray-400">
            {product.orders_count > 0 && (
              <div className="flex items-center gap-1.5"><ShoppingCart size={13} /> {product.orders_count} vendas</div>
            )}
            <div className="flex items-center gap-1.5"><Calendar size={13} /> {new Date(product.created_at).toLocaleDateString('pt-BR')}</div>
            <div className="flex items-center gap-1.5"><Tag size={13} /> {product.category}</div>
            {product.stock > 0 && <div className="flex items-center gap-1.5"><Package size={13} /> {product.stock} em estoque</div>}
          </div>

          {product.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Descrição</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={() => setBuyModal(true)}
              className="flex-1 py-4 bg-primary text-white font-black text-sm rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(168,85,247,0.2)]">
              <ShoppingCart size={16} /> {product.type === 'subscription' ? 'Assinar Agora' : 'Comprar Agora'}
            </button>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl">
            <Shield size={16} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-gray-700">Compra Segura</p>
              <p className="text-[11px] text-gray-400">Pagamento processado pela Ghost Pix com criptografia de ponta a ponta.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black flex items-center gap-2">
            <MessageSquare size={20} className="text-primary" />
            Avaliações
            <span className="text-sm font-bold text-gray-400">({reviews.length})</span>
          </h2>
        </div>

        {/* Rating Summary */}
        {reviews.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-gray-50 border border-gray-100 rounded-2xl">
            <div className="flex flex-col items-center justify-center gap-2">
              <p className="text-5xl font-black text-primary">{parseFloat(product.avg_rating).toFixed(1)}</p>
              <StarRating rating={product.avg_rating || 0} size={18} />
              <p className="text-xs text-gray-400">{product.review_count} avaliações</p>
            </div>
            <div className="space-y-2">
              {ratingDist.map(r => (
                <div key={r.stars} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-3">{r.stars}</span>
                  <Star size={10} className="text-yellow-400 fill-yellow-400" />
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400/60 rounded-full transition-all" style={{ width: `${r.pct}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-400 w-7 text-right">{r.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review Form */}
        {canReview && (
          <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl space-y-4">
            <h3 className="font-bold text-sm text-gray-900">Deixe sua avaliação</h3>
            <StarInput value={reviewRating} onChange={setReviewRating} />
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="O que achou do produto? (opcional)"
              maxLength={500}
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary/40 resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">{reviewComment.length}/500</span>
              <button onClick={submitReview} disabled={reviewLoading || reviewRating < 1}
                className="px-6 py-2.5 bg-primary text-white font-black text-xs rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2">
                {reviewLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Enviar Avaliação
              </button>
            </div>
            {reviewResult?.error && <p className="text-red-400 text-xs">{reviewResult.error}</p>}
            {reviewResult?.success && <p className="text-green-400 text-xs">{reviewResult.success}</p>}
          </div>
        )}

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
          </div>
        ) : (
          <div className="text-center py-12 space-y-2">
            <MessageSquare size={32} className="text-gray-300 mx-auto" />
            <p className="text-sm text-gray-500">Nenhuma avaliação ainda</p>
            <p className="text-xs text-gray-400">Seja o primeiro a avaliar este produto!</p>
          </div>
        )}
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-black text-gray-900">Produtos Relacionados</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map(p => (
              <Link key={p.id} to={`/vitrine/produto/${p.id}`}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-md transition-all group">
                <div className="relative overflow-hidden">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-32 bg-gray-50 flex items-center justify-center"><Package size={24} className="text-gray-300" /></div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold text-gray-900 line-clamp-2 mb-1">{p.name}</p>
                  <p className="text-sm font-black text-primary">R$ {parseFloat(p.price).toFixed(2).replace('.', ',')}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
