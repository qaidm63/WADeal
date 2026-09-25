import JSZip from 'jszip';

export interface ExtensionFile {
  name: string;
  path: string;
  language: string;
  content: string;
}

export const EXTENSION_FILES: ExtensionFile[] = [
  {
    name: 'manifest.json',
    path: 'manifest.json',
    language: 'json',
    content: `{
  "manifest_version": 3,
  "name": "WADeal: AI Sales Assistant & Quick Reply for WhatsApp Web",
  "version": "1.0.0",
  "description": "Turn WhatsApp conversations into paid deals. Instant AI sales replies, objection handling, and quick answers grounded in your business pricing.",
  "permissions": [
    "storage"
  ],
  "host_permissions": [
    "https://web.whatsapp.com/*",
    "http://localhost:3000/*",
    "https://*/*"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_title": "WADeal Settings & Business Context"
  },
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": [
        "https://web.whatsapp.com/*"
      ],
      "js": [
        "content.js"
      ],
      "css": [
        "content.css"
      ],
      "run_at": "document_idle"
    }
  ],
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}`
  },
  {
    name: 'content.js',
    path: 'content.js',
    language: 'javascript',
    content: `// WADeal Content Script for WhatsApp Web (Manifest V3)
(() => {
  const DEFAULT_BACKEND_URL = 'http://localhost:3000';
  let cachedClientId = null;
  let isGenerating = false;
  let currentReplies = [];
  let currentObjection = '';
  let activeChatContact = 'Current Customer';
  let currentLang = 'en';

  const i18nDictionary = {
    en: {
      replyBtn: "⚡ WADeal Reply",
      badgePro: "PRO UNLIMITED",
      chips: {
        persuasive: "⚡ Persuasive",
        direct: "🎯 Direct & Clear",
        urgent: "🔥 Urgent Offer"
      },
      tags: {
        hot: "🔥 Hot / Ready to Buy",
        followUp: "⏳ Follow-up",
        won: "✅ Deal Won",
        setStage: "🏷️ Set Lead Status"
      },
      contextPlaceholder: "Enter your business pricing, policies, and terms...",
      trustBanner: "Messages are end-to-end encrypted. WADeal acts 100% human-in-the-loop with zero ban risk.",
      langSwitch: "عربي",
      clickToInject: "Click chip to inject into chat",
      helperTooltip: "Click ⚡ WADeal Reply to generate 3 tailored closing replies grounded in your business rules.",
      analyzing: "Analyzing..."
    },
    ar: {
      replyBtn: "⚡ رد WADeal الذكي",
      badgePro: "برو غير محدود 👑",
      chips: {
        persuasive: "⚡ إقناعي ومفصل",
        direct: "🎯 حاسم وسريع",
        urgent: "🔥 عرض خاص / حسم"
      },
      tags: {
        hot: "🔥 جاهز للشراء",
        followUp: "⏳ متابعة",
        won: "✅ صفقة ناجحة",
        setStage: "🏷️ تحديد مرحلة العميل"
      },
      contextPlaceholder: "أدخل أسعارك، عروضك، وسياسات التوصيل والضمان هنا...",
      trustBanner: "الرسائل مشفرة تماماً. تعمل WADeal بتوافق بشري 100% دون أي خطر للحظر.",
      langSwitch: "English",
      clickToInject: "انقر للحقن المباشر في مربع الكتابة",
      helperTooltip: "انقر فوق ⚡ رد WADeal لتوليد 3 ردود مبيعات ذكية مقنعة تستند لأسعار متجرك.",
      analyzing: "جارٍ التحليل..."
    }
  };

  function getI18n() {
    return i18nDictionary[currentLang] || i18nDictionary.en;
  }

  function getClientConfig() {
    return new Promise((resolve) => {
      chrome.storage.local.get([
        'wadeal_client_id',
        'wadeal_backend_url',
        'wadeal_business_context',
        'wadeal_license_key',
        'wadeal_lang'
      ], (res) => {
        let cid = res.wadeal_client_id;
        if (!cid) {
          cid = 'wadeal_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
          chrome.storage.local.set({ wadeal_client_id: cid });
        }
        cachedClientId = cid;
        currentLang = res.wadeal_lang || 'en';

        resolve({
          clientId: cid,
          backendUrl: res.wadeal_backend_url || DEFAULT_BACKEND_URL,
          businessContext: res.wadeal_business_context || 'Standard e-commerce store with 24-48h delivery, 14-day warranty, and COD available.',
          licenseKey: res.wadeal_license_key || '',
          lang: currentLang
        });
      });
    });
  }

  function extractActiveChatContext() {
    const messages = [];
    const headerTitle = document.querySelector('header span[dir="auto"], header div[role="button"] span[title]');
    if (headerTitle) {
      activeChatContact = headerTitle.getAttribute('title') || headerTitle.innerText || 'Customer';
    }

    const msgNodes = document.querySelectorAll('div[data-pre-plain-text], .message-in, .message-out, div[role="row"]');
    const nodesArray = Array.from(msgNodes);
    const recentNodes = nodesArray.slice(-8);

    recentNodes.forEach(node => {
      const textElem = node.querySelector('.selectable-text span, span.selectable-text, ._ao3e') || node.querySelector('.selectable-text') || node;
      const text = textElem.innerText?.trim();
      if (!text || text.length === 0) return;

      const isOutgoing = node.classList.contains('message-out') ||
                         node.getAttribute('data-pre-plain-text')?.includes('You:') ||
                         node.closest('.message-out') !== null;

      messages.push({
        sender: isOutgoing ? 'Merchant (You)' : (activeChatContact || 'Customer'),
        text: text
      });
    });

    return messages;
  }

  function injectIntoWhatsAppInput(textToInject) {
    injectFullTextIntoWhatsApp(textToInject);
  }

  function injectFullTextIntoWhatsApp(textToInsert) {
    const inputField = document.querySelector('footer div[contenteditable="true"]') ||
                       document.querySelector('footer div[contenteditable="true"][data-tab="10"]') ||
                       document.querySelector('div[contenteditable="true"][data-tab="10"]') ||
                       document.querySelector('div[contenteditable="true"][role="textbox"]') ||
                       document.querySelector('div[contenteditable="true"]');

    if (!inputField) {
      console.error("WADeal: Chat input field not found.");
      return;
    }

    inputField.focus();

    const success = document.execCommand('insertText', false, textToInsert);
    if (!success) {
      inputField.innerText = textToInsert;
    }

    inputField.dispatchEvent(new Event('input', { bubbles: true }));
    inputField.dispatchEvent(new Event('change', { bubbles: true }));

    inputField.scrollTop = inputField.scrollHeight;

    try {
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(inputField);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    } catch (e) {
      // Fallback
    }
  }

  function updateLeadHeaderBadge(stage) {
    const select = document.querySelector('#wadeal-lead-header-badge select');
    if (select) {
      select.value = stage;
      updateBadgeStyle(select, stage);
      const contactKey = 'wadeal_lead_' + encodeURIComponent(activeChatContact || 'default');
      chrome.storage.local.set({ [contactKey]: stage });
    }
  }

  function mountHeaderLeadBadge() {
    const header = document.querySelector('header');
    if (!header || document.getElementById('wadeal-lead-header-badge')) return;

    const t = getI18n();
    const contactKey = 'wadeal_lead_' + encodeURIComponent(activeChatContact || 'default');

    const badgeContainer = document.createElement('div');
    badgeContainer.id = 'wadeal-lead-header-badge';
    badgeContainer.className = 'wadeal-header-badge';

    const select = document.createElement('select');
    select.className = 'wadeal-badge-select';
    select.innerHTML = \`
      <option value="none">\${t.tags.setStage}</option>
      <option value="hot">\${t.tags.hot}</option>
      <option value="followup">\${t.tags.followUp}</option>
      <option value="won">\${t.tags.won}</option>
    \`;

    chrome.storage.local.get([contactKey], (res) => {
      const savedStatus = res[contactKey] || 'none';
      select.value = savedStatus;
      updateBadgeStyle(select, savedStatus);
    });

    select.addEventListener('change', (e) => {
      const newStatus = e.target.value;
      updateBadgeStyle(select, newStatus);
      chrome.storage.local.set({ [contactKey]: newStatus });
    });

    badgeContainer.appendChild(select);
    const titleArea = header.querySelector('div[role="button"]') || header.children[1] || header;
    if (titleArea && titleArea.parentElement) {
      titleArea.parentElement.insertBefore(badgeContainer, titleArea.nextSibling);
    }
  }

  function updateBadgeStyle(selectEl, status) {
    selectEl.classList.remove('status-hot', 'status-followup', 'status-won');
    if (status === 'hot') selectEl.classList.add('status-hot');
    if (status === 'followup') selectEl.classList.add('status-followup');
    if (status === 'won') selectEl.classList.add('status-won');
  }

  async function triggerWADealGenerate() {
    if (isGenerating) return;

    // Ensure the scraped text is captured accurately from the last inbound message element
    const lastCustomerMessage = document.querySelector('.message-in:last-of-type .selectable-text')?.innerText?.trim() ||
                                document.querySelector('.message-in:last-of-type span.selectable-text')?.innerText?.trim() ||
                                document.querySelector('.message-in:last-of-type ._ao3e')?.innerText?.trim() || "";

    if (!lastCustomerMessage.trim()) {
      console.error("WADeal: No customer message detected.");
      renderEmptyState(currentLang === 'ar' ? '⚠️ لم يتم اكتشاف رسالة واردة من العميل' : '⚠️ No customer message detected.');
      return;
    }

    const config = await getClientConfig();
    const chatHistory = extractActiveChatContext();
    const t = getI18n();

    const mainBtn = document.getElementById('wadeal-trigger-btn');
    if (mainBtn) {
      mainBtn.classList.add('loading');
      mainBtn.innerHTML = '⚡ ' + t.analyzing;
    }
    isGenerating = true;

    try {
      const response = await fetch(\`\${config.backendUrl}/api/v1/generate-deal-response\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: config.clientId,
          license_key: config.licenseKey,
          business_context: config.businessContext,
          chat_history: chatHistory,
          last_customer_message: lastCustomerMessage
        })
      });

      if (response.status === 402) {
        showPaywallModal(
          currentLang === 'ar'
            ? 'لقد استنفدت رصيدك المجاني المكون من 40 رداً لإغلاق الصفقات.'
            : 'You have exhausted your 40 free deal-closing credits.'
        );
        return;
      }

      if (!response.ok) throw new Error(\`Server returned \${response.status}\`);

      const data = await response.json();
      currentReplies = data.replies || [];
      currentObjection = data.objection_detected || (currentLang === 'ar' ? 'استفسار واعتراض' : 'Customer Inquiry');
      renderSmartChips(currentReplies, currentObjection, data.credits_remaining, data.is_pro);

      if (data.deal_state === 'CLOSING') {
        updateLeadHeaderBadge('won');
      } else if (data.deal_state === 'OBJECTION') {
        updateLeadHeaderBadge('hot');
      }
    } catch (err) {
      console.error('WADeal error:', err);
      renderErrorState(currentLang === 'ar' ? '⚠️ تعذر الاتصال بخادم WADeal' : '⚠️ Failed to generate responses from server');
    } finally {
      isGenerating = false;
      if (mainBtn) {
        mainBtn.classList.remove('loading');
        mainBtn.innerHTML = t.replyBtn;
      }
    }
  }

  function renderSmartChips(replies, objection, creditsRemaining, isPro) {
    const chipsContainer = document.getElementById('wadealChipsShelf') || document.getElementById('wadeal-chips-box');
    const objectionPill = document.getElementById('wadeal-objection-tag');
    const t = getI18n();
    if (!chipsContainer) return;

    chipsContainer.innerHTML = '';
    if (objectionPill) {
      objectionPill.textContent = '🎯 ' + objection;
      objectionPill.style.display = 'inline-block';
    }

    replies.forEach((reply) => {
      const chip = document.createElement('button');
      const isPersuasive = reply.type === 'Persuasive';
      const isDirect = reply.type === 'Direct';
      const isUrgent = reply.type === 'Urgent';

      const typeKey = isPersuasive ? 'persuasive' : isDirect ? 'direct' : 'urgent';
      const typeLabel = isPersuasive ? t.chips.persuasive :
                        isDirect ? t.chips.direct : t.chips.urgent;

      chip.className = 'wadeal-suggestion-chip ' + typeKey;
      chip.setAttribute('data-type', typeKey);
      chip.innerHTML = \`
        <span>\${isPersuasive ? '⚡' : isDirect ? '🎯' : '🔥'}</span>
        <strong>\${typeLabel}:</strong>
        <span>\${reply.short_label}</span>
        <span class="chip-preview-tooltip">
          <span class="chip-tooltip-header">
            <span>\${typeLabel} (\${reply.short_label})</span>
            <span class="chip-tooltip-hint">\${t.clickToInject}</span>
          </span>
          <span class="chip-tooltip-body">"\${reply.text}"</span>
        </span>
      \`;

      chip.addEventListener('click', () => {
        injectIntoWhatsAppInput(reply.text);
      });

      chipsContainer.appendChild(chip);
    });

    const endGroup = document.getElementById('wadeal-end-group');
    if (endGroup) {
      if (isPro) {
        endGroup.innerHTML = \`
          <button id="wadeal-lang-btn" class="wadeal-lang-switch" title="Toggle Language">
            \${t.langSwitch} 🌐
          </button>
          <span class="wadeal-pro-badge">\${t.badgePro}</span>
        \`;
      } else {
        const cred = typeof creditsRemaining === 'number' ? creditsRemaining : 40;
        endGroup.innerHTML = \`
          <button id="wadeal-lang-btn" class="wadeal-lang-switch" title="Toggle Language">
            \${t.langSwitch} 🌐
          </button>
          <button id="wadeal-credits-btn" class="wadeal-badge-credits">
            \${cred} / 40 \${currentLang === 'ar' ? 'رصيد' : 'left'}
          </button>
        \`;
        document.getElementById('wadeal-credits-btn')?.addEventListener('click', () => showPaywallModal());
      }
      document.getElementById('wadeal-lang-btn')?.addEventListener('click', toggleLanguage);
    }
  }

  function renderEmptyState(hintText) {
    const chipsContainer = document.getElementById('wadealChipsShelf') || document.getElementById('wadeal-chips-box');
    const objectionPill = document.getElementById('wadeal-objection-tag');
    const t = getI18n();
    if (!chipsContainer) return;

    chipsContainer.innerHTML = '';
    if (objectionPill) {
      if (hintText) {
        objectionPill.textContent = hintText;
        objectionPill.style.display = 'inline-block';
      } else {
        objectionPill.style.display = 'none';
        objectionPill.textContent = '';
      }
    }

    const placeholder = document.createElement('div');
    placeholder.className = 'wadeal-empty-hint';
    placeholder.innerHTML = \`
      <span style="color: #00a884; font-weight: 700;">⚡</span>
      <span style="color: #8696a0; font-size: 11px;">\${hintText || (currentLang === 'ar' ? 'انقر فوق "⚡ رد WADeal الذكي" للإجابة المباشرة على استفسار العميل' : 'Click "⚡ WADeal Reply" below to directly answer customer inquiry')}</span>
    \`;
    chipsContainer.appendChild(placeholder);
  }

  function renderErrorState(errMsg) {
    const chipsContainer = document.getElementById('wadealChipsShelf') || document.getElementById('wadeal-chips-box');
    const objectionPill = document.getElementById('wadeal-objection-tag');
    if (!chipsContainer) return;

    chipsContainer.innerHTML = '';
    if (objectionPill) {
      objectionPill.textContent = errMsg;
      objectionPill.style.display = 'inline-block';
    }

    const placeholder = document.createElement('div');
    placeholder.className = 'wadeal-empty-hint';
    placeholder.innerHTML = \`
      <span style="color: #ef4444; font-weight: 700;">⚠️</span>
      <span style="color: #ef4444; font-size: 11px;">\${errMsg}</span>
    \`;
    chipsContainer.appendChild(placeholder);
  }

  function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'ar' : 'en';
    chrome.storage.local.set({ wadeal_lang: currentLang }, () => {
      const container = document.getElementById('wadeal-root-container');
      if (container) container.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
      const t = getI18n();
      const mainBtn = document.getElementById('wadeal-trigger-btn');
      if (mainBtn) mainBtn.innerHTML = t.replyBtn;

      if (currentReplies && currentReplies.length > 0) {
        renderSmartChips(currentReplies, currentObjection, null, false);
      } else {
        renderEmptyState();
      }

      const oldBadge = document.getElementById('wadeal-lead-header-badge');
      if (oldBadge) oldBadge.remove();
      mountHeaderLeadBadge();
    });
  }

  function showPaywallModal(msg) {
    if (document.getElementById('wadeal-paywall-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'wadeal-paywall-modal';
    modal.className = 'wadeal-modal-overlay';
    const isAr = currentLang === 'ar';
    modal.innerHTML = \`
      <div class="wadeal-modal-card" dir="\${isAr ? 'rtl' : 'ltr'}">
        <div style="font-size: 22px; font-weight: 800; color: #00a884; margin-bottom: 8px;">
          \${isAr ? '🚀 نفد الرصيد! واصل إغلاق صفقاتك' : '🚀 Quota Depleted! Keep Closing Deals'}
        </div>
        <p style="font-size: 13px; color: #8696a0; line-height: 1.5; margin-bottom: 18px;">
          \${msg || (isAr ? 'لقد وفرت أكثر من ساعتين مع WADeal! لا تدع مبيعاتك تتعطل—افتح قدرات الإغلاق غير المحدودة الآن.' : 'You just saved over 2 hours with WADeal! Unlock unlimited closing power now.')}
        </p>
        <div style="background: rgba(0, 168, 132, 0.1); border: 1px solid #00a884; border-radius: 12px; padding: 14px; margin-bottom: 18px;">
          <div style="font-weight: 700; color: #ffffff; margin-bottom: 4px;">
            \${isAr ? '🔥 عرض الإطلاق - مدى الحياة (LTD)' : '🔥 Early Bird Lifetime Deal (LTD)'}
          </div>
          <div style="font-size: 24px; font-weight: 800; color: #25d366;">
            $59 <span style="font-size: 12px; font-weight: normal; color: #8696a0;">\${isAr ? 'دفعة واحدة فقط' : 'one-time payment'}</span>
          </div>
        </div>
        <div style="display: flex; gap: 10px;">
          <button id="wadeal-paywall-close" style="flex: 1; padding: 10px; background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #e9edef; border-radius: 8px; cursor: pointer; font-size: 13px;">
            \${isAr ? 'إغلاق' : 'Close'}
          </button>
          <a href="https://whop.com" target="_blank" style="flex: 2; text-align: center; padding: 10px; background: #00a884; color: #fff; font-weight: 700; border-radius: 8px; text-decoration: none; font-size: 13px;">
            \${isAr ? 'فتح اللامحدود عبر Whop ⚡' : 'Unlock Unlimited on Whop ⚡'}
          </a>
        </div>
      </div>
    \`;
    document.body.appendChild(modal);
    document.getElementById('wadeal-paywall-close').addEventListener('click', () => modal.remove());
  }

  async function mountWADealToolbar() {
    const footer = document.querySelector('footer');
    if (!footer) return;
    if (document.getElementById('wadeal-root-container')) {
      mountHeaderLeadBadge();
      return;
    }

    const config = await getClientConfig();
    const t = getI18n();
    const isAr = currentLang === 'ar';
    const container = document.createElement('div');
    container.id = 'wadeal-root-container';
    container.className = 'wadeal-dock-container';
    container.setAttribute('dir', isAr ? 'rtl' : 'ltr');
    container.innerHTML = \`
      <!-- Tier 1: Dedicated Suggestion Chips Shelf (Visible & Fully Clickable) -->
      <div class="wadeal-chips-shelf" id="wadealChipsShelf"></div>

      <!-- Tier 2: Action & Status Bar -->
      <div class="wadeal-controls-bar">
        <div class="controls-start">
          <button id="wadeal-trigger-btn" class="wadeal-main-trigger-btn" title="\${t.replyBtn}">
            \${t.replyBtn}
          </button>
          <div class="wadeal-info-icon" title="\${t.helperTooltip}">
            <span>ⓘ</span>
            <div class="wadeal-helper-popover">\${t.helperTooltip}</div>
          </div>
          <span id="wadeal-objection-tag" style="display: none; font-size: 11px; padding: 2px 8px; border-radius: 12px; background: rgba(255,255,255,0.08); color: #8696a0;"></span>
        </div>
        <div id="wadeal-end-group" class="controls-end">
          <button id="wadeal-lang-btn" class="wadeal-lang-switch" title="Toggle Language">
            \${t.langSwitch} 🌐
          </button>
          <button id="wadeal-credits-btn" class="wadeal-badge-credits">
            40 / 40 \${isAr ? 'رصيد' : 'left'}
          </button>
        </div>
      </div>
    \`;

    footer.parentElement.insertBefore(container, footer);
    document.getElementById('wadeal-trigger-btn')?.addEventListener('click', triggerWADealGenerate);
    document.getElementById('wadeal-lang-btn')?.addEventListener('click', toggleLanguage);
    document.getElementById('wadeal-credits-btn')?.addEventListener('click', () => showPaywallModal());

    renderEmptyState();
    mountHeaderLeadBadge();
  }

  const observer = new MutationObserver(() => mountWADealToolbar());
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(mountWADealToolbar, 1000);
})();`
  },
  {
    name: 'content.css',
    path: 'content.css',
    language: 'css',
    content: `@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Tajawal:wght@400;500;700&display=swap');

/* 1. Two-Tier Dock Container */
.wadeal-dock-container,
#wadeal-root-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  box-sizing: border-box;
  padding: 6px 12px;
  background: rgba(17, 27, 33, 0.96);
  backdrop-filter: blur(8px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #e9edef;
  z-index: 9999;
  transition: all 0.2s ease;
}

#wadeal-root-container[dir="rtl"],
.wadeal-dock-container[dir="rtl"] {
  font-family: 'Cairo', 'Tajawal', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* Tier 1: Chips Shelf (Dedicated Full-Width Row) */
.wadeal-chips-shelf,
.wadeal-chips-container {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
  padding: 4px 2px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  min-height: 38px;
}
.wadeal-chips-shelf::-webkit-scrollbar,
.wadeal-chips-container::-webkit-scrollbar {
  display: none;
}

.wadeal-suggestion-chip,
.wadeal-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 20px;
  border: 1px solid rgba(0, 168, 132, 0.4);
  background: #1f2c34;
  color: #e9edef;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
  position: relative;
  user-select: none;
}

.wadeal-suggestion-chip:hover,
.wadeal-chip:hover {
  background: #00a884;
  color: #111b21;
  border-color: #00a884;
  transform: translateY(-1px);
}

.wadeal-suggestion-chip.persuasive,
.wadeal-chip-persuasive {
  background: rgba(37, 211, 102, 0.12);
  color: #25d366;
  border-color: rgba(37, 211, 102, 0.35);
}
.wadeal-suggestion-chip.persuasive:hover,
.wadeal-chip-persuasive:hover {
  background: #25d366;
  color: #111b21;
  border-color: #25d366;
}

.wadeal-suggestion-chip.direct,
.wadeal-chip-direct {
  background: rgba(59, 130, 246, 0.12);
  color: #60a5fa;
  border-color: rgba(59, 130, 246, 0.35);
}
.wadeal-suggestion-chip.direct:hover,
.wadeal-chip-direct:hover {
  background: #3b82f6;
  color: #ffffff;
  border-color: #3b82f6;
}

.wadeal-suggestion-chip.urgent,
.wadeal-chip-urgent {
  background: rgba(245, 158, 11, 0.12);
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.35);
}
.wadeal-suggestion-chip.urgent:hover,
.wadeal-chip-urgent:hover {
  background: #f59e0b;
  color: #111b21;
  border-color: #f59e0b;
}

.wadeal-empty-hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #8696a0;
  font-weight: 500;
  padding: 4px 8px;
  user-select: none;
}

/* Tier 2: Action & Status Controls Bar */
.wadeal-controls-bar,
.wadeal-bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
  padding: 2px 0;
}

.controls-start,
.wadeal-action-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.controls-end,
.wadeal-end-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: auto;
}
[dir="rtl"] .controls-end,
[dir="rtl"] .wadeal-end-group {
  margin-left: 0;
  margin-right: auto;
}

.wadeal-main-trigger-btn,
.wadeal-main-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: linear-gradient(135deg, #00a884, #008069);
  color: #ffffff;
  border: none;
  border-radius: 18px;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0, 168, 132, 0.25);
  transition: all 0.15s ease;
  flex-shrink: 0;
}
.wadeal-main-trigger-btn:hover,
.wadeal-main-btn:hover {
  background: linear-gradient(135deg, #02b690, #009378);
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 168, 132, 0.35);
}
.wadeal-main-trigger-btn:active,
.wadeal-main-btn:active {
  transform: translateY(0);
}
.wadeal-main-trigger-btn.loading,
.wadeal-main-btn.loading {
  opacity: 0.8;
  cursor: wait;
}

.wadeal-info-icon,
.wadeal-helper-icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: #8696a0;
  cursor: pointer;
  font-size: 14px;
  transition: color 0.15s ease;
}
.wadeal-info-icon:hover,
.wadeal-helper-icon:hover {
  color: #00a884;
}

.wadeal-lang-switch,
.wadeal-lang-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #202c33;
  color: #8696a0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}
.wadeal-lang-switch:hover,
.wadeal-lang-toggle:hover {
  background: #2a3942;
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.2);
}

.wadeal-pro-badge,
.wadeal-badge-pro {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 11px;
  font-weight: 700;
  color: #00a884;
  background: rgba(0, 168, 132, 0.15);
  border: 1px solid rgba(0, 168, 132, 0.35);
  white-space: nowrap;
}

.wadeal-badge-credits {
  font-size: 11px;
  font-weight: 600;
  color: #8696a0;
  background: #202c33;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 3px 8px;
  border-radius: 12px;
  white-space: nowrap;
  flex-shrink: 0;
  cursor: pointer;
}

/* Tooltip Preview */
.chip-preview-tooltip,
.wadeal-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  width: 320px;
  max-width: 80vw;
  padding: 10px 12px;
  background: #202c33;
  color: #e9edef;
  font-size: 12px;
  line-height: 1.45;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.15s ease;
  z-index: 10000;
  white-space: normal;
  text-align: left;
}
[dir="rtl"] .chip-preview-tooltip,
[dir="rtl"] .wadeal-tooltip {
  left: auto;
  right: 0;
  text-align: right;
}

.wadeal-suggestion-chip:hover .chip-preview-tooltip,
.wadeal-suggestion-chip:hover .wadeal-tooltip,
.wadeal-chip:hover .chip-preview-tooltip,
.wadeal-chip:hover .wadeal-tooltip {
  opacity: 1;
  visibility: visible;
}

.chip-tooltip-header,
.wadeal-tooltip-title {
  font-weight: 700;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #00a884;
}
.chip-tooltip-hint,
.wadeal-tooltip-hint {
  font-size: 10px;
  opacity: 0.7;
  font-weight: normal;
}
.chip-tooltip-body {
  display: block;
}
.wadeal-helper-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #8696a0;
  cursor: pointer;
  padding: 4px;
  position: relative;
}
.wadeal-helper-popover {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  width: 240px;
  background: #202c33;
  color: #e9edef;
  font-size: 11px;
  line-height: 1.4;
  padding: 8px 10px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  z-index: 10000;
  white-space: normal;
}
[dir="rtl"] .wadeal-helper-popover {
  left: auto;
  right: 0;
}
.wadeal-helper-icon:hover .wadeal-helper-popover {
  opacity: 1;
  visibility: visible;
}

/* WhatsApp Web ContentEditable Input Target & Auto-Height Wrapping */
.wadeal-chat-input,
div[contenteditable="true"][data-tab="10"],
footer div[contenteditable="true"],
.message-input-area {
  white-space: pre-wrap !important;
  word-break: break-word !important;
  overflow-y: auto !important;
  min-height: 42px !important;
  max-height: 140px !important;
  height: auto !important;
  line-height: 1.5 !important;
  font-size: 14.5px !important;
  text-align: inherit !important;
  direction: inherit !important;
}

.wadeal-input-container {
  display: flex !important;
  align-items: flex-end !important;
  height: auto !important;
  min-height: 52px !important;
  padding: 6px 10px !important;
}`
  },
  {
    name: 'popup.html',
    path: 'popup.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>WADeal Settings</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="popup-container" id="popup-root">
    <header class="popup-header">
      <div class="brand">
        <span class="brand-icon">⚡</span>
        <div>
          <h1 class="brand-title">WADeal</h1>
          <p class="brand-subtitle" id="txt-subtitle">AI Sales Assistant for WhatsApp Web</p>
        </div>
      </div>
      <div class="header-actions">
        <button id="lang-toggle-btn" class="lang-btn" title="Toggle Language">🌐 عربي</button>
        <div id="status-badge" class="badge badge-trial">40 Free Credits</div>
      </div>
    </header>
    <section class="section">
      <label for="business-context" class="section-title" id="txt-context-title">Micro-Business Context Engine</label>
      <textarea id="business-context" rows="4" placeholder="Enter products, prices, bundles, shipping and returns policy"></textarea>
      <button id="save-context-btn" class="btn btn-secondary">💾 Save Context</button>
    </section>
    <section class="section">
      <label for="license-key" class="section-title" id="txt-license-title">License Key Activation</label>
      <input type="text" id="license-key" placeholder="Enter key (e.g. WADEAL-LTD-LAUNCH50)">
      <button id="activate-btn" class="btn btn-primary">Activate</button>
    </section>
  </div>
  <script src="popup.js"></script>
</body>
</html>`
  },
  {
    name: 'popup.js',
    path: 'popup.js',
    language: 'javascript',
    content: `// WADeal Extension Popup Logic with Bilingual Support
document.addEventListener('DOMContentLoaded', () => {
  const rootEl = document.getElementById('popup-root');
  const contextEl = document.getElementById('business-context');
  const saveContextBtn = document.getElementById('save-context-btn');
  const licenseKeyEl = document.getElementById('license-key');
  const activateBtn = document.getElementById('activate-btn');
  const statusBadge = document.getElementById('status-badge');
  const langToggleBtn = document.getElementById('lang-toggle-btn');
  let currentLang = 'en';

  chrome.storage.local.get(['wadeal_business_context', 'wadeal_license_key', 'wadeal_backend_url', 'wadeal_client_id', 'wadeal_lang'], (res) => {
    currentLang = res.wadeal_lang || 'en';
    if (rootEl) rootEl.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
    if (langToggleBtn) langToggleBtn.textContent = currentLang === 'ar' ? '🌐 English' : '🌐 عربي';
    if (res.wadeal_business_context) contextEl.value = res.wadeal_business_context;
    if (res.wadeal_license_key) licenseKeyEl.value = res.wadeal_license_key;
    const backend = res.wadeal_backend_url || 'http://localhost:3000';
    const cid = res.wadeal_client_id || 'user';
    fetch(\`\${backend}/api/v1/user-credits?client_id=\${cid}&license_key=\${res.wadeal_license_key || ''}\`)
      .then(r => r.json())
      .then(d => {
        if (d.is_pro) {
          statusBadge.textContent = currentLang === 'ar' ? '👑 برو غير محدود' : '👑 PRO UNLIMITED';
        } else {
          statusBadge.textContent = \`\${d.credits_remaining} \${currentLang === 'ar' ? 'رصيد متبقي' : 'Free Credits'}\`;
        }
      }).catch(() => {});
  });

  langToggleBtn?.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'ar' : 'en';
    chrome.storage.local.set({ wadeal_lang: currentLang }, () => {
      if (rootEl) rootEl.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
      langToggleBtn.textContent = currentLang === 'ar' ? '🌐 English' : '🌐 عربي';
    });
  });

  saveContextBtn.addEventListener('click', () => {
    chrome.storage.local.set({ wadeal_business_context: contextEl.value.trim() }, () => {
      saveContextBtn.textContent = currentLang === 'ar' ? '✅ تم الحفظ!' : '✅ Saved!';
      setTimeout(() => { saveContextBtn.textContent = currentLang === 'ar' ? '💾 حفظ القواعد' : '💾 Save Context'; }, 1500);
    });
  });

  activateBtn.addEventListener('click', async () => {
    const key = licenseKeyEl.value.trim();
    if (!key) return;
    const res = await fetch('http://localhost:3000/api/v1/verify-license', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license_key: key })
    });
    const d = await res.json();
    if (d.valid) {
      chrome.storage.local.set({ wadeal_license_key: key, wadeal_is_pro: true });
      statusBadge.textContent = currentLang === 'ar' ? '👑 برو غير محدود' : '👑 PRO UNLIMITED';
      alert(currentLang === 'ar' ? 'تم تفعيل الترخيص بنجاح!' : 'License activated successfully!');
    } else {
      alert(d.message || (currentLang === 'ar' ? 'مفتاح غير صالح.' : 'Invalid key.'));
    }
  });
});`
  },
  {
    name: 'popup.css',
    path: 'popup.css',
    language: 'css',
    content: `@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
[dir="rtl"], [dir="rtl"] * { font-family: 'Cairo', sans-serif; }
body { width: 390px; background-color: #111b21; color: #e9edef; font-size: 13px; line-height: 1.4; }
.popup-container { padding: 16px; display: flex; flex-direction: column; gap: 14px; }
.popup-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
.brand { display: flex; align-items: center; gap: 8px; }
.brand-icon { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: #00a884; color: #fff; border-radius: 8px; font-size: 16px; }
.brand-title { font-size: 16px; font-weight: 700; color: #f0f2f5; }
.header-actions { display: flex; align-items: center; gap: 6px; }
.lang-btn { background: #202c33; color: #25d366; border: 1px solid rgba(37, 211, 102, 0.3); padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; }
.badge { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 12px; white-space: nowrap; }
.badge-trial { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
.badge-pro { background: rgba(37, 211, 102, 0.15); color: #25d366; border: 1px solid rgba(37, 211, 102, 0.3); }
.section { display: flex; flex-direction: column; gap: 8px; }
.section-title { font-size: 12px; font-weight: 700; color: #00a884; text-transform: uppercase; }
textarea { width: 100%; background: #202c33; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 8px; padding: 8px 10px; color: #e9edef; font-size: 12px; }
.btn { padding: 7px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; }
.btn-primary { background: #00a884; color: #fff; }
.btn-secondary { background: #2a3942; color: #e9edef; border: 1px solid rgba(255, 255, 255, 0.08); }`
  },
  {
    name: 'background.js',
    path: 'background.js',
    language: 'javascript',
    content: `// WADeal Background Service Worker (Manifest V3)
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      wadeal_client_id: 'wadeal_' + Math.random().toString(36).substring(2, 11),
      wadeal_lang: 'en',
      wadeal_business_context: 'Luxury perfume brand. Standard bottle: $48. Bundle deal: Buy 2 for $80 with free nationwide delivery. Delivery window: 24–48 hours. Cash on delivery available. 14-day replacement guarantee.'
    });
  }
});`
  },
  {
    name: 'README.md',
    path: 'README.md',
    language: 'markdown',
    content: `# WADeal: AI Sales Assistant & Quick Reply for WhatsApp Web (MV3)

## How to Install
1. Open Google Chrome and go to \`chrome://extensions/\`
2. Enable **Developer mode** (top right).
3. Click **Load unpacked**.
4. Select this directory.
5. Open [WhatsApp Web](https://web.whatsapp.com/) and test the \`⚡ WADeal Reply\` toolbar!`
  }
];

export async function downloadExtensionZip() {
  const zip = new JSZip();

  EXTENSION_FILES.forEach(file => {
    zip.file(file.path, file.content);
  });

  const iconsFolder = zip.folder('icons');
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAmSURBVHgB7cwxEQAABMMw+Jf+DYz72g5W0gQBAAAAAAAAAAAAAMB0WckBq3mO6x0AAAAASUVORK5CYII=';

  if (iconsFolder) {
    iconsFolder.file('icon16.png', pngBase64, { base64: true });
    iconsFolder.file('icon48.png', pngBase64, { base64: true });
    iconsFolder.file('icon128.png', pngBase64, { base64: true });
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wadeal-chrome-extension-mv3.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
