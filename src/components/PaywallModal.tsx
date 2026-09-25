import React, { useState } from 'react';
import {
  X,
  Zap,
  Check,
  ShieldCheck,
  CreditCard,
  Coins,
  ArrowRight,
  Flame,
  Sparkles
} from 'lucide-react';
import { Language, i18nDictionary } from '../utils/i18n';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  lang?: Language;
  onLicenseActivated: (key: string, plan: 'starter' | 'annual' | 'monthly' | 'ltd') => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  clientId,
  lang = 'en',
  onLicenseActivated
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'annual' | 'monthly'>('annual');
  const [manualKey, setManualKey] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto'>('card');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  if (!isOpen) return null;

  const t = i18nDictionary[lang];
  const isRTL = lang === 'ar';

  // Simulate Instant Whop Checkout & License Generation
  const handleSimulateWhopCheckout = async () => {
    setIsProcessing(true);
    setErrorMsg('');
    setSuccessMsg('');

    let prefix = 'WADEAL-ANNUAL';
    if (selectedPlan === 'starter') prefix = 'WADEAL-STARTER';
    else if (selectedPlan === 'monthly') prefix = 'WADEAL-MONTHLY';

    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const generatedKey = `${prefix}-${randomSuffix}`;

    try {
      const res = await fetch('/api/v1/verify-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          license_key: generatedKey
        })
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        setSuccessMsg(
          paymentMethod === 'card'
            ? t.paywall.toastCard(generatedKey)
            : t.paywall.toastCrypto(generatedKey)
        );
        setTimeout(() => {
          onLicenseActivated(generatedKey, selectedPlan);
          onClose();
        }, 1800);
      } else {
        setErrorMsg(data.message || t.paywall.toastInvalidKey);
      }
    } catch (err: any) {
      setErrorMsg(t.paywall.toastNetworkError);
    } finally {
      setIsProcessing(false);
    }
  };

  // Manual key activation
  const handleActivateManualKey = async () => {
    if (!manualKey.trim()) {
      setErrorMsg(t.paywall.toastEnterKey);
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/v1/verify-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          license_key: manualKey.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        setSuccessMsg(t.paywall.toastKeyVerified);
        setTimeout(() => {
          onLicenseActivated(manualKey.trim(), data.plan || 'annual');
          onClose();
        }, 1200);
      } else {
        setErrorMsg(data.message || t.paywall.toastInvalidKey);
      }
    } catch (err) {
      setErrorMsg(t.paywall.toastNetworkError);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-[#111b21] border border-emerald-500/30 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#e9edef] relative max-h-[94vh] overflow-y-auto scrollbar-none">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 inset-inline-end-4 p-1.5 rounded-full bg-[#202c33] text-[#8696a0] hover:text-white hover:bg-[#2a3942] transition-colors z-20 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 bg-gradient-to-b from-emerald-950/50 via-emerald-950/20 to-transparent border-b border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Zap className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              {t.paywall.badgeEngine}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight wadeal-bidi">
            {t.paywall.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#8696a0] mt-1.5 leading-relaxed max-w-2xl wadeal-bidi">
            {t.paywall.subtitle}
          </p>
        </div>

        {/* 3-Tier Pricing Model Architecture */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-stretch">
            {/* 1. Starter Plan ($9.9/mo) */}
            <div
              onClick={() => setSelectedPlan('starter')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between relative ${
                selectedPlan === 'starter'
                  ? 'border-emerald-500 bg-emerald-950/30 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/40'
                  : 'border-[#222e35] bg-[#182229]/70 hover:border-[#374248] hover:bg-[#182229]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {t.paywall.starterBadge}
                  </span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedPlan === 'starter' ? 'border-emerald-400 bg-emerald-500 text-black' : 'border-slate-600'
                  }`}>
                    {selectedPlan === 'starter' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </div>

                <div className="text-sm font-bold text-slate-200 mb-1">
                  {t.paywall.starterTitle}
                </div>

                <div className="flex items-baseline gap-1 my-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-white">{t.paywall.starterPrice}</span>
                  <span className="text-xs text-[#8696a0] font-medium">{t.paywall.starterPeriod}</span>
                </div>

                <p className="text-[11px] text-[#8696a0] leading-snug mb-3 wadeal-bidi">
                  {t.paywall.starterSub}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-white/5 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{t.paywall.starterQuota}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{t.paywall.starterContext}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#8696a0]">
                    <Check className="w-3.5 h-3.5 text-[#8696a0] flex-shrink-0" />
                    <span>WhatsApp Web Extension MV3</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Early-Bird Annual Deal ($59/yr) - Featured Hero Card with Rotating Laser Border */}
            <div
              onClick={() => setSelectedPlan('annual')}
              className={`wadeal-laser-card cursor-pointer transition-all duration-200 ${
                selectedPlan === 'annual' ? 'scale-[1.02] shadow-2xl shadow-emerald-500/25 ring-1 ring-emerald-400/50' : 'hover:scale-[1.01]'
              }`}
            >
              <div className="wadeal-laser-inner flex flex-col justify-between relative">
                <div>
                  {/* Floating Highlight Badge */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 text-black text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                      <Flame className="w-3 h-3 text-black fill-black" />
                      {t.paywall.annualBadge}
                    </span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedPlan === 'annual' ? 'border-emerald-400 bg-emerald-500 text-black' : 'border-slate-600'
                    }`}>
                      {selectedPlan === 'annual' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="text-sm font-extrabold text-emerald-400 flex items-center gap-1 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{t.paywall.annualTitle}</span>
                  </div>

                  <div className="flex items-baseline gap-1 my-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">{t.paywall.annualPrice}</span>
                    <span className="text-xs text-emerald-400 font-bold">{t.paywall.annualPeriod}</span>
                    <span className="text-[10px] text-amber-300 bg-amber-500/15 border border-amber-400/30 px-1.5 py-0.5 rounded ms-1">
                      50 Stores
                    </span>
                  </div>

                  {/* Scarcity Counter Component */}
                  <div className="mt-2.5 mb-3 p-2 rounded-xl bg-black/50 border border-emerald-500/25">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-amber-400 font-bold flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                        {t.paywall.scarcityClaimed}
                      </span>
                      <span className="text-emerald-400 font-bold text-[10.5px]">{t.paywall.scarcitySlotsLeft}</span>
                    </div>
                    <div className="w-full bg-[#202c33] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 via-orange-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: '76%' }}
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-snug mb-3 wadeal-bidi">
                    {t.paywall.annualSub}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-emerald-500/20 text-[11px] text-emerald-200">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="font-semibold text-white">{t.paywall.annualQuota}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{t.paywall.annualContext}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{t.paywall.features[2]}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Pro Monthly Plan ($19/mo) */}
            <div
              onClick={() => setSelectedPlan('monthly')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between relative ${
                selectedPlan === 'monthly'
                  ? 'border-emerald-500 bg-emerald-950/30 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/40'
                  : 'border-[#222e35] bg-[#182229]/70 hover:border-[#374248] hover:bg-[#182229]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                    {t.paywall.monthlyBadge}
                  </span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedPlan === 'monthly' ? 'border-emerald-400 bg-emerald-500 text-black' : 'border-slate-600'
                  }`}>
                    {selectedPlan === 'monthly' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </div>

                <div className="text-sm font-bold text-slate-200 mb-1">
                  {t.paywall.monthlyTitle}
                </div>

                <div className="flex items-baseline gap-1 my-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-white">{t.paywall.monthlyPrice}</span>
                  <span className="text-xs text-[#8696a0] font-medium">{t.paywall.monthlyPeriod}</span>
                </div>

                <p className="text-[11px] text-[#8696a0] leading-snug mb-3 wadeal-bidi">
                  {t.paywall.monthlySub}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-white/5 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{t.paywall.monthlyQuota}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{t.paywall.monthlyContext}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Zero lock-in • Cancel anytime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment gateway selection: Whop (Card / USDT) */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-[#8696a0]">
              <span className="wadeal-bidi">{t.paywall.whopNotice}</span>
              <span className="flex items-center gap-1 text-emerald-400 flex-shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" /> {t.paywall.globalSettlement}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : 'border-[#222e35] text-[#8696a0] hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" /> {t.paywall.cardOption}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('crypto')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  paymentMethod === 'crypto'
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : 'border-[#222e35] text-[#8696a0] hover:text-white'
                }`}
              >
                <Coins className="w-4 h-4" /> {t.paywall.cryptoOption}
              </button>
            </div>

            {/* 1-Click Simulated Whop Checkout with Dynamic Label */}
            <button
              onClick={handleSimulateWhopCheckout}
              disabled={isProcessing}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00a884] via-[#009378] to-[#008069] hover:from-[#02b690] hover:to-[#009378] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t.paywall.processingCheckout}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>
                    {selectedPlan === 'annual'
                      ? t.paywall.checkoutAnnual
                      : selectedPlan === 'starter'
                      ? t.paywall.checkoutStarter
                      : t.paywall.checkoutMonthly}
                  </span>
                </span>
              )}
            </button>
          </div>

          {/* Already have a key? */}
          <div className="pt-2 border-t border-white/5">
            <details className="group">
              <summary className="text-xs text-[#8696a0] hover:text-white cursor-pointer flex items-center justify-between">
                <span className="wadeal-bidi">{t.paywall.haveKey}</span>
                <span className="text-[10px] text-emerald-400 font-mono">WADEAL-ANNUAL-LAUNCH50</span>
              </summary>
              <div className="mt-2.5 flex gap-2">
                <input
                  type="text"
                  placeholder={t.paywall.keyPlaceholder}
                  value={manualKey}
                  onChange={e => setManualKey(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#202c33] border border-[#2a3942] text-xs text-white placeholder-[#8696a0] outline-none focus:border-emerald-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleActivateManualKey}
                  disabled={isProcessing}
                  className="px-3 py-1.5 bg-[#202c33] hover:bg-[#2a3942] text-emerald-400 font-bold text-xs rounded-lg border border-emerald-500/30 transition-colors whitespace-nowrap cursor-pointer"
                >
                  {t.paywall.activateBtn}
                </button>
              </div>
            </details>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span className="wadeal-bidi">{successMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
