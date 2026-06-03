# Modificações para Responsividade Mobile - LandingPage.jsx

## Mudanças Específicas por Linha

---

### 1. LINHA 176 - NAV Container
**Alterar de:**
```jsx
<div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
```

**Para:**
```jsx
<div className="max-w-6xl mx-auto px-3 sm:px-5 h-14 sm:h-16 flex items-center justify-between">
```

**Motivo:** Reduzir padding e altura em mobile (px-3 em mobile, px-5 em tablet+; h-14 em mobile, h-16 em tablet+)

---

### 2. LINHA 177 - Logo
**Alterar de:**
```jsx
<Link to="/"><img src="/logo-diretopay.webp" alt="DiretoPay" className="h-8 sm:h-9 w-auto" /></Link>
```

**Para:**
```jsx
<Link to="/"><img src="/logo-diretopay.webp" alt="DiretoPay" className="h-7 sm:h-8 lg:h-9 w-auto" /></Link>
```

**Motivo:** Logo menor em mobile (h-7), aumentando progressivamente em breakpoints maiores

---

### 3. LINHA 220 - Mobile Menu
**Alterar de:**
```jsx
<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.15 }}
    className="fixed inset-0 z-40 bg-[#050709] flex flex-col pt-20 px-6 pb-10 md:hidden">
```

**Para:**
```jsx
<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.15 }}
    className="fixed inset-0 z-40 bg-[#050709] flex flex-col pt-16 px-4 sm:px-5 pb-6 md:hidden">
```

**Motivo:** Reduzir padding top (pt-16), padding horizontal (px-4 mobile, px-5 tablet+), padding bottom (pb-6)

---

### 4. LINHA 256 - Announcement Banner
**Alterar de:**
```jsx
className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.09] rounded-2xl px-5 py-3 backdrop-blur-xl shadow-xl shadow-black/30">
```

**Para:**
```jsx
className="flex items-center gap-2 sm:gap-3 bg-white/[0.04] border border-white/[0.09] rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2 sm:py-3 backdrop-blur-xl shadow-xl shadow-black/30">
```

**Motivo:** Reduzir gap (gap-2), padding (px-3 em mobile), border-radius (rounded-xl em mobile)

---

### 5. LINHA 258 - Banner Text
**Alterar de:**
```jsx
<span className="text-[13px] text-gray-300 hidden sm:inline">Entre no canal oficial para novidades e avisos!</span>
```

**Para:**
```jsx
<span className="text-[11px] sm:text-[13px] text-gray-300 hidden xs:inline">Entre no canal oficial para novidades e avisos!</span>
```

**Motivo:** Reduzir font size (11px em mobile)

---

### 6. LINHA 260 - CTA Button Banner
**Alterar de:**
```jsx
className="text-[10px] font-black bg-white text-black px-3 py-1.5 rounded-lg tracking-widest hover:bg-gray-100 transition-colors whitespace-nowrap">
```

**Para:**
```jsx
className="text-[9px] sm:text-[10px] font-black bg-white text-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg tracking-widest hover:bg-gray-100 transition-colors whitespace-nowrap">
```

**Motivo:** Font size menor (9px mobile), padding reduzido (px-2, py-1)

---

### 7. LINHA 269 - Social Proof Badge
**Alterar de:**
```jsx
className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-full px-4 py-2">
```

**Para:**
```jsx
className="flex items-center gap-2 sm:gap-3 bg-white/[0.03] border border-white/[0.06] rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2">
```

**Motivo:** Reduzir gap e padding em mobile

---

### 8. LINHA 271 - Avatar Circles
**Alterar de:**
```jsx
<div key={i} className="w-6 h-6 rounded-full border-2 border-[#050709] flex items-center justify-center text-[8px] font-bold"
```

**Para:**
```jsx
<div key={i} className="w-5 sm:w-6 h-5 sm:h-6 rounded-full border-2 border-[#050709] flex items-center justify-center text-[7px] sm:text-[8px] font-bold"
```

**Motivo:** Avatar menor (w-5 h-5), font menor (text-[7px])

---

### 9. LINHA 276 - Online Users Counter
**Alterar de:**
```jsx
<span className="text-[12px] font-semibold text-gray-300">
```

**Para:**
```jsx
<span className="text-[10px] sm:text-[12px] font-semibold text-gray-300">
```

**Motivo:** Font size menor em mobile

---

### 10. LINHA 280 - HERO Section
**Alterar de:**
```jsx
<section id="sistema" className="relative z-10 pt-12 pb-20 px-5 overflow-hidden">
```

**Para:**
```jsx
<section id="sistema" className="relative z-10 pt-8 sm:pt-12 pb-16 sm:pb-20 px-4 sm:px-5 overflow-hidden">
```

**Motivo:** Reduzir padding/margin (pt-8, pb-16, px-4 em mobile)

---

### 11. LINHA 286 - Grid Layout HERO
**Alterar de:**
```jsx
<div className="grid lg:grid-cols-2 gap-14 items-center">
```

**Para:**
```jsx
<div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-14 items-center">
```

**Motivo:** Gap menor em mobile (gap-8), aumenta gradualmente

---

### 12. LINHA 300 - H1 Principal (CRÍTICO!)
**Alterar de:**
```jsx
<h1 className="text-[42px] sm:text-[56px] font-black tracking-tight leading-[1.03] mb-5">
```

**Para:**
```jsx
<h1 className="text-[28px] sm:text-[36px] lg:text-[48px] font-black tracking-tight leading-[1.05] mb-4 sm:mb-5">
```

**Motivo:** CRÍTICO! Reduzir h1 de 42px para 28px em mobile (28px → 36px tablet → 48px desktop), aumentar line-height

---

### 13. LINHA 310 - Parágrafo descrição HERO
**Alterar de:**
```jsx
<p className="text-[16px] text-gray-400 leading-relaxed mb-6 max-w-md">
```

**Para:**
```jsx
<p className="text-[14px] sm:text-[15px] lg:text-[16px] text-gray-400 leading-relaxed mb-4 sm:mb-6 max-w-md">
```

**Motivo:** Font size menor (14px mobile), margin reduzida

---

### 14. LINHA 314-318 - Feature Badges
**Alterar de:**
```jsx
<div className="flex flex-wrap gap-2 mb-8">
    {['Sem documentos','Sem CNPJ','Taxa fixa','Ativo em 2 min'].map(t => (
        <span key={t} className="flex items-center gap-1.5 text-[12px] text-emerald-300 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
```

**Para:**
```jsx
<div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6 sm:mb-8">
    {['Sem documentos','Sem CNPJ','Taxa fixa','Ativo em 2 min'].map(t => (
        <span key={t} className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[12px] text-emerald-300 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
```

**Motivo:** Reduzir gap (1.5 → 1), font menor (10px mobile), padding menor (px-2, py-0.5)

---

### 15. LINHA 320 - CTA Buttons Container
**Alterar de:**
```jsx
<div className="flex flex-col sm:flex-row gap-3 mb-10">
    <MagneticButton className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-7 py-3.5 rounded-xl transition-colors text-[15px] shadow-2xl shadow-emerald-500/30">
```

**Para:**
```jsx
<div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mb-8 sm:mb-10">
    <MagneticButton className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl transition-colors text-[13px] sm:text-[15px] shadow-2xl shadow-emerald-500/30">
```

**Motivo:** Gap reduzido (gap-2.5), padding menor (px-5, py-2.5), font menor (13px), rounded menor (rounded-lg)

---

### 16. LINHA 323 - Secundário Button
**Alterar de:**
```jsx
<a href="#recursos"
    className="flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 hover:bg-white/[0.04] text-gray-300 font-medium px-7 py-3.5 rounded-xl transition-all text-[15px]">
```

**Para:**
```jsx
<a href="#recursos"
    className="flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 hover:bg-white/[0.04] text-gray-300 font-medium px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl transition-all text-[13px] sm:text-[15px]">
```

**Motivo:** Mesmo padrão - reduzir padding e font em mobile

---

### 17. LINHA 329 - Benefits Grid
**Alterar de:**
```jsx
<div className="grid grid-cols-3 gap-3">
    {BENEFITS.map(({ icon: Icon, color, title, desc }) => (
        <motion.div key={title} whileHover={{ y: -4, scale: 1.02 }}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 hover:border-white/[0.14] transition-all cursor-default">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
```

**Para:**
```jsx
<div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
    {BENEFITS.map(({ icon: Icon, color, title, desc }) => (
        <motion.div key={title} whileHover={{ y: -4, scale: 1.02 }}
            className="rounded-lg sm:rounded-2xl border border-white/[0.07] bg-white/[0.03] p-2.5 sm:p-4 hover:border-white/[0.14] transition-all cursor-default">
                <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3"
```

**Motivo:** Grid 2 colunas mobile (melhor proporção), gap e padding reduzidos

---

### 18. LINHA 334 - Benefit Card Text
**Alterar de:**
```jsx
<p className="text-[12px] font-bold text-white mb-1">{title}</p>
<p className="text-[11px] text-gray-500 leading-relaxed">{desc}</p>
```

**Para:**
```jsx
<p className="text-[10px] sm:text-[12px] font-bold text-white mb-1">{title}</p>
<p className="text-[9px] sm:text-[11px] text-gray-500 leading-relaxed">{desc}</p>
```

**Motivo:** Font menor em mobile

---

### 19. LINHA 343 - Marquee Section
**Alterar de:**
```jsx
<section className="relative z-10 border-y border-white/[0.06] bg-white/[0.015] overflow-hidden py-5">
```

**Para:**
```jsx
<section className="relative z-10 border-y border-white/[0.06] bg-white/[0.015] overflow-hidden py-3 sm:py-5">
```

**Motivo:** Reduzir padding vertical em mobile

---

### 20. LINHA 344 - Marquee Label
**Alterar de:**
```jsx
<p className="text-center text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4">Compatível com os maiores sistemas</p>
```

**Para:**
```jsx
<p className="text-center text-[8px] sm:text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2 sm:mb-4">Compatível com os maiores sistemas</p>
```

**Motivo:** Font menor (8px mobile), margin reduzida (mb-2)

---

### 21. LINHA 356 - Marquee Items
**Alterar de:**
```jsx
<span key={i} className="text-[13px] font-black text-gray-500 whitespace-nowrap tracking-tight opacity-40 hover:opacity-80 transition-opacity cursor-default">{name}</span>
```

**Para:**
```jsx
<span key={i} className="text-[11px] sm:text-[13px] font-black text-gray-500 whitespace-nowrap tracking-tight opacity-40 hover:opacity-80 transition-opacity cursor-default">{name}</span>
```

**Motivo:** Font menor em mobile

---

### 22. LINHA 372 - Stats Section Container
**Alterar de:**
```jsx
<div className="max-w-5xl mx-auto px-5 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
```

**Para:**
```jsx
<div className="max-w-5xl mx-auto px-4 sm:px-5 py-10 sm:py-14 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
```

**Motivo:** Padding reduzido (px-4, py-10), gap progressivo (gap-4 → gap-6 → gap-8)

---

### 23. LINHA 374 - Stats Numbers
**Alterar de:**
```jsx
<p className="text-[38px] sm:text-[48px] font-black tracking-tight tabular-nums"
```

**Para:**
```jsx
<p className="text-[28px] sm:text-[36px] md:text-[48px] font-black tracking-tight tabular-nums"
```

**Motivo:** Números muito menores em mobile (28px), aumenta com breakpoints

---

### 24. LINHA 378-379 - Stats Labels
**Alterar de:**
```jsx
<p className="text-[13px] font-bold text-gray-300 mt-1.5 uppercase tracking-wider">{label}</p>
<p className="text-[11px] text-gray-600 mt-0.5">{note}</p>
```

**Para:**
```jsx
<p className="text-[11px] sm:text-[13px] font-bold text-gray-300 mt-1 sm:mt-1.5 uppercase tracking-wider">{label}</p>
<p className="text-[9px] sm:text-[11px] text-gray-600 mt-0.5">{note}</p>
```

**Motivo:** Font menor em mobile

---

### 25. LINHA 391 - Conquistas Section
**Alterar de:**
```jsx
<section className="relative z-10 py-20 px-5 border-t border-white/[0.06]">
```

**Para:**
```jsx
<section className="relative z-10 py-12 sm:py-20 px-4 sm:px-5 border-t border-white/[0.06]">
```

**Motivo:** Padding reduzido (py-12, px-4)

---

### 26. LINHA 398 - Conquistas H2
**Alterar de:**
```jsx
<h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
```

**Para:**
```jsx
<h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-2">
```

**Motivo:** Título menor em mobile (text-2xl)

---

### 27. LINHA 403 - Conquistas Descrição
**Alterar de:**
```jsx
<p className="text-gray-500 text-[14px] max-w-sm mx-auto">
```

**Para:**
```jsx
<p className="text-gray-500 text-[12px] sm:text-[14px] max-w-sm mx-auto">
```

**Motivo:** Font menor em mobile

---

### 28. LINHA 410 - Conquistas Grid
**Alterar de:**
```jsx
<div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
```

**Para:**
```jsx
<div className="grid lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-16 items-center">
```

**Motivo:** Gap menor em mobile (gap-6)

---

### 29. LINHA 413 - Label "Ao você faturar"
**Alterar de:**
```jsx
<p className={`text-[12px] font-black uppercase tracking-widest text-gray-500 mb-3`}>Ao você faturar</p>
```

**Para:**
```jsx
<p className={`text-[10px] sm:text-[12px] font-black uppercase tracking-widest text-gray-500 mb-2 sm:mb-3`}>Ao você faturar</p>
```

**Motivo:** Font menor e margin reduzida em mobile

---

### 30. LINHA 416 - Amount Box
**Alterar de:**
```jsx
<div className="inline-flex items-center justify-center border-2 border-emerald-500 rounded-2xl px-6 py-3 mb-6"
```

**Para:**
```jsx
<div className="inline-flex items-center justify-center border-2 border-emerald-500 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-2 sm:py-3 mb-4 sm:mb-6"
```

**Motivo:** Padding reduzido (px-4, py-2), rounded menor, margin menor

---

### 31. LINHA 420 - Amount Text
**Alterar de:**
```jsx
className="text-[32px] font-black text-emerald-400 leading-none">
```

**Para:**
```jsx
className="text-[24px] sm:text-[28px] lg:text-[32px] font-black text-emerald-400 leading-none">
```

**Motivo:** Número muito menor em mobile (24px)

---

### 32. LINHA 433 - Trophy Icon + Description
**Alterar de:**
```jsx
<div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
    <Trophy size={14} className="text-emerald-400" />
</div>
<div>
    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Você recebe:</p>
    <p className="text-[14px] text-gray-300 leading-relaxed">{PLATES[activePlate].desc}</p>
</div>
```

**Para:**
```jsx
<div className="w-7 sm:w-8 h-7 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
    <Trophy size={12} className="text-emerald-400 sm:w-[14px]" />
</div>
<div>
    <p className="text-[8px] sm:text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Você recebe:</p>
    <p className="text-[12px] sm:text-[13px] lg:text-[14px] text-gray-300 leading-relaxed">{PLATES[activePlate].desc}</p>
</div>
```

**Motivo:** Ícone menor (w-7), font menor no label (8px)

---

### 33. LINHA 455-460 - Placa Card (CRÍTICO!)
**Alterar de:**
```jsx
<div className="flex justify-center">
    <AnimatePresence mode="wait">
        <motion.div key={activePlate}
            initial={{ opacity: 0, scale: 0.88, rotateY: -12 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.88, rotateY: 12 }}
            transition={{ duration: 0.38, ease: [0.22,1,0.36,1] }}
            className="relative w-[240px] sm:w-[270px] rounded-3xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
```

**Para:**
```jsx
<div className="flex justify-center px-2 sm:px-0">
    <AnimatePresence mode="wait">
        <motion.div key={activePlate}
            initial={{ opacity: 0, scale: 0.88, rotateY: -12 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.88, rotateY: 12 }}
            transition={{ duration: 0.38, ease: [0.22,1,0.36,1] }}
            className="relative w-[200px] sm:w-[240px] lg:w-[270px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
```

**Motivo:** CRÍTICO! Placa menor em mobile (w-[200px]), com px-2 para não cortar nas bordas, rounded menor

---

### 34. LINHA 480-485 - Placa Content (CRÍTICO!)
**Alterar de:**
```jsx
<div className="w-14 h-14 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 flex items-center justify-center mb-5">
    <Trophy size={26} className="text-emerald-400" />
</div>

<p className="text-[9px] font-black text-emerald-300/50 tracking-[0.38em] uppercase mb-3">PARABÉNS</p>

<p className="text-[62px] font-black text-white leading-none tracking-tight mb-1">
```

**Para:**
```jsx
<div className="w-10 sm:w-12 lg:w-14 h-10 sm:h-12 lg:h-14 rounded-lg sm:rounded-2xl border border-emerald-400/20 bg-emerald-500/10 flex items-center justify-center mb-3 sm:mb-5">
    <Trophy size={18} className="text-emerald-400 sm:w-[22px] lg:w-[26px]" />
</div>

<p className="text-[7px] sm:text-[8px] lg:text-[9px] font-black text-emerald-300/50 tracking-[0.2em] sm:tracking-[0.38em] uppercase mb-2 sm:mb-3">PARABÉNS</p>

<p className="text-[40px] sm:text-[50px] lg:text-[62px] font-black text-white leading-none tracking-tight mb-1">
```

**Motivo:** CRÍTICO! Ícone muito menor (w-10, size-18), texto "PARABÉNS" de 7px (era 9px), número GIGANTE reduzido de 62px para 40px

---

### 35. LINHA 489-492 - Placa Footer
**Alterar de:**
```jsx
<p className="text-[9px] font-black text-emerald-300/50 tracking-[0.38em] uppercase">FATURADOS</p>

{/* Logo */}
<div className="mt-auto pt-10">
    <img src="/logo-diretopay.webp" alt="DiretoPay" className="h-4 opacity-25 mx-auto" />
</div>
```

**Para:**
```jsx
<p className="text-[7px] sm:text-[8px] lg:text-[9px] font-black text-emerald-300/50 tracking-[0.2em] sm:tracking-[0.38em] uppercase">FATURADOS</p>

{/* Logo */}
<div className="mt-auto pt-6 sm:pt-10">
    <img src="/logo-diretopay.webp" alt="DiretoPay" className="h-3 sm:h-4 opacity-25 mx-auto" />
</div>
```

**Motivo:** Font menor (7px), padding reduzido (pt-6), logo menor (h-3)

---

### 36. LINHA 509 - Conquistas Social Proof
**Alterar de:**
```jsx
<p className="text-[13px] text-gray-500">
```

**Para:**
```jsx
<p className="text-[11px] sm:text-[13px] text-gray-500">
```

**Motivo:** Font menor em mobile

---

### 37. LINHA 520 - Testimonials Section
**Alterar de:**
```jsx
<section id="recursos" className="relative z-10 py-20 px-5 border-t border-white/[0.06]">
```

**Para:**
```jsx
<section id="recursos" className="relative z-10 py-12 sm:py-20 px-4 sm:px-5 border-t border-white/[0.06]">
```

**Motivo:** Padding reduzido

---

### 38. LINHA 527 - Testimonials H2
**Alterar de:**
```jsx
<h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">Resultados reais de quem usa</h2>
<p className="text-gray-500 text-[14px]">Sellers de todo o Brasil já faturam com a DiretoPay.</p>
```

**Para:**
```jsx
<h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-2">Resultados reais de quem usa</h2>
<p className="text-gray-500 text-[12px] sm:text-[14px]">Sellers de todo o Brasil já faturam com a DiretoPay.</p>
```

**Motivo:** Título menor (text-2xl), descrição menor (12px)

---

### 39. LINHA 530 - Testimonials Grid
**Alterar de:**
```jsx
<div className="grid md:grid-cols-3 gap-5">
```

**Para:**
```jsx
<div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
```

**Motivo:** 2 colunas em tablet, gap progressivo

---

### 40. LINHA 545-550 - Testimonial Card Footer
**Alterar de:**
```jsx
<div className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black shrink-0"
    style={{ background: 'linear-gradient(135deg, #10b981, #6366f1)' }}>{initials}</div>
<div className="flex-1 min-w-0">
    <p className="text-[12px] font-bold text-white">{name}</p>
    <p className="text-[11px] text-gray-500">{role}</p>
</div>
<span className="text-[11px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg shrink-0">{revenue}</span>
```

**Para:**
```jsx
<div className="w-8 sm:w-9 h-8 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center text-[9px] sm:text-[11px] font-black shrink-0"
    style={{ background: 'linear-gradient(135deg, #10b981, #6366f1)' }}>{initials}</div>
<div className="flex-1 min-w