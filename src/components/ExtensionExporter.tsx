import React, { useState } from 'react';
import {
  Download,
  FolderArchive,
  FileCode,
  Copy,
  Check,
  Terminal
} from 'lucide-react';
import { EXTENSION_FILES, downloadExtensionZip } from '../utils/extensionFiles';
import { Language, i18nDictionary } from '../utils/i18n';

interface ExtensionExporterProps {
  lang?: Language;
}

export const ExtensionExporter: React.FC<ExtensionExporterProps> = ({
  lang = 'en'
}) => {
  const [selectedFile, setSelectedFile] = useState(EXTENSION_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const t = i18nDictionary[lang];
  const isRTL = lang === 'ar';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadExtensionZip();
    } catch (e) {
      console.error('Download error:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="bg-[#111b21] border border-emerald-950/60 rounded-2xl p-5 shadow-xl space-y-6 text-[#e9edef]"
    >
      {/* Header with 1-Click Download Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222e35]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <FolderArchive className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">
              {t.extension.title}
            </h2>
          </div>
          <p className="text-xs text-[#8696a0] mt-1 leading-relaxed">
            {t.extension.subtitle}
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00a884] to-[#008069] hover:from-[#02b690] hover:to-[#009378] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/50 active:scale-95 disabled:opacity-50 whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          {isDownloading ? t.extension.packagingText : t.extension.downloadBtn}
        </button>
      </div>

      {/* Chrome Installation Walkthrough */}
      <div className="bg-[#182229] border border-emerald-500/20 rounded-xl p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          {t.extension.howToTitle}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#202c33] border border-white/5 space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">1</span>
              {t.extension.step1Title}
            </div>
            <p className="text-[#8696a0] leading-relaxed">
              {t.extension.step1Desc}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#202c33] border border-white/5 space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">2</span>
              {t.extension.step2Title}
            </div>
            <p className="text-[#8696a0] leading-relaxed">
              {t.extension.step2Desc}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#202c33] border border-white/5 space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">3</span>
              {t.extension.step3Title}
            </div>
            <p className="text-[#8696a0] leading-relaxed">
              {t.extension.step3Desc}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Code Explorer */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#8696a0] uppercase tracking-wider flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-400" />
            {t.extension.sourceExplorerTitle}
          </span>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#202c33] hover:bg-[#2a3942] text-xs text-[#8696a0] hover:text-white transition-colors whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">{t.extension.copiedBtn}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{t.extension.copyCodeBtn}</span>
              </>
            )}
          </button>
        </div>

        {/* File Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" dir="ltr">
          {EXTENSION_FILES.map(file => {
            const isSelected = selectedFile.name === file.name;
            return (
              <button
                key={file.name}
                onClick={() => setSelectedFile(file)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-[#202c33] text-[#8696a0] hover:text-white border border-transparent'
                }`}
              >
                {file.name}
              </button>
            );
          })}
        </div>

        {/* Code Display Area */}
        <div className="relative rounded-xl overflow-hidden border border-[#2a3942] bg-[#0c1317]" dir="ltr">
          <div className="flex items-center justify-between px-4 py-2 bg-[#182229] border-b border-[#2a3942] text-xs font-mono text-[#8696a0]">
            <span>{selectedFile.path}</span>
            <span>{selectedFile.language.toUpperCase()}</span>
          </div>
          <pre className="p-4 text-xs font-mono text-emerald-200/90 overflow-x-auto max-h-[380px] leading-relaxed text-left">
            <code>{selectedFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
