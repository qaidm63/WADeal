import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Smile,
  Paperclip,
  Mic,
  MoreVertical,
  Search,
  CheckCheck,
  Zap,
  RotateCcw,
  ShieldCheck,
  Crown,
  Languages,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import { Contact, ChatMessage, DealReply, LeadStatus } from '../types';
import { Language, i18nDictionary } from '../utils/i18n';

interface WhatsAppSimulatorProps {
  contacts: Contact[];
  businessContext: string;
  clientId: string;
  licenseKey: string;
  isPro: boolean;
  creditsRemaining: number;
  lang: Language;
  onToggleLang: () => void;
  onCreditsChange: (newCredits: number) => void;
  onOpenPaywall: () => void;
  onUpdateContactStatus: (contactId: string, status: LeadStatus) => void;
  onAddMessage: (contactId: string, message: ChatMessage) => void;
  onResetDemo: () => void;
}

export const WhatsAppSimulator: React.FC<WhatsAppSimulatorProps> = ({
  contacts,
  businessContext,
  clientId,
  licenseKey,
  isPro,
  creditsRemaining,
  lang,
  onToggleLang,
  onCreditsChange,
  onOpenPaywall,
  onUpdateContactStatus,
  onAddMessage,
  onResetDemo
}) => {
  const [selectedContactId, setSelectedContactId] = useState<string>(contacts[0]?.id || 'noura');
  const [inputText, setInputText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [smartReplies, setSmartReplies] = useState<DealReply[]>([]);
  const [detectedObjection, setDetectedObjection] = useState<string>('');
  const [dealState, setDealState] = useState<'CLOSING' | 'OBJECTION' | 'DISCOVERY' | 'LOGISTICS'>('DISCOVERY');
  const [showQuickCustomerReply, setShowQuickCustomerReply] = useState<boolean>(true);
  // Mobile/Foldable view switch: 'chats' list or active 'chat'
  const [mobileView, setMobileView] = useState<'chats' | 'chat'>('chat');

  const t = i18nDictionary[lang];
  const isRTL = lang === 'ar';

  const activeContact = contacts.find(c => c.id === selectedContactId) || contacts[0];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeContact?.messages, smartReplies]);

  // Clean state when contact changes
  useEffect(() => {
    setSmartReplies([]);
    setDetectedObjection('');
    setDealState('DISCOVERY');
  }, [selectedContactId]);

  // Handle triggering WADeal AI Closing engine
  const handleGenerateReply = async () => {
    if (!isPro && creditsRemaining <= 0) {
      onOpenPaywall();
      return;
    }

    // Ensure the scraped text is captured accurately from the last inbound message element
    const inboundMessages = (activeContact?.messages || []).filter(m => m.isIncoming);
    const lastCustomerMessage = inboundMessages.length > 0
      ? inboundMessages[inboundMessages.length - 1].text
      : activeContact?.lastMessage || '';

    if (!lastCustomerMessage.trim()) {
      console.error("WADeal: No customer message detected.");
      setDetectedObjection(isRTL ? '⚠️ لا توجد رسالة واردة' : '⚠️ No customer message');
      return;
    }

    setIsAnalyzing(true);
    try {
      const chatHistory = (activeContact?.messages || []).map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fetch('/api/v1/generate-deal-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          license_key: licenseKey,
          business_context: businessContext,
          chat_history: chatHistory,
          last_customer_message: lastCustomerMessage
        })
      });

      if (res.status === 402) {
        onCreditsChange(0);
        onOpenPaywall();
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to generate response');
      }

      const data = await res.json();
      setSmartReplies(data.replies || []);
      setDetectedObjection(data.objection_detected || (isRTL ? 'استفسار واعتراض' : 'Customer Inquiry'));
      
      if (data.deal_state) {
        setDealState(data.deal_state);
        if (data.deal_state === 'CLOSING') {
          onUpdateContactStatus(activeContact.id, 'won');
        } else if (data.deal_state === 'OBJECTION') {
          onUpdateContactStatus(activeContact.id, 'hot');
        }
      }

      if (typeof data.credits_remaining === 'number') {
        onCreditsChange(data.credits_remaining);
      }
    } catch (err) {
      console.error('Error generating WADeal suggestions:', err);
      setSmartReplies([]);
      setDetectedObjection(isRTL ? '⚠️ تعذر توليد الرد' : '⚠️ Generation failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // One-click injection into WhatsApp message input with instant auto-expansion
  const handleInjectReply = (replyText: string) => {
    setInputText(replyText);
    if (inputRef.current) {
      inputRef.current.focus();
      // Auto-grow height immediately to display all sentences without horizontal truncation
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.style.height = 'auto';
          const calculatedHeight = Math.min(Math.max(inputRef.current.scrollHeight, 42), 140);
          inputRef.current.style.height = `${calculatedHeight}px`;
          inputRef.current.selectionStart = inputRef.current.value.length;
          inputRef.current.selectionEnd = inputRef.current.value.length;
          inputRef.current.scrollTop = inputRef.current.scrollHeight;
        }
      }, 10);
    }
  };

  // Send message as Merchant
  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: 'm_' + Date.now(),
      sender: 'Merchant',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isIncoming: false
    };

    onAddMessage(activeContact.id, newMsg);
    setInputText('');
    setDetectedObjection('');

    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    setTimeout(() => {
      setShowQuickCustomerReply(true);
    }, 1200);
  };

  const handleSimulateCustomerReply = (text: string) => {
    const custMsg: ChatMessage = {
      id: 'cust_' + Date.now(),
      sender: 'Customer',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isIncoming: true
    };
    onAddMessage(activeContact.id, custMsg);
    // Reset previous smart replies so user can trigger fresh engine inference
    setSmartReplies([]);
    setDetectedObjection('');
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="flex h-full w-full rounded-2xl overflow-hidden border border-emerald-900/30 bg-[#0c1317] shadow-2xl relative select-none"
    >
      {/* LEFT SIDEBAR - WhatsApp Web Conversations (Responsive for Mobile/Foldable) */}
      <div
        className={`w-full md:w-80 lg:w-96 flex-col bg-[#111b21] flex-shrink-0 border-inline-end border-[#222e35] transition-all ${
          mobileView === 'chats' ? 'flex' : 'hidden md:flex'
        }`}
      >
        {/* Top User Bar */}
        <div className="h-16 px-4 flex items-center justify-between bg-[#202c33] border-b border-[#222e35] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-700/60 border border-emerald-500/40 flex items-center justify-center font-bold text-white text-sm">
              WM
            </div>
            <div>
              <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                <span>{t.simulator.myStore}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                  {t.simulator.onlineBadge}
                </span>
              </div>
              <div className="text-xs text-[#8696a0]">WhatsApp Business</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleLang}
              title={isRTL ? 'التحويل إلى الإنجليزية' : 'Switch to Arabic'}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#2a3942] hover:bg-[#374248] text-emerald-400 border border-emerald-500/30 transition-all active:scale-95"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{t.langSwitch}</span>
            </button>

            <button
              onClick={onResetDemo}
              title={t.nav.resetDemo}
              className="p-1.5 rounded-lg text-[#8696a0] hover:text-white hover:bg-[#374248] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-2.5 bg-[#111b21] flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#202c33] text-[#8696a0] text-xs">
            <Search className="w-3.5 h-3.5" />
            <input
              type="text"
              placeholder={t.simulator.searchPlaceholder}
              className="bg-transparent border-none outline-none text-white text-xs w-full placeholder-[#8696a0]"
              readOnly
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#202c33]/50">
          {contacts.map(contact => {
            const isSelected = contact.id === selectedContactId;
            return (
              <div
                key={contact.id}
                onClick={() => {
                  setSelectedContactId(contact.id);
                  setSmartReplies([]);
                  setDetectedObjection('');
                  setMobileView('chat');
                }}
                className={`px-3.5 py-3 flex items-center gap-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]/60'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#2a3942]"
                  />
                  {contact.leadStatus === 'hot' && (
                    <span className="absolute -top-1 -inset-inline-end-1 text-xs bg-red-500/90 text-white rounded-full p-0.5 shadow">
                      🔥
                    </span>
                  )}
                  {contact.leadStatus === 'won' && (
                    <span className="absolute -top-1 -inset-inline-end-1 text-xs bg-emerald-500/90 text-white rounded-full p-0.5 shadow">
                      ✅
                    </span>
                  )}
                  {contact.leadStatus === 'followup' && (
                    <span className="absolute -top-1 -inset-inline-end-1 text-xs bg-amber-500/90 text-white rounded-full p-0.5 shadow">
                      ⏳
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-medium text-sm text-[#e9edef] truncate">
                      {contact.name}
                    </span>
                    <span className="text-[11px] text-[#8696a0] font-mono">{contact.lastTime}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#8696a0] truncate max-w-[180px] wadeal-bidi">
                      {contact.messages[contact.messages.length - 1]?.text || contact.lastMessage}
                    </p>
                    {contact.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#25d366] text-black text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Status label tag */}
                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    {contact.leadStatus === 'hot' && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-medium whitespace-nowrap">
                        {t.tags.hot}
                      </span>
                    )}
                    {contact.leadStatus === 'followup' && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium whitespace-nowrap">
                        {t.tags.followUp}
                      </span>
                    )}
                    {contact.leadStatus === 'won' && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium whitespace-nowrap">
                        {t.tags.won}
                      </span>
                    )}
                    <span className="text-[10px] text-[#667781] truncate">
                      • {contact.suggestedPrompt}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANE - Active WhatsApp Chat (Responsive for Mobile/Foldable) */}
      <div
        className={`flex-1 flex-col bg-[#0b141a] relative min-w-0 ${
          mobileView === 'chat' ? 'flex' : 'hidden md:flex'
        }`}
      >
        {/* Chat Header */}
        <div className="h-16 px-3 sm:px-4 flex items-center justify-between bg-[#202c33] border-b border-[#222e35] z-10 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Back Button to conversation list */}
            <button
              onClick={() => setMobileView('chats')}
              className="md:hidden p-1.5 rounded-lg text-[#8696a0] hover:text-white transition-colors"
              title={t.simulator.showChatList}
            >
              <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </button>

            <img
              src={activeContact.avatar}
              alt={activeContact.name}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-[#2a3942] flex-shrink-0"
            />
            <div className="truncate">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-sm font-semibold text-[#e9edef] truncate">
                  {activeContact.name}
                </span>
                <span className="text-xs text-[#8696a0] font-mono hidden lg:inline">
                  {activeContact.phone}
                </span>
              </div>
              <div className="text-xs text-[#00a884] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00a884]"></span>
                <span className="truncate">{t.simulator.online}</span>
              </div>
            </div>
          </div>

          {/* Local Lead Status Tagger Badge */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            <div className="flex items-center gap-1.5 bg-[#111b21] px-2 py-1 rounded-xl border border-white/10 shadow-sm">
              <span className="text-[11px] text-[#8696a0] hidden xl:inline">{t.simulator.leadStage}</span>
              <select
                value={activeContact.leadStatus}
                onChange={e => onUpdateContactStatus(activeContact.id, e.target.value as LeadStatus)}
                className={`text-xs font-semibold py-0.5 px-2 rounded-lg cursor-pointer outline-none transition-all ${
                  activeContact.leadStatus === 'hot'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : activeContact.leadStatus === 'followup'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : activeContact.leadStatus === 'won'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-[#202c33] text-[#8696a0] border border-white/10'
                }`}
              >
                <option value="none">{t.tags.setStage}</option>
                <option value="hot">{t.tags.hot}</option>
                <option value="followup">{t.tags.followUp}</option>
                <option value="won">{t.tags.won}</option>
              </select>
            </div>

            <button
              onClick={() => setShowQuickCustomerReply(prev => !prev)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                showQuickCustomerReply
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-[#202c33] text-[#8696a0] hover:text-white border border-white/10'
              }`}
              title={isRTL ? 'محاكاة ردود العميل لجميع المراحل' : 'Simulate customer messages across all 4 stages'}
            >
              <span>🧪</span>
              <span className="hidden sm:inline">{isRTL ? 'محاكاة المراحل' : 'Stages'}</span>
            </button>

            <div className="flex items-center gap-1 sm:gap-2 text-[#aebac1]">
              <Search className="w-4 h-4 cursor-pointer hover:text-white hidden sm:inline" />
              <MoreVertical className="w-4 h-4 cursor-pointer hover:text-white" />
            </div>
          </div>
        </div>

        {/* WhatsApp Chat Messages Stream with Punctuation Isolation */}
        <div
          className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 relative"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(17, 27, 33, 0.7) 0%, rgba(11, 20, 26, 0.95) 100%)`
          }}
        >
          {/* Subtle Security & Anti-Spam Badge */}
          <div className="flex justify-center my-1.5">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#182229] border border-white/5 text-[11px] text-[#ffd279] shadow-sm max-w-md text-center">
              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="wadeal-bidi">{t.trustBanner}</span>
            </div>
          </div>

          {activeContact.messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.isIncoming ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-3.5 py-2 shadow relative text-sm ${
                  msg.isIncoming
                    ? 'bg-[#202c33] text-[#e9edef] rounded-tl-sm'
                    : 'bg-[#005c4b] text-[#e9edef] rounded-tr-sm'
                }`}
              >
                <div className="leading-relaxed whitespace-pre-wrap wadeal-message-bubble wadeal-bidi">{msg.text}</div>
                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#8696a0]">
                  <span className="font-mono">{msg.timestamp}</span>
                  {!msg.isIncoming && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
                </div>
              </div>
            </div>
          ))}

          {/* 4-Stage Simulated Customer Interaction Toolbar */}
          {showQuickCustomerReply && (
            <div className="flex justify-start my-2 animate-fade-in">
              <div className="bg-[#182229] border border-emerald-500/30 rounded-xl p-2.5 text-xs text-[#e9edef] flex items-center gap-2 shadow-lg flex-wrap">
                <span className="text-emerald-400 font-bold whitespace-nowrap">{t.simulator.simulateCustomerTitle}</span>
                
                {/* 1. Stage: Closing */}
                <button
                  onClick={() => handleSimulateCustomerReply(
                    isRTL
                      ? 'تمام يا غالي، جهز لي حبتين بالعرض على طريق الملك فهد بالرياض والدفع عند الاستلام.'
                      : 'Great! Please deliver 2 bundles to: King Fahd Rd, Riyadh. Cash on delivery.'
                  )}
                  className="px-2.5 py-1 rounded bg-[#202c33] hover:bg-[#2a3942] text-emerald-300 text-[11px] transition-colors border border-emerald-500/30 font-medium whitespace-nowrap active:scale-95"
                >
                  {t.simulator.simulateConfirmDeal}
                </button>

                {/* 2. Stage: Objection */}
                <button
                  onClick={() => handleSimulateCustomerReply(
                    isRTL
                      ? 'هل ممكن تنزل لي بالسعر شوية؟ السعر حسيته مرتفع شوي.'
                      : 'Can you do a bit more discount? The price feels a bit high.'
                  )}
                  className="px-2.5 py-1 rounded bg-[#202c33] hover:bg-[#2a3942] text-amber-300 text-[11px] transition-colors border border-amber-500/30 font-medium whitespace-nowrap active:scale-95"
                >
                  {t.simulator.simulateAskDiscount}
                </button>

                {/* 3. Stage: Discovery / Specs */}
                <button
                  onClick={() => handleSimulateCustomerReply(
                    isRTL
                      ? 'كم السعر وهل المنتج أصلي مع ضمان استبدال رسمي؟'
                      : 'What is the price and does it come with an official replacement warranty?'
                  )}
                  className="px-2.5 py-1 rounded bg-[#202c33] hover:bg-[#2a3942] text-blue-300 text-[11px] transition-colors border border-blue-500/30 font-medium whitespace-nowrap active:scale-95"
                >
                  {t.simulator.simulateAskWarranty}
                </button>

                {/* 4. Stage: Logistics */}
                <button
                  onClick={() => handleSimulateCustomerReply(
                    isRTL
                      ? 'وين رقم تتبع الشحنة ومتى يوصل المندوب لعندي؟'
                      : 'Where is my order tracking number and when will the courier arrive?'
                  )}
                  className="px-2.5 py-1 rounded bg-[#202c33] hover:bg-[#2a3942] text-purple-300 text-[11px] transition-colors border border-purple-500/30 font-medium whitespace-nowrap active:scale-95"
                >
                  {t.simulator.simulateTracking}
                </button>

                <button
                  onClick={() => setShowQuickCustomerReply(false)}
                  className="text-[#8696a0] hover:text-white text-xs px-1 ms-auto"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* TWO-TIER WADEAL DOCK CONTAINER (Separated Chips Tier + Controls Tier) */}
        <div
          className="wadeal-dock-container flex flex-col gap-2 p-2.5 sm:px-3 bg-[#111b21]/95 backdrop-blur-md border-t border-[#222e35] z-20 flex-shrink-0"
          style={{ background: 'rgba(17, 27, 33, 0.96)' }}
        >
          {/* TIER 1: Dedicated Full-Width Suggestion Chips Shelf (Visible & Fully Clickable) */}
          <div className="wadeal-chips-shelf flex items-center gap-2 w-full overflow-x-auto whitespace-nowrap scrollbar-none py-0.5 min-h-[36px]">
            {smartReplies.length > 0 ? (
              smartReplies.map((reply, idx) => {
                const isPersuasive = reply.type === 'Persuasive';
                const isDirect = reply.type === 'Direct';
                const isUrgent = reply.type === 'Urgent';

                return (
                  <div key={idx} className="relative group inline-block flex-shrink-0 animate-fade-in">
                    <button
                      onClick={() => handleInjectReply(reply.text)}
                      className={`wadeal-suggestion-chip text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all active:scale-95 whitespace-nowrap flex items-center gap-1.5 shadow-sm cursor-pointer ${
                        isPersuasive
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500 hover:text-[#111b21] hover:border-emerald-500'
                          : isDirect
                          ? 'bg-blue-500/15 text-blue-400 border-blue-500/40 hover:bg-blue-500 hover:text-white hover:border-blue-500'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/40 hover:bg-amber-500 hover:text-[#111b21] hover:border-amber-500'
                      }`}
                      data-type={reply.type.toLowerCase()}
                    >
                      <span>{isPersuasive ? '⚡' : isDirect ? '🎯' : '🔥'}</span>
                      <strong className="font-bold">
                        {isPersuasive ? t.chips.persuasive : isDirect ? t.chips.direct : t.chips.urgent}:
                      </strong>
                      <span className="truncate max-w-[180px] sm:max-w-[260px] lg:max-w-[340px] wadeal-chip-text wadeal-bidi">
                        {reply.short_label}
                      </span>
                    </button>

                    {/* Clean Hover Preview Tooltip showing full text */}
                    <div className="chip-preview-tooltip absolute bottom-full mb-2 start-0 w-80 max-w-[85vw] p-3 rounded-xl bg-[#202c33] border border-white/15 shadow-2xl text-xs text-white opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150 z-50 whitespace-normal text-start">
                      <div className="flex items-center justify-between font-bold text-emerald-400 mb-1">
                        <span>{isPersuasive ? t.chips.persuasive : isDirect ? t.chips.direct : t.chips.urgent} ({reply.short_label})</span>
                        <span className="text-[10px] text-[#8696a0] font-normal">{t.simulator.clickToInject}</span>
                      </div>
                      <p className="text-slate-200 text-xs leading-relaxed italic wadeal-bidi">
                        "{reply.text}"
                      </p>
                    </div>
                  </div>
                );
              })
            ) : isAnalyzing ? (
              <div className="flex items-center gap-2 py-1 px-2 text-xs text-emerald-400 font-medium animate-pulse">
                <Zap className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>{isRTL ? 'جارٍ قراءة استفسار العميل وصياغة الرد المباشر...' : 'Reading customer inquiry & generating direct answer...'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 py-1 px-1.5 text-xs text-[#8696a0] font-medium">
                <span className="text-emerald-400 font-bold">⚡</span>
                <span>{isRTL ? 'انقر فوق "⚡ رد WADeal الذكي" بالأسفل للإجابة المباشرة على استفسار العميل' : 'Click "⚡ WADeal Reply" below to directly answer customer inquiry'}</span>
              </div>
            )}
          </div>

          {/* TIER 2: Controls & Action Bar (Separated from Chips) */}
          <div className="wadeal-controls-bar flex items-center justify-between w-full gap-3 pt-1 border-t border-white/5">
            {/* Controls Start: Action Trigger Button & Info Icon & Stage Badge */}
            <div className="controls-start flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleGenerateReply}
                disabled={isAnalyzing}
                className={`wadeal-main-trigger-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-md flex-shrink-0 cursor-pointer ${
                  isAnalyzing
                    ? 'bg-emerald-800 text-white cursor-wait animate-pulse'
                    : 'bg-gradient-to-r from-[#00a884] to-[#008069] hover:from-[#02b690] hover:to-[#009378] text-white active:scale-95'
                }`}
              >
                <Zap className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span className="whitespace-nowrap">
                  {isAnalyzing ? t.simulator.analyzing : t.replyBtn}
                </span>
              </button>

              {/* Non-colliding lightweight tooltip */}
              <div className="relative group flex items-center">
                <span
                  className="wadeal-info-icon p-1 text-[#8696a0] hover:text-emerald-400 cursor-pointer transition-colors"
                  title={t.simulator.helperTooltip}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </span>
                <div className="absolute bottom-full mb-2 start-0 w-64 p-2.5 rounded-xl bg-[#202c33] border border-white/10 shadow-2xl text-[11px] text-slate-200 leading-snug opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150 z-50 whitespace-normal text-start">
                  {t.simulator.helperTooltip}
                </div>
              </div>

              {/* Objection Detected Pill (Unclipped & Non-breaking with Stage Distinction) */}
              {detectedObjection && (
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 wadeal-bidi transition-all shadow-sm ${
                  dealState === 'CLOSING'
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 shadow-emerald-950/40'
                    : dealState === 'OBJECTION'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                    : dealState === 'LOGISTICS'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40'
                    : 'bg-white/5 text-emerald-300 border border-emerald-500/20'
                }`}>
                  {dealState === 'CLOSING' ? '👑' : dealState === 'OBJECTION' ? '⚠️' : dealState === 'LOGISTICS' ? '🚚' : '🎯'} {detectedObjection}
                </span>
              )}
            </div>

            {/* Controls End: Language Switcher & Pro Badge / Credits */}
            <div className="controls-end flex items-center gap-2 flex-shrink-0 ms-auto">
              {/* Language toggle inside action bar */}
              <button
                onClick={onToggleLang}
                className="wadeal-lang-switch text-[11px] px-2.5 py-1 rounded-md bg-[#202c33] hover:bg-[#2a3942] text-[#8696a0] hover:text-white border border-white/10 transition-colors whitespace-nowrap font-medium flex items-center gap-1.5 cursor-pointer"
                title={isRTL ? 'Switch to English' : 'التحويل للعربية'}
              >
                <Languages className="w-3 h-3 text-emerald-400" />
                <span>{t.langSwitch} 🌐</span>
              </button>

              {isPro ? (
                <div
                  className="wadeal-pro-badge flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30 whitespace-nowrap flex-shrink-0"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>{t.badgePro}</span>
                </div>
              ) : (
                <button
                  onClick={onOpenPaywall}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 whitespace-nowrap flex-shrink-0 cursor-pointer ${
                    creditsRemaining <= 5
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                      : 'bg-[#202c33] text-[#8696a0] hover:text-white border border-white/10'
                  }`}
                  style={{ whiteSpace: 'nowrap' }}
                  title={isRTL ? 'الرصيد التجريبي المتبقي' : 'Remaining free deal-closing credits'}
                >
                  <span>{t.nav.creditsRemainingLabel(creditsRemaining)}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ONE-CLICK INJECTION TARGET - WhatsApp Message Input Container */}
        <div className="wadeal-input-container p-3 bg-[#202c33] flex items-end gap-2 sm:gap-3 z-10 border-t border-[#222e35]/50 flex-shrink-0 min-h-[52px]">
          <div className="flex items-center gap-1 text-[#8696a0] pb-2">
            <Smile className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
            <Paperclip className="w-5 h-5 cursor-pointer hover:text-white transition-colors hidden sm:inline" />
          </div>

          <div className="flex-1 bg-[#2a3942] rounded-xl px-3 py-1.5 flex items-center min-h-[42px]">
            <textarea
              ref={inputRef}
              rows={1}
              value={inputText}
              onChange={e => {
                setInputText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(Math.max(e.target.scrollHeight, 42), 140)}px`;
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={t.simulator.inputPlaceholder}
              className="wadeal-chat-input message-input-area w-full bg-transparent text-[14.5px] text-[#e9edef] placeholder-[#8696a0] outline-none resize-none leading-relaxed wadeal-bidi overflow-y-auto"
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                minHeight: '42px',
                maxHeight: '140px',
                lineHeight: 1.5,
                fontSize: '14.5px'
              }}
            />
          </div>

          <div className="pb-1.5">
            {inputText.trim() ? (
              <button
                onClick={handleSendMessage}
                className="p-2.5 rounded-full bg-[#00a884] hover:bg-[#02b690] text-white transition-transform active:scale-90 flex-shrink-0 cursor-pointer"
                title="Send Message"
              >
                <Send className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              <button className="p-2 text-[#8696a0] hover:text-white transition-colors flex-shrink-0 cursor-pointer" title="Voice Message">
                <Mic className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
