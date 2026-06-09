import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Mail,
  ArrowRight,
  Zap,
  KeyRound,
  Check,
  ShieldCheck,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  CustomCursor,
  NoiseOverlay,
  MagneticButton,
  GlowInput,
  BorderBeam,
  Meteors,
  FlickeringGrid,
  HyperText,
  ShinyText,
  RippleButton,
} from "../components/AnimatedUI";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mustResetPassword, setMustResetPassword] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();
  const [registered, setRegistered] = useState(
    new URLSearchParams(window.location.search).get("registered") === "1",
  );

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content");
      formData.append("csrf_token", csrfToken);
      const res = await fetch("/auth/login.php", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = "/dashboard";
      } else if (data.must_reset_password) {
        setMustResetPassword(true);
        setResetToken(data.reset_token);
        setError("");
      } else {
        setError(data.error || "Email ou senha inválidos.");
      }
    } catch {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Mínimo 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/force_reset_password.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reset_token: resetToken,
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResetSuccess(true);
        setMustResetPassword(false);
        setNewPassword("");
        setConfirmPassword("");
        setPassword("");
        setTimeout(() => setResetSuccess(false), 5000);
      } else {
        setError(data.error || "Erro ao redefinir senha.");
      }
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060809] text-white flex flex-col items-center justify-center overflow-hidden relative px-4">
      <CustomCursor />
      <NoiseOverlay opacity={0.03} />

      {/* ── ANIMATED BACKGROUND ORBS ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Top-left emerald orb */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.18, 0.28, 0.18] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(16,185,129,0.22) 0%, transparent 65%)",
          }}
        />
        {/* Bottom-right indigo orb */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.2, 0.12] }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute -bottom-60 -right-40 w-[800px] h-[800px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)",
          }}
        />
        {/* Center subtle glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(16,185,129,0.05) 0%, transparent 70%)",
          }}
        />
        {/* Flickering animated grid */}
        <FlickeringGrid color="#10b981" opacity={0.18} cellSize={32} flickerChance={0.002} />
        <Meteors count={8} color="#10b981" />
      </div>

      {/* ── LOGO ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mb-8"
      >
        <Link to="/">
          <img
            src="/logo-diretopay.webp"
            alt="DiretoPay"
            className="h-9 w-auto"
          />
        </Link>
      </motion.div>

      {/* ── MAIN CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <div
          className="rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl p-8 relative overflow-hidden"
          style={{
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.05), 0 40px 100px rgba(0,0,0,0.55), 0 0 80px rgba(16,185,129,0.05)",
          }}
        >
          <BorderBeam colorFrom="#10b981" colorTo="#6366f1" duration={14} />
          {/* Header */}
          <div className="mb-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={mustResetPassword ? "reset-h" : "login-h"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                <h1 className="text-[22px] font-bold tracking-tight text-white">
                  <HyperText text={mustResetPassword ? "Criar nova senha" : "Bem-vindo de volta"} trigger="inView" duration={600} />
                </h1>
                <p className="text-[13px] text-gray-500 mt-1">
                  {mustResetPassword
                    ? "Defina uma senha segura para continuar"
                    : "Entre na sua conta DiretoPay"}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Success */}
          <AnimatePresence>
            {resetSuccess && (
              <motion.div
                key="ok"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[12px] font-medium px-4 py-3 rounded-xl mb-4 overflow-hidden"
              >
                <Check size={13} className="shrink-0" /> Senha atualizada! Faça
                login agora.
              </motion.div>
            )}
          </AnimatePresence>

          {/* Registered success */}
          {registered && (
            <div className="flex items-center gap-2 text-[12px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl mb-1">
              <Check size={14} className="shrink-0" /> Conta criada com sucesso!
              Faça seu login.
            </div>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="err"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] px-4 py-3 rounded-xl mb-4 overflow-hidden"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-pulse" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {mustResetPassword ? (
              <motion.form
                key="reset"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleResetPassword}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[12px] px-4 py-3 rounded-xl">
                  <KeyRound size={13} className="shrink-0" /> Crie uma nova
                  senha para continuar.
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
                    Nova senha
                  </label>
                  <GlowInput
                    icon={Lock}
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
                    Confirmar senha
                  </label>
                  <GlowInput
                    icon={Lock}
                    type="password"
                    placeholder="Repita a senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <MagneticButton
                  type="submit"
                  disabled={loading}
                  strength={0.2}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl py-3.5 font-semibold text-[14px] flex items-center justify-center gap-2 transition-colors mt-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      Definir senha <ArrowRight size={15} />
                    </>
                  )}
                </MagneticButton>

                <button
                  type="button"
                  onClick={() => {
                    setMustResetPassword(false);
                    setError("");
                  }}
                  className="w-full text-center text-[12px] text-gray-600 hover:text-gray-400 transition-colors pt-1"
                >
                  ← Voltar ao login
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleLogin}
                className="space-y-5"
              >
                {/* Email */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
                    E-mail
                  </label>
                  <GlowInput
                    icon={Mail}
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
                      Senha
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[11px] text-emerald-500 hover:text-emerald-400 transition-colors"
                    >
                      Esqueci a senha
                    </Link>
                  </div>
                  <div className="relative">
                    <GlowInput
                      icon={Lock}
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors"
                    >
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* CTA */}
                <RippleButton
                  type="submit"
                  disabled={loading}
                  color="rgba(16,185,129,0.5)"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-white rounded-xl py-3.5 font-semibold text-[14px] flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 mt-1"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      <ShinyText speed={3}>Entrar na conta</ShinyText> <ArrowRight size={15} />
                    </>
                  )}
                </RippleButton>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Divider + register */}
          <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
            <p className="text-[12px] text-gray-600">
              Não tem uma conta?{" "}
              <Link
                to="/register"
                className="text-white hover:text-emerald-400 font-medium transition-colors"
              >
                Criar conta grátis
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── TRUST BADGES ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="relative z-10 flex items-center gap-5 mt-6"
      >
        {[
          { icon: ShieldCheck, text: "SSL criptografado" },
          { icon: Zap, text: "PIX instantâneo" },
          { icon: Users, text: "4.200+ sellers" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-1.5">
            <Icon size={11} className="text-emerald-500/50" />
            <span className="text-[10px] text-gray-700">{text}</span>
          </div>
        ))}
      </motion.div>

      {/* ── FOOTER ── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="relative z-10 text-[10px] text-gray-800 mt-6"
      >
        © {new Date().getFullYear()} DiretoPay · Todos os direitos reservados
      </motion.p>
    </div>
  );
}
