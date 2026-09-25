import React, { useState } from 'react';
import {
  X,
  Zap,
  Check,
  ShieldCheck,
  CreditCard,
  Coins,
  ArrowRight
} from 'lucide-react';
import { Language, i18nDictionary } from '../utils/i18n';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  lang?: Language;
  onLicenseActivated: (key: string, plan: 'ltd' | 'monthly') => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  clientId,
  lang = 'en',
  onLicenseActivated
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'ltd' | 'monthly'>('ltd');
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

    const prefix = selectedPlan === 'ltd' ? 'WADEAL-LTD' : 'WADEAL-PRO';
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
          onLicenseActivated(manualKey.trim(), data.plan || 'ltd');
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-[#111b21] border border-emerald-500/30 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#e9edef] relative max-h-[95vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 inset-inline-end-4 p-1.5 rounded-full bg-[#202c33] text-[#8696a0] hover:text-white hover:bg-[#2a3942] transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 bg-gradient-to-b from-emerald-950/40 to-transparent border-b border-white/5">
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
          <p className="text-xs sm:text-sm text-[#8696a0] mt-1.5 leading-relaxed wadeal-bidi">
            {t.paywall.subtitle}
          </p>
        </div>

        {/* Pricing Options */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* LTD Option */}
            <div
              onClick={() => setSelectedPlan('ltd')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative ${
                selectedPlan === 'ltd'
                  ? 'border-emerald-500 bg-emerald-950/30 shadow-lg shadow-emerald-900/20'
                  : 'border-[#222e35] bg-[#182229]/60 hover:border-[#374248]'
              }`}
            >
              <div className="absolute -top-2.5 inset-inline-end-3 bg-gradient-to-r from-red-500 to-amber-500 text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow">
                {t.paywall.ltdBadge}
              </div>
              <div className="text-xs font-bold text-emerald-400 mb-1">
                {t.paywall.ltdTitle}
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-black text-white">{t.paywall.ltdPrice}</span>
                <span className="text-xs text-[#8696a0]">{t.paywall.oneTime}</span>
              </div>
              <p className="text-[11px] text-[#8696a0] leading-snug wadeal-bidi">
                {t.paywall.ltdSub}
              </p>
            </div>

            {/* Monthly Option */}
            <div
              onClick={() => setSelectedPlan('monthly')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedPlan === 'monthly'
                  ? 'border-emerald-500 bg-emerald-950/30 shadow-lg shadow-emerald-900/20'
                  : 'border-[#222e35] bg-[#182229]/60 hover:border-[#374248]'
              }`}
            >
              <div className="text-xs font-bold text-[#8696a0] mb-1">
                {t.paywall.monthlyTitle}
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-black text-white">{t.paywall.monthlyPrice}</span>
                <span className="text-xs text-[#8696a0]">{t.paywall.perMonth}</span>
              </div>
              <p className="text-[11px] text-[#8696a0] leading-snug wadeal-bidi">
                {t.paywall.monthlySub}
              </p>
            </div>
          </div>

          {/* Value Props Checklist */}
          <div className="bg-[#182229]/70 rounded-xl p-3.5 border border-white/5 space-y-2 text-xs">
            {t.paywall.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-emerald-300">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="wadeal-bidi">{feature}</span>
              </div>
            ))}
          </div>

          {/* Payment gateway selection: Whop (Card / USDT) */}
          <div className="space-y-2 pt-1">
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
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
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
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === 'crypto'
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : 'border-[#222e35] text-[#8696a0] hover:text-white'
                }`}
              >
                <Coins className="w-4 h-4" /> {t.paywall.cryptoOption}
              </button>
            </div>

            {/* 1-Click Simulated Whop Checkout */}
            <button
              onClick={handleSimulateWhopCheckout}
              disabled={isProcessing}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00a884] to-[#008069] hover:from-[#02b690] hover:to-[#009378] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t.paywall.processingCheckout}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {t.paywall.checkoutBtn} ({selectedPlan === 'ltd' ? t.paywall.ltdPrice : `${t.paywall.monthlyPrice}${isRTL ? ' شهرياً' : '/mo'}`})
                  <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                </span>
              )}
            </button>
          </div>

          {/* Already have a key? */}
          <div className="pt-2 border-t border-white/5">
            <details className="group">
              <summary className="text-xs text-[#8696a0] hover:text-white cursor-pointer flex items-center justify-between">
                <span className="wadeal-bidi">{t.paywall.haveKey}</span>
                <span className="text-[10px] text-emerald-400 font-mono">WADEAL-LTD-LAUNCH50</span>
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
                  className="px-3 py-1.5 bg-[#202c33] hover:bg-[#2a3942] text-emerald-400 font-bold text-xs rounded-lg border border-emerald-500/30 transition-colors whitespace-nowrap"
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
