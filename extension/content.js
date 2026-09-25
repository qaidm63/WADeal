// WADeal Content Script for WhatsApp Web (Manifest V3)
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
        persuasive: "Persuasive",
        direct: "Direct",
        urgent: "Urgent"
      },
      tags: {
        hot: "🔥 Hot / Ready to Buy",
        followUp: "⏳ Follow-up",
        won: "✅ Deal Won",
        setStage: "🏷️ Set Lead Status"
      },
      contextPlaceholder: "Enter your business pricing, policies, and terms...",
      trustBanner: "Messages are end-to-end encrypted. WADeal acts 100% human-in-the-loop with zero ban risk.",
      langSwitch: "AR",
      clickToInject: "Click chip to inject into chat",
      helperTooltip: "Click ⚡ WADeal Reply to generate 3 tailored closing replies grounded in your business rules.",
      analyzing: "Analyzing..."
    },
    ar: {
      replyBtn: "⚡ رد WADeal الذكي",
      badgePro: "برو غير محدود 👑",
      chips: {
        persuasive: "إقناعي",
        direct: "حاسم",
        urgent: "حسم فوري"
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

  // Helper: Retrieve or create unique client_id and preferences
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

  // 1. Scrape last 3-5 visible messages from active chat DOM
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

  // 2. Inject text safely into WhatsApp contenteditable input box with auto-expanding multi-line support
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

    // Focus the input
    inputField.focus();

    // Use document.execCommand to preserve WhatsApp's native undo stack and auto-grow trigger
    const success = document.execCommand('insertText', false, textToInsert);

    // Fallback for custom React/DOM inputs
    if (!success) {
      inputField.innerText = textToInsert;
    }

    // Dispatch synthetic input events to force auto-expanding height
    inputField.dispatchEvent(new Event('input', { bubbles: true }));
    inputField.dispatchEvent(new Event('change', { bubbles: true }));

    // Scroll to make sure the full message is visible in the active viewport
    inputField.scrollTop = inputField.scrollHeight;

    // Ensure cursor is placed at the very end
    try {
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(inputField);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    } catch (e) {
      // Fallback if range fails
    }
  }

  // Helper: Programmatically update Lead Status Tagger Badge in Header
  function updateLeadHeaderBadge(stage) {
    const select = document.querySelector('#wadeal-lead-header-badge select');
    if (select) {
      select.value = stage;
      updateBadgeStyle(select, stage);
      const contactKey = `wadeal_lead_${encodeURIComponent(activeChatContact || 'default')}`;
      chrome.storage.local.set({ [contactKey]: stage });
    }
  }

  // 3. Inject Lead Status Tagger Badge into Header
  function mountHeaderLeadBadge() {
    const header = document.querySelector('header');
    if (!header || document.getElementById('wadeal-lead-header-badge')) return;

    const t = getI18n();
    const contactKey = `wadeal_lead_${encodeURIComponent(activeChatContact || 'default')}`;

    const badgeContainer = document.createElement('div');
    badgeContainer.id = 'wadeal-lead-header-badge';
    badgeContainer.className = 'wadeal-header-badge';

    const select = document.createElement('select');
    select.className = 'wadeal-badge-select';
    select.innerHTML = `
      <option value="none">${t.tags.setStage}</option>
      <option value="hot">${t.tags.hot}</option>
      <option value="followup">${t.tags.followUp}</option>
      <option value="won">${t.tags.won}</option>
    `;

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

  // 4. Fetch Deal Response from backend with strictly real dynamic inference
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
      mainBtn.innerHTML = `⚡ ${t.analyzing}`;
    }
    isGenerating = true;

    try {
      const response = await fetch(`${config.backendUrl}/api/v1/generate-deal-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: config.clientId,
          license_key: config.licenseKey,
          business_context: config.businessContext,
          chat_history: chatHistory,
          last_customer_message: lastCustomerMessage,
          lang: currentLang
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

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      let data = null;
      try {
        const rawText = await response.text();
        const trimmed = rawText.trim();
        if (!trimmed.startsWith('<') && (trimmed.startsWith('{') || trimmed.startsWith('['))) {
          data = JSON.parse(trimmed);
        }
      } catch (parseErr) {
        console.warn('WADeal: Response parsing error:', parseErr);
      }

      if (!data || !Array.isArray(data.replies)) {
        throw new Error('Server returned non-JSON response');
      }

      currentReplies = data.replies || [];
      currentObjection = data.objection_detected || (currentLang === 'ar' ? 'استفسار واعتراض' : 'Customer Inquiry');

      renderSmartChips(currentReplies, currentObjection, data.credits_remaining, data.is_pro);

      if (data.deal_state === 'CLOSING') {
        updateLeadHeaderBadge('won');
      } else if (data.deal_state === 'OBJECTION') {
        updateLeadHeaderBadge('hot');
      }
    } catch (err) {
      console.error('WADeal generation error:', err);
      renderErrorState(currentLang === 'ar' ? '⚠️ تعذر توليد الرد من الخادم' : '⚠️ Failed to generate responses from server');
    } finally {
      isGenerating = false;
      if (mainBtn) {
        mainBtn.classList.remove('loading');
        mainBtn.innerHTML = t.replyBtn;
      }
    }
  }

  // 5. Render In-line Suggestion Chips into Dedicated Shelf (Tier 1)
  function renderSmartChips(replies, objection, creditsRemaining, isPro) {
    const chipsContainer = document.getElementById('wadealChipsShelf') || document.getElementById('wadeal-chips-box');
    const objectionPill = document.getElementById('wadeal-objection-tag');
    const t = getI18n();
    if (!chipsContainer) return;

    chipsContainer.innerHTML = '';
    if (objectionPill) {
      const cleanObj = (objection || '').replace(/^[🎯👑⚠️🚚\s]+/, '').trim();
      objectionPill.textContent = cleanObj ? '🎯 ' + cleanObj : '';
      objectionPill.title = cleanObj;
      objectionPill.style.display = cleanObj ? 'inline-block' : 'none';
    }

    replies.forEach((reply) => {
      const chip = document.createElement('button');
      const isPersuasive = reply.type === 'Persuasive';
      const isDirect = reply.type === 'Direct';

      const typeKey = isPersuasive ? 'persuasive' : isDirect ? 'direct' : 'urgent';
      const rawTypeLabel = isPersuasive ? t.chips.persuasive :
                           isDirect ? t.chips.direct : t.chips.urgent;
      const cleanTypeLabel = (rawTypeLabel || '').replace(/^[⚡🎯🔥\s]+/, '').trim();
      const cleanShortLabel = (reply.short_label || '').replace(/^[⚡🎯🔥\s]+/, '').trim();
      const chipIcon = isPersuasive ? '⚡' : isDirect ? '🎯' : '🔥';

      chip.className = `wadeal-suggestion-chip ${typeKey}`;
      chip.setAttribute('data-type', typeKey);
      chip.innerHTML = `
        <span>${chipIcon}</span>
        <strong>${cleanTypeLabel}:</strong>
        <span>${cleanShortLabel}</span>
        <span class="chip-preview-tooltip">
          <span class="chip-tooltip-header">
            <span>${chipIcon} ${cleanTypeLabel} (${cleanShortLabel})</span>
            <span class="chip-tooltip-hint">${t.clickToInject}</span>
          </span>
          <span class="chip-tooltip-body">"${reply.text}"</span>
        </span>
      `;

      chip.addEventListener('click', () => {
        injectIntoWhatsAppInput(reply.text);
      });

      chipsContainer.appendChild(chip);
    });

    // Update Pro or Credits Badge in Bottom Tier (Tier 2)
    const endGroup = document.getElementById('wadeal-end-group');
    if (endGroup) {
      const langLabel = currentLang === 'en' ? 'AR' : 'EN';
      const langTitle = currentLang === 'en' ? 'Switch to Arabic' : 'التحويل للإنجليزية';
      const langBtnHtml = `
        <button id="wadeal-lang-btn" class="wadeal-lang-switch" title="${langTitle}">
          <svg class="wadeal-translate-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
          <span>${langLabel}</span>
        </button>
      `;
      if (isPro) {
        endGroup.innerHTML = `
          ${langBtnHtml}
          <span class="wadeal-pro-badge">${t.badgePro}</span>
        `;
      } else {
        const cred = typeof creditsRemaining === 'number' ? creditsRemaining : 40;
        endGroup.innerHTML = `
          ${langBtnHtml}
          <button id="wadeal-credits-btn" class="wadeal-badge-credits">
            ${cred} / 40 ${currentLang === 'ar' ? 'رصيد' : 'left'}
          </button>
        `;
        document.getElementById('wadeal-credits-btn')?.addEventListener('click', () => {
          showPaywallModal();
        });
      }

      document.getElementById('wadeal-lang-btn')?.addEventListener('click', toggleLanguage);
    }
  }

  // Empty state when waiting for user trigger (dedicated shelf placeholder)
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
    placeholder.innerHTML = `
      <span style="color: #00a884; font-weight: 700;">⚡</span>
      <span style="color: #8696a0; font-size: 11px;">${hintText || (currentLang === 'ar' ? 'انقر فوق "⚡ رد WADeal الذكي" للإجابة المباشرة على استفسار العميل' : 'Click "⚡ WADeal Reply" below to directly answer customer inquiry')}</span>
    `;
    chipsContainer.appendChild(placeholder);
  }

  // Error state display
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
    placeholder.innerHTML = `
      <span style="color: #ef4444; font-weight: 700;">⚠️</span>
      <span style="color: #ef4444; font-size: 11px;">${errMsg}</span>
    `;
    chipsContainer.appendChild(placeholder);
  }

  function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'ar' : 'en';
    chrome.storage.local.set({ wadeal_lang: currentLang }, () => {
      const container = document.getElementById('wadeal-root-container');
      if (container) {
        container.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
      }
      const t = getI18n();
      const mainBtn = document.getElementById('wadeal-trigger-btn');
      if (mainBtn) mainBtn.innerHTML = t.replyBtn;

      if (currentReplies && currentReplies.length > 0) {
        renderSmartChips(currentReplies, currentObjection, null, false);
      } else {
        renderEmptyState();
      }

      // Re-render header lead badge
      const oldBadge = document.getElementById('wadeal-lead-header-badge');
      if (oldBadge) oldBadge.remove();
      mountHeaderLeadBadge();
    });
  }

  // 6. Paywall Modal Trigger
  function showPaywallModal(msg) {
    if (document.getElementById('wadeal-paywall-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'wadeal-paywall-modal';
    modal.className = 'wadeal-modal-overlay';
    const isAr = currentLang === 'ar';

    modal.innerHTML = `
      <div class="wadeal-modal-card" dir="${isAr ? 'rtl' : 'ltr'}">
        <div style="font-size: 22px; font-weight: 800; color: #00a884; margin-bottom: 8px;">
          ${isAr ? '🚀 نفد الرصيد! واصل إغلاق صفقاتك' : '🚀 Quota Depleted! Keep Closing Deals'}
        </div>
        <p style="font-size: 13px; color: #8696a0; line-height: 1.5; margin-bottom: 18px;">
          ${msg || (isAr ? 'لقد وفرت أكثر من ساعتين مع WADeal! لا تدع مبيعاتك تتعطل—افتح قدرات الإغلاق غير المحدودة الآن.' : 'You just saved over 2 hours with WADeal! Unlock unlimited closing power now.')}
        </p>
        <div style="background: rgba(0, 168, 132, 0.1); border: 1px solid #00a884; border-radius: 12px; padding: 14px; margin-bottom: 18px;">
          <div style="font-weight: 700; color: #ffffff; margin-bottom: 4px;">
            ${isAr ? '🔥 عرض الإطلاق - مدى الحياة (LTD)' : '🔥 Early Bird Lifetime Deal (LTD)'}
          </div>
          <div style="font-size: 24px; font-weight: 800; color: #25d366;">
            $59 <span style="font-size: 12px; font-weight: normal; color: #8696a0;">${isAr ? 'دفعة واحدة فقط' : 'one-time payment'}</span>
          </div>
        </div>
        <div style="display: flex; gap: 10px;">
          <button id="wadeal-paywall-close" style="flex: 1; padding: 10px; background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #e9edef; border-radius: 8px; cursor: pointer; font-size: 13px;">
            ${isAr ? 'إغلاق' : 'Close'}
          </button>
          <a href="https://whop.com" target="_blank" style="flex: 2; text-align: center; padding: 10px; background: #00a884; color: #fff; font-weight: 700; border-radius: 8px; text-decoration: none; font-size: 13px;">
            ${isAr ? 'فتح اللامحدود عبر Whop ⚡' : 'Unlock Unlimited on Whop ⚡'}
          </a>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('wadeal-paywall-close').addEventListener('click', () => {
      modal.remove();
    });
  }

  // 7. Mount Toolbar with Robust Flexbox Structure (Spec 1)
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

    container.innerHTML = `
      <!-- Tier 1: Dedicated Suggestion Chips (Visible & Fully Clickable) -->
      <div class="wadeal-chips-shelf" id="wadealChipsShelf"></div>

      <!-- Tier 2: Action & Status Bar -->
      <div class="wadeal-controls-bar">
        <div class="controls-start">
          <button id="wadeal-trigger-btn" class="wadeal-main-trigger-btn" title="${t.replyBtn}">
            ${t.replyBtn}
          </button>
          <div class="wadeal-info-icon" title="${t.helperTooltip}">
            <span>ⓘ</span>
            <div class="wadeal-helper-popover">${t.helperTooltip}</div>
          </div>
          <span id="wadeal-objection-tag" style="display: none; font-size: 10px; padding: 2px 8px; border-radius: 6px; background: rgba(255,255,255,0.08); color: #8696a0; max-width: 140px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; flex-shrink: 0;"></span>
        </div>

        <div id="wadeal-end-group" class="controls-end">
          <button id="wadeal-lang-btn" class="wadeal-lang-switch" title="${currentLang === 'en' ? 'Switch to Arabic' : 'التحويل للإنجليزية'}">
            <svg class="wadeal-translate-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
            <span>${currentLang === 'en' ? 'AR' : 'EN'}</span>
          </button>
          <button id="wadeal-credits-btn" class="wadeal-badge-credits">
            40 / 40 ${isAr ? 'رصيد' : 'left'}
          </button>
        </div>
      </div>
    `;

    footer.parentElement.insertBefore(container, footer);

    document.getElementById('wadeal-trigger-btn')?.addEventListener('click', triggerWADealGenerate);
    document.getElementById('wadeal-lang-btn')?.addEventListener('click', toggleLanguage);
    document.getElementById('wadeal-credits-btn')?.addEventListener('click', () => showPaywallModal());

    renderEmptyState();
    mountHeaderLeadBadge();
  }

  const observer = new MutationObserver(() => {
    mountWADealToolbar();
  });

  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(mountWADealToolbar, 1000);
})();
