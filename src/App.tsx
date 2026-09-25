import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Building2,
  Download,
  ShieldCheck,
  Server,
  Zap,
  RotateCcw,
  Sparkles,
  Crown,
  Languages
} from 'lucide-react';
import { WhatsAppSimulator } from './components/WhatsAppSimulator';
import { BusinessContextEditor } from './components/BusinessContextEditor';
import { ExtensionExporter } from './components/ExtensionExporter';
import { StoreComplianceDeck } from './components/StoreComplianceDeck';
import { ApiPlayground } from './components/ApiPlayground';
import { PaywallModal } from './components/PaywallModal';
import { Contact, ChatMessage, LeadStatus } from './types';
import { getContactsForLanguage, getPresetsForLanguage } from './utils/constants';
import { Language, getInitialLanguage, saveLanguagePreference, i18nDictionary } from './utils/i18n';

export default function App() {
  const [lang, setLang] = useState<Language>(getInitialLanguage);
  const [activeTab, setActiveTab] = useState<'simulator' | 'context' | 'extension' | 'compliance' | 'api'>('simulator');
  const [contacts, setContacts] = useState<Contact[]>(() => getContactsForLanguage(getInitialLanguage()));
  const [businessContext, setBusinessContext] = useState<string>(() => getPresetsForLanguage(getInitialLanguage())[0].context);
  const [clientId, setClientId] = useState<string>('wadeal_demo_user');
  const [licenseKey, setLicenseKey] = useState<string>('');
  const [isPro, setIsPro] = useState<boolean>(false);
  const [creditsRemaining, setCreditsRemaining] = useState<number>(40);
  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false);

  const t = i18nDictionary[lang];
  const isRTL = lang === 'ar';

  const handleToggleLang = () => {
    const nextLang: Language = lang === 'en' ? 'ar' : 'en';
    setLang(nextLang);
    saveLanguagePreference(nextLang);

    // Update contacts & default context to match language while preserving user flow
    setContacts(getContactsForLanguage(nextLang));
    const presets = getPresetsForLanguage(nextLang);
    setBusinessContext(presets[0].context);
  };

  // Sync HTML dir and lang
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isRTL]);

  // Initialize client state and fetch backend status
  useEffect(() => {
    const savedClientId = localStorage.getItem('wadeal_client_id') || `client_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('wadeal_client_id', savedClientId);
    setClientId(savedClientId);

    const savedContext = localStorage.getItem('wadeal_business_context');
    if (savedContext) setBusinessContext(savedContext);

    const savedKey = localStorage.getItem('wadeal_license_key');
    if (savedKey) setLicenseKey(savedKey);

    const savedIsPro = localStorage.getItem('wadeal_is_pro') === 'true';
    if (savedIsPro) setIsPro(true);

    fetch(`/api/v1/user-credits?client_id=${savedClientId}&license_key=${savedKey || ''}`)
      .then(res => res.json())
      .then(data => {
        if (data.is_pro) {
          setIsPro(true);
        } else if (typeof data.credits_remaining === 'number') {
          setCreditsRemaining(data.credits_remaining);
        }
      })
      .catch(err => {
        console.warn('Backend sync failed, using local state:', err);
      });
  }, []);

  const handleCreditsChange = (newCredits: number) => {
    setCreditsRemaining(newCredits);
    if (newCredits <= 0 && !isPro) {
      setIsPaywallOpen(true);
    }
  };

  const handleSaveContext = (newContext: string) => {
    setBusinessContext(newContext);
    localStorage.setItem('wadeal_business_context', newContext);
  };

  const handleLicenseActivated = (key: string, plan: 'starter' | 'annual' | 'monthly' | 'ltd') => {
    setLicenseKey(key);
    if (plan === 'starter') {
      setIsPro(false);
      setCreditsRemaining(150);
      localStorage.setItem('wadeal_is_pro', 'false');
    } else {
      setIsPro(true);
      localStorage.setItem('wadeal_is_pro', 'true');
    }
    localStorage.setItem('wadeal_license_key', key);
    localStorage.setItem('wadeal_plan', plan);
  };

  const handleUpdateContactStatus = (contactId: string, status: LeadStatus) => {
    setContacts(prev =>
      prev.map(c => (c.id === contactId ? { ...c, leadStatus: status } : c))
    );
  };

  const handleAddMessage = (contactId: string, message: ChatMessage) => {
    setContacts(prev =>
      prev.map(c => {
        if (c.id === contactId) {
          return {
            ...c,
            lastMessage: message.text,
            lastTime: message.timestamp,
            messages: [...c.messages, message]
          };
        }
        return c;
      })
    );
  };

  const handleResetDemo = async () => {
    try {
      await fetch('/api/v1/reset-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId })
      });
      setCreditsRemaining(40);
      setIsPro(false);
      setLicenseKey('');
      localStorage.removeItem('wadeal_license_key');
      localStorage.removeItem('wadeal_is_pro');
      setContacts(getContactsForLanguage(lang));
    } catch (e) {
      setCreditsRemaining(40);
      setIsPro(false);
    }
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#090e11] text-[#e9edef] flex flex-col font-sans transition-colors duration-200"
    >
      {/* Top Navigation Bar */}
      <header className="h-16 px-3 sm:px-6 bg-[#111b21] border-b border-[#222e35] flex items-center justify-between sticky top-0 z-40 shadow-lg flex-shrink-0">
        {/* Brand identity */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#00a884] to-[#25d366] flex items-center justify-center text-black font-black text-base sm:text-lg shadow-md shadow-emerald-950/50 flex-shrink-0">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                WADeal
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                {isRTL ? 'إضافة كروم MV3' : 'Chrome Extension MV3'}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#8696a0] hidden md:block truncate max-w-xs lg:max-w-md">
              {t.nav.tagline}
            </p>
          </div>
        </div>

        {/* Center Tabs Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#182229] p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'simulator'
                ? 'bg-[#00a884] text-white shadow'
                : 'text-[#8696a0] hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {t.nav.simulator}
          </button>

          <button
            onClick={() => setActiveTab('context')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'context'
                ? 'bg-[#00a884] text-white shadow'
                : 'text-[#8696a0] hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            {t.nav.context}
          </button>

          <button
            onClick={() => setActiveTab('extension')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'extension'
                ? 'bg-[#00a884] text-white shadow'
                : 'text-[#8696a0] hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            {t.nav.extension}
          </button>

          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'compliance'
                ? 'bg-[#00a884] text-white shadow'
                : 'text-[#8696a0] hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {t.nav.compliance}
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'api'
                ? 'bg-[#00a884] text-white shadow'
                : 'text-[#8696a0] hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            {t.nav.api}
          </button>
        </nav>

        {/* Right Action & Quota Engine */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          {/* Global Language Toggle Component (Spec 3.B) */}
          <button
            onClick={handleToggleLang}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all active:scale-95 shadow-sm whitespace-nowrap"
            title={isRTL ? 'Switch to English' : 'التحويل للعربية'}
          >
            <Languages className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.langSwitch}</span>
          </button>

          {/* Quota / Pro Pill */}
          {isPro ? (
            <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-sm whitespace-nowrap">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.badgePro}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                onClick={() => setIsPaywallOpen(true)}
                className="cursor-pointer flex items-center gap-1.5 bg-[#202c33] border border-white/10 hover:border-emerald-500/40 px-2.5 sm:px-3 py-1 rounded-full text-xs transition-colors whitespace-nowrap"
                title="Click to view paywall plans"
              >
                <span className={`font-bold ${creditsRemaining <= 5 ? 'text-red-400 font-mono' : 'text-emerald-400'}`}>
                  {t.nav.creditsRemainingLabel(creditsRemaining)}
                </span>
              </div>

              <button
                onClick={() => setIsPaywallOpen(true)}
                className="hidden sm:flex px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-black text-xs font-extrabold items-center gap-1 shadow-md hover:opacity-95 active:scale-95 transition-all whitespace-nowrap"
              >
                {t.nav.ltdCta}
              </button>
            </div>
          )}

          {/* Reset Demo button for tester convenience */}
          <button
            onClick={handleResetDemo}
            title={t.nav.resetDemo}
            className="p-1.5 sm:p-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-[#8696a0] hover:text-white transition-colors flex-shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden flex items-center gap-1 bg-[#111b21] p-2 overflow-x-auto border-b border-[#222e35] scrollbar-none flex-shrink-0">
        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
            activeTab === 'simulator' ? 'bg-[#00a884] text-white' : 'text-[#8696a0]'
          }`}
        >
          💬 {t.nav.simulator}
        </button>
        <button
          onClick={() => setActiveTab('context')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
            activeTab === 'context' ? 'bg-[#00a884] text-white' : 'text-[#8696a0]'
          }`}
        >
          🏢 {t.nav.context}
        </button>
        <button
          onClick={() => setActiveTab('extension')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
            activeTab === 'extension' ? 'bg-[#00a884] text-white' : 'text-[#8696a0]'
          }`}
        >
          📦 {t.nav.extension}
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
            activeTab === 'compliance' ? 'bg-[#00a884] text-white' : 'text-[#8696a0]'
          }`}
        >
          🛡️ {t.nav.compliance}
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
            activeTab === 'api' ? 'bg-[#00a884] text-white' : 'text-[#8696a0]'
          }`}
        >
          ⚡ {t.nav.api}
        </button>
      </div>

      {/* Main Body */}
      <main className="flex-1 p-2 sm:p-4 md:p-6 max-w-7xl mx-auto w-full flex flex-col min-h-0">
        {activeTab === 'simulator' && (
          <div className="flex-1 flex flex-col h-[calc(100vh-140px)] min-h-[540px]">
            {/* Quick Context Indicator Banner */}
            <div className="mb-2 px-3 sm:px-4 py-2 rounded-xl bg-[#111b21] border border-white/5 flex items-center justify-between text-xs flex-shrink-0 gap-2">
              <div className="flex items-center gap-2 truncate">
                <span className="text-emerald-400 font-bold flex items-center gap-1 whitespace-nowrap flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t.simulator.activeContextLabel}
                </span>
                <span className="text-[#8696a0] truncate max-w-md md:max-w-xl wadeal-bidi">
                  {businessContext}
                </span>
              </div>
              <button
                onClick={() => setActiveTab('context')}
                className="text-emerald-400 hover:underline text-[11px] font-semibold whitespace-nowrap flex-shrink-0"
              >
                {t.simulator.editContext}
              </button>
            </div>

            {/* The WhatsApp Web Simulator Canvas */}
            <div className="flex-1 min-h-0">
              <WhatsAppSimulator
                contacts={contacts}
                businessContext={businessContext}
                clientId={clientId}
                licenseKey={licenseKey}
                isPro={isPro}
                creditsRemaining={creditsRemaining}
                lang={lang}
                onToggleLang={handleToggleLang}
                onCreditsChange={handleCreditsChange}
                onOpenPaywall={() => setIsPaywallOpen(true)}
                onUpdateContactStatus={handleUpdateContactStatus}
                onAddMessage={handleAddMessage}
                onResetDemo={handleResetDemo}
              />
            </div>
          </div>
        )}

        {activeTab === 'context' && (
          <div className="max-w-4xl mx-auto w-full py-2">
            <BusinessContextEditor
              businessContext={businessContext}
              lang={lang}
              onSaveContext={handleSaveContext}
            />
          </div>
        )}

        {activeTab === 'extension' && (
          <div className="max-w-4xl mx-auto w-full py-2">
            <ExtensionExporter lang={lang} />
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="max-w-4xl mx-auto w-full py-2">
            <StoreComplianceDeck lang={lang} />
          </div>
        )}

        {activeTab === 'api' && (
          <div className="max-w-4xl mx-auto w-full py-2">
            <ApiPlayground
              clientId={clientId}
              licenseKey={licenseKey}
              businessContext={businessContext}
              lang={lang}
              onRefreshCredits={() => {
                fetch(`/api/v1/user-credits?client_id=${clientId}&license_key=${licenseKey}`)
                  .then(r => r.json())
                  .then(d => {
                    if (d.is_pro) setIsPro(true);
                    else setCreditsRemaining(d.credits_remaining);
                  });
              }}
            />
          </div>
        )}
      </main>

      {/* Paywall & Licensing Modal */}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        clientId={clientId}
        lang={lang}
        onLicenseActivated={handleLicenseActivated}
      />
    </div>
  );
}
