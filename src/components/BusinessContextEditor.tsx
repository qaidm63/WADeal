import React, { useState, useEffect } from 'react';
import {
  Building2,
  Sparkles,
  Save,
  Check,
  Layers
} from 'lucide-react';
import { getPresetsForLanguage } from '../utils/constants';
import { Language, i18nDictionary } from '../utils/i18n';

interface BusinessContextEditorProps {
  businessContext: string;
  lang?: Language;
  onSaveContext: (newContext: string) => void;
}

export const BusinessContextEditor: React.FC<BusinessContextEditorProps> = ({
  businessContext,
  lang = 'en',
  onSaveContext
}) => {
  const [currentText, setCurrentText] = useState<string>(businessContext);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Synchronize internal text if external businessContext changes (e.g. language toggle)
  useEffect(() => {
    setCurrentText(businessContext);
  }, [businessContext]);

  const t = i18nDictionary[lang];
  const isRTL = lang === 'ar';
  const presets = getPresetsForLanguage(lang);

  const handleApplyPreset = (presetText: string) => {
    setCurrentText(presetText);
    onSaveContext(presetText);
    triggerSuccess();
  };

  const handleManualSave = () => {
    onSaveContext(currentText.trim());
    triggerSuccess();
  };

  const triggerSuccess = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="bg-[#111b21] border border-emerald-950/60 rounded-2xl p-5 shadow-xl space-y-5 text-[#e9edef]"
    >
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#222e35]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Building2 className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">
              {t.context.title}
            </h2>
          </div>
          <p className="text-xs text-[#8696a0] mt-1 leading-relaxed">
            {t.context.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {savedSuccess && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 animate-fade-in">
              <Check className="w-3.5 h-3.5" /> {t.context.savedToast}
            </span>
          )}
          <button
            onClick={handleManualSave}
            className="px-4 py-2 rounded-xl bg-[#00a884] hover:bg-[#02b690] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            {t.context.saveBtn}
          </button>
        </div>
      </div>

      {/* Preset Quick Selectors */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8696a0] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            {t.context.presetsLabel}
          </span>
          <span className="text-[11px] text-[#667781]">{t.context.presetsSub}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {presets.map(preset => {
            const isActive = currentText === preset.context;
            return (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset.context)}
                className={`p-3 rounded-xl border text-start transition-all relative ${
                  isActive
                    ? 'border-emerald-500 bg-emerald-950/30 shadow-md'
                    : 'border-[#222e35] bg-[#182229]/60 hover:border-[#374248]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{preset.icon}</span>
                  <span className="text-xs font-bold text-white truncate">{preset.name}</span>
                </div>
                <p className="text-[11px] text-[#8696a0] line-clamp-2 leading-relaxed">
                  {preset.context}
                </p>
                {isActive && (
                  <span className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold`}>
                    {t.context.activeBadge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Free-Text Context Engine Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="context-input" className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {t.context.activeRulesLabel}
          </label>
          <span className="text-[11px] text-[#8696a0] font-mono">
            {currentText.length} {t.context.charsLabel}
          </span>
        </div>

        <textarea
          id="context-input"
          rows={4}
          value={currentText}
          onChange={e => setCurrentText(e.target.value)}
          placeholder={t.contextPlaceholder}
          className="w-full p-3.5 rounded-xl bg-[#202c33] border border-[#2a3942] focus:border-emerald-500 text-sm text-[#e9edef] placeholder-[#8696a0] outline-none transition-all leading-relaxed"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-2.5 rounded-lg bg-[#182229] border border-white/5 flex items-start gap-2">
            <span className="text-emerald-400 font-bold whitespace-nowrap">{t.context.pricingTipTitle}</span>
            <span className="text-[#8696a0]">{t.context.pricingTip}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#182229] border border-white/5 flex items-start gap-2">
            <span className="text-blue-400 font-bold whitespace-nowrap">{t.context.fulfillmentTipTitle}</span>
            <span className="text-[#8696a0]">{t.context.fulfillmentTip}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#182229] border border-white/5 flex items-start gap-2">
            <span className="text-amber-400 font-bold whitespace-nowrap">{t.context.guaranteeTipTitle}</span>
            <span className="text-[#8696a0]">{t.context.guaranteeTip}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
