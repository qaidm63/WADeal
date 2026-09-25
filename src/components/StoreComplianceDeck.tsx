import React from 'react';
import {
  ShieldCheck,
  CheckCircle,
  FileCheck,
  Tag
} from 'lucide-react';
import { Language, i18nDictionary } from '../utils/i18n';

interface StoreComplianceDeckProps {
  lang?: Language;
}

export const StoreComplianceDeck: React.FC<StoreComplianceDeckProps> = ({
  lang = 'en'
}) => {
  const t = i18nDictionary[lang];
  const isRTL = lang === 'ar';

  const keywords = [
    'WhatsApp Web AI',
    'Sales Assistant',
    'Quick Reply WhatsApp',
    'WhatsApp CRM',
    'Auto Text WhatsApp',
    'Deal Closer',
    'Objection Handling',
    'E-commerce WhatsApp'
  ];

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="bg-[#111b21] border border-emerald-950/60 rounded-2xl p-5 shadow-xl space-y-6 text-[#e9edef]"
    >
      {/* Header */}
      <div className="pb-4 border-b border-[#222e35]">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <h2 className="text-lg font-bold text-white">
            {t.compliance.title}
          </h2>
        </div>
        <p className="text-xs text-[#8696a0] mt-1 leading-relaxed">
          {t.compliance.subtitle}
        </p>
      </div>

      {/* Listing Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title & Description */}
        <div className="bg-[#182229] border border-white/5 rounded-xl p-4 space-y-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8696a0] block mb-1">
              {t.compliance.packageTitleLabel}
            </span>
            <div className="p-2.5 rounded-lg bg-[#202c33] text-sm font-semibold text-white border border-white/10 font-mono wadeal-bidi">
              {t.compliance.packageTitle}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8696a0] block mb-1">
              {t.compliance.descLabel}
            </span>
            <div className="p-2.5 rounded-lg bg-[#202c33] text-xs text-emerald-300 border border-white/10 leading-relaxed font-mono wadeal-bidi">
              {t.compliance.descText}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8696a0] block mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              {t.compliance.keywordsLabel}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {keywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md bg-[#202c33] text-[#e9edef] text-[11px] border border-white/5 font-medium font-mono"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Zero-Ban & Privacy Compliance Checklist */}
        <div className="bg-[#182229] border border-white/5 rounded-xl p-4 space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-2 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4" />
            {t.compliance.checklistLabel}
          </span>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-[#202c33] border border-emerald-500/20 flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">{t.compliance.singlePurposeTitle}</strong>
                <span className="text-[#8696a0] leading-relaxed block mt-0.5">
                  {t.compliance.singlePurposeDesc}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#202c33] border border-emerald-500/20 flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">{t.compliance.limitedUseTitle}</strong>
                <span className="text-[#8696a0] leading-relaxed block mt-0.5">
                  {t.compliance.limitedUseDesc}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#202c33] border border-emerald-500/20 flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">{t.compliance.noSpamTitle}</strong>
                <span className="text-[#8696a0] leading-relaxed block mt-0.5">
                  {t.compliance.noSpamDesc}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
