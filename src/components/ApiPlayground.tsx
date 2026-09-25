import React, { useState } from 'react';
import {
  Server,
  Play,
  Code2,
  Key,
  Send
} from 'lucide-react';
import { Language, i18nDictionary } from '../utils/i18n';

interface ApiPlaygroundProps {
  clientId: string;
  licenseKey: string;
  businessContext: string;
  lang?: Language;
  onRefreshCredits: () => void;
}

export const ApiPlayground: React.FC<ApiPlaygroundProps> = ({
  clientId,
  licenseKey,
  businessContext,
  lang = 'en',
  onRefreshCredits
}) => {
  const [activeEndpoint, setActiveEndpoint] = useState<'generate' | 'verify'>('generate');
  const [testBuyerText, setTestBuyerText] = useState<string>(() =>
    lang === 'ar'
      ? 'هل يوجد خصم لو طلبت قطعتين، وكم مدة التوصيل؟'
      : 'Is there a discount if I take two, and how fast is delivery?'
  );
  const [testKey, setTestKey] = useState<string>(licenseKey || 'WADEAL-LTD-LAUNCH50');
  const [responseJson, setResponseJson] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusBadge, setStatusBadge] = useState<string>('200 OK');

  const t = i18nDictionary[lang];
  const isRTL = lang === 'ar';

  const handleTestGenerate = async () => {
    setIsLoading(true);
    setResponseJson(null);

    try {
      const res = await fetch('/api/v1/generate-deal-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          license_key: licenseKey,
          business_context: businessContext,
          chat_history: [
            { sender: 'Buyer', text: testBuyerText }
          ]
        })
      });

      setStatusBadge(`${res.status} ${res.statusText}`);
      const rawText = await res.text();
      try {
        const data = JSON.parse(rawText);
        setResponseJson(JSON.stringify(data, null, 2));
      } catch {
        setResponseJson(rawText.startsWith('<') ? `[HTML Warmup / Server Starting - ${res.status}]\n${rawText.slice(0, 300)}...` : rawText);
      }
      onRefreshCredits();
    } catch (e: any) {
      setResponseJson(JSON.stringify({ error: e.message }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestVerify = async () => {
    setIsLoading(true);
    setResponseJson(null);

    try {
      const res = await fetch('/api/v1/verify-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          license_key: testKey
        })
      });

      setStatusBadge(`${res.status} ${res.statusText}`);
      const rawText = await res.text();
      try {
        const data = JSON.parse(rawText);
        setResponseJson(JSON.stringify(data, null, 2));
      } catch {
        setResponseJson(rawText.startsWith('<') ? `[HTML Warmup / Server Starting - ${res.status}]\n${rawText.slice(0, 300)}...` : rawText);
      }
      onRefreshCredits();
    } catch (e: any) {
      setResponseJson(JSON.stringify({ error: e.message }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="bg-[#111b21] border border-emerald-950/60 rounded-2xl p-5 shadow-xl space-y-5 text-[#e9edef]"
    >
      {/* Header */}
      <div className="pb-4 border-b border-[#222e35] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Server className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">
              {t.api.title}
            </h2>
          </div>
          <p className="text-xs text-[#8696a0] mt-1 leading-relaxed">
            {t.api.subtitle}
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex items-center gap-1.5 bg-[#202c33] p-1 rounded-xl flex-shrink-0" dir="ltr">
          <button
            onClick={() => { setActiveEndpoint('generate'); setResponseJson(null); }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
              activeEndpoint === 'generate'
                ? 'bg-emerald-500 text-white shadow'
                : 'text-[#8696a0] hover:text-white'
            }`}
          >
            {t.api.tabGenerate}
          </button>
          <button
            onClick={() => { setActiveEndpoint('verify'); setResponseJson(null); }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
              activeEndpoint === 'verify'
                ? 'bg-emerald-500 text-white shadow'
                : 'text-[#8696a0] hover:text-white'
            }`}
          >
            {t.api.tabVerify}
          </button>
        </div>
      </div>

      {/* Endpoint Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Request Side */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8696a0] flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-emerald-400" />
            {t.api.requestParamsLabel}
          </span>

          {activeEndpoint === 'generate' ? (
            <div className="p-4 rounded-xl bg-[#182229] border border-white/5 space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-[#8696a0] block mb-1">
                  {t.api.customerInquiryLabel}
                </label>
                <div className="flex gap-1.5 mb-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setTestBuyerText(isRTL ? 'تمام يا غالي، جهز لي حبتين بالعرض على طريق الملك فهد بالرياض والدفع عند الاستلام.' : 'Done, prepare 2 bundles for King Fahd Road, Riyadh with Cash on Delivery')}
                    className="px-2 py-0.5 rounded bg-[#202c33] hover:bg-[#2a3942] text-[10px] text-emerald-300 border border-emerald-500/30 transition-all active:scale-95"
                  >
                    {isRTL ? 'تأكيد شراء (Closing ✅)' : 'Confirm Order (Closing ✅)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestBuyerText(isRTL ? 'هل ممكن تنزل لي بالسعر شوية؟ السعر مرتفع' : 'Can you lower the price a bit? Seems expensive')}
                    className="px-2 py-0.5 rounded bg-[#202c33] hover:bg-[#2a3942] text-[10px] text-amber-300 border border-amber-500/30 transition-all active:scale-95"
                  >
                    {isRTL ? 'اعتراض سعر (Objection 💬)' : 'Price Objection 💬'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestBuyerText(isRTL ? 'كم السعر وهل يوجد ضمان استبدال رسمي؟' : 'What is the price and is there official warranty?')}
                    className="px-2 py-0.5 rounded bg-[#202c33] hover:bg-[#2a3942] text-[10px] text-blue-300 border border-blue-500/30 transition-all active:scale-95"
                  >
                    {isRTL ? 'استفسار (Inquiry 🔍)' : 'Inquiry 🔍'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestBuyerText(isRTL ? 'وين رقم تتبع الشحنة ومتى يوصل المندوب؟' : 'Where is my tracking number and when will courier arrive?')}
                    className="px-2 py-0.5 rounded bg-[#202c33] hover:bg-[#2a3942] text-[10px] text-purple-300 border border-purple-500/30 transition-all active:scale-95"
                  >
                    {isRTL ? 'تتبع (Logistics 🚚)' : 'Logistics 🚚'}
                  </button>
                </div>
                <input
                  type="text"
                  value={testBuyerText}
                  onChange={e => setTestBuyerText(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#202c33] border border-[#2a3942] text-xs text-white outline-none focus:border-emerald-500 leading-relaxed wadeal-bidi"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#8696a0] block mb-1">
                  {t.api.activeContextLabel}
                </label>
                <div className="p-2.5 rounded-lg bg-[#202c33] border border-white/5 text-[11px] text-[#8696a0] max-h-20 overflow-y-auto leading-relaxed wadeal-bidi">
                  {businessContext}
                </div>
              </div>

              <button
                onClick={handleTestGenerate}
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-[#00a884] hover:bg-[#02b690] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                {isLoading ? t.api.processingInference : t.api.sendGenerateBtn}
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#182229] border border-white/5 space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-[#8696a0] block mb-1">
                  {t.api.licenseKeyLabel}
                </label>
                <input
                  type="text"
                  value={testKey}
                  onChange={e => setTestKey(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#202c33] border border-[#2a3942] text-xs text-white outline-none focus:border-emerald-500 font-mono"
                  placeholder="e.g. WADEAL-ANNUAL-LAUNCH50"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-[#202c33] border border-white/5 text-[11px] text-[#8696a0] space-y-1">
                <span className="font-semibold text-white block">
                  {t.api.preseededKeysLabel}
                </span>
                <div>• <code className="text-emerald-400">WADEAL-ANNUAL-LAUNCH50</code> {t.api.annualKeyName}</div>
                <div>• <code className="text-emerald-400">WADEAL-STARTER-9</code> {t.api.starterKeyName}</div>
                <div>• <code className="text-emerald-400">WADEAL-PRO-MONTHLY99</code> {t.api.monthlyKeyName}</div>
              </div>

              <button
                onClick={handleTestVerify}
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-[#00a884] hover:bg-[#02b690] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <Key className="w-3.5 h-3.5" />
                {isLoading ? t.api.verifyingKey : t.api.validateKeyBtn}
              </button>
            </div>
          )}
        </div>

        {/* Response JSON Inspector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8696a0] flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              {t.api.responseInspectorLabel}
            </span>
            {responseJson && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                {statusBadge}
              </span>
            )}
          </div>

          <div className="rounded-xl border border-[#2a3942] bg-[#0c1317] p-4 min-h-[220px] max-h-[300px] overflow-y-auto" dir="ltr">
            {responseJson ? (
              <pre className="text-xs font-mono text-emerald-300 leading-relaxed text-left">
                <code>{responseJson}</code>
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#8696a0] text-xs py-10">
                <span>{t.api.clickToSendPrompt}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
