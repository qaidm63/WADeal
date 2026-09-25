// WADeal Popup Logic with Bilingual Support (Manifest V3)
document.addEventListener('DOMContentLoaded', () => {
  const rootEl = document.getElementById('popup-root');
  const contextEl = document.getElementById('business-context');
  const saveContextBtn = document.getElementById('save-context-btn');
  const licenseKeyEl = document.getElementById('license-key');
  const activateBtn = document.getElementById('activate-btn');
  const licenseFeedback = document.getElementById('license-feedback');
  const statusBadge = document.getElementById('status-badge');
  const backendUrlEl = document.getElementById('backend-url');
  const langToggleBtn = document.getElementById('lang-toggle-btn');

  let currentLang = 'en';

  const PRESETS = {
    perfume: 'Luxury perfume brand. Standard bottle: $48. Bundle deal: Buy 2 for $80 with free nationwide delivery. Delivery window: 24–48 hours. Cash on delivery available. 14-day replacement guarantee.',
    tech: 'Smart Electronics & Accessories. TWS Earbuds: $39. Buy 2 get wireless charger free ($69 total). Same-day courier dispatch. 1-year official replacement warranty. Return within 7 days hassle-free.',
    fashion: 'Urban Streetwear & Modest Fashion. Signature Hoodie: $55. 2 Hoodies bundle: $95. Free shipping over $75. Exchange sizes easily within 14 days. Pay by Card or Cash on delivery.',
    b2b: 'Wholesale Packaging & Supplies. MOQ: 500 units at $0.45/unit. Custom logo branding included on orders above 2,000 units. Turnaround: 5-7 business days. 50% deposit, balance on dispatch.'
  };

  const PRESETS_AR = {
    perfume: 'متجر عطور فاخرة. العطر الأساسي: 48$. عرض البكج: قطعتان بـ 80$ مع شحن مجاني لكافة المناطق. التوصيل خلال 24-48 ساعة والدفع عند الاستلام متاح مع ضمان استبدال 14 يوم.',
    tech: 'إلكترونيات واكسسوارات ذكية. سماعات TWS Pro بسعر 39$. عرض خاص: اشترِ اثنتين واحصل على شاحن لاسلكي مجاناً (69$ إجمالي). شحن بنفس اليوم وضمان سنة استبدال رسمي.',
    fashion: 'أزياء وستريت وير راقية. هودي أوفر سايز: 55$. بكج قطعتين: 95$. شحن مجاني للطلبات فوق 75$. استبدال مقاسات سهل خلال 14 يوم ودفع بالبطاقة أو عند الاستلام.',
    b2b: 'توريد كراتين وتغليف بالجملة. الحد الأدنى للطلب: 500 وحدة بسعر 0.45$/وحدة. طباعة الشعار مجاناً للطلبات فوق 2000 وحدة. مدة التجهيز 5-7 أيام مع عينات سريعة.'
  };

  const I18N = {
    en: {
      subtitle: "AI Sales Assistant for WhatsApp Web",
      langBtn: "🌐 عربي",
      contextTitle: "🏢 Micro-Business Context Engine",
      contextHint: "Grounds all AI replies in your real pricing",
      contextPlaceholder: "Enter your business pricing, policies, and terms...",
      presetsLabel: "Quick Presets:",
      saveBtn: "💾 Save Context",
      savedToast: "✅ Context Saved!",
      licenseTitle: "🔑 Pro License Key Activation",
      buyLink: "Get LTD ($59)",
      activateBtn: "Activate",
      verifyingBtn: "Verifying...",
      footerTrust: "Zero-ban compliant • 100% Human-in-the-loop",
      badgePro: "👑 PRO UNLIMITED",
      badgeCredits: "Free Credits Left"
    },
    ar: {
      subtitle: "مساعد المبيعات الذكي وإغلاق الصفقات لواتساب ويب",
      langBtn: "🌐 English",
      contextTitle: "🏢 محرك سياق المتجر والأسعار",
      contextHint: "يربط ردود الذكاء الاصطناعي بقواعد وأسعار متجرك الفعلية",
      contextPlaceholder: "أدخل أسعارك، عروضك، وسياسات التوصيل والضمان هنا...",
      presetsLabel: "نماذج سريعة:",
      saveBtn: "💾 حفظ القواعد",
      savedToast: "✅ تم الحفظ بنجاح!",
      licenseTitle: "🔑 تفعيل مفتاح الترخيص برو",
      buyLink: "امتلك مدى الحياة ($59)",
      activateBtn: "تفعيل المفتاح",
      verifyingBtn: "جارٍ التحقق...",
      footerTrust: "متوافق 100% مع الأمان ومكافحة الحظر • مراجعة بشرية قبل الإرسال",
      badgePro: "👑 برو غير محدود",
      badgeCredits: "رصيد تجريبي متبقي"
    }
  };

  function applyLanguage(lang) {
    currentLang = lang;
    const t = I18N[lang] || I18N.en;
    if (rootEl) {
      rootEl.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    }
    document.getElementById('txt-subtitle').textContent = t.subtitle;
    langToggleBtn.textContent = t.langBtn;
    document.getElementById('txt-context-title').textContent = t.contextTitle;
    document.getElementById('txt-context-hint').textContent = t.contextHint;
    contextEl.setAttribute('placeholder', t.contextPlaceholder);
    document.getElementById('txt-presets-label').textContent = t.presetsLabel;
    saveContextBtn.textContent = t.saveBtn;
    document.getElementById('txt-license-title').textContent = t.licenseTitle;
    document.getElementById('txt-buy-link').textContent = t.buyLink;
    activateBtn.textContent = t.activateBtn;
    document.getElementById('txt-footer-trust').textContent = t.footerTrust;
  }

  // Language toggle listener
  langToggleBtn.addEventListener('click', () => {
    const nextLang = currentLang === 'en' ? 'ar' : 'en';
    chrome.storage.local.set({ wadeal_lang: nextLang }, () => {
      applyLanguage(nextLang);
    });
  });

  // Preset buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-preset');
      const bank = currentLang === 'ar' ? PRESETS_AR : PRESETS;
      if (bank[type]) {
        contextEl.value = bank[type];
      }
    });
  });

  // Load existing configuration
  chrome.storage.local.get([
    'wadeal_business_context',
    'wadeal_license_key',
    'wadeal_backend_url',
    'wadeal_client_id',
    'wadeal_is_pro',
    'wadeal_lang'
  ], (res) => {
    const lang = res.wadeal_lang || 'en';
    applyLanguage(lang);

    if (res.wadeal_business_context) {
      contextEl.value = res.wadeal_business_context;
    } else {
      contextEl.value = lang === 'ar' ? PRESETS_AR.perfume : PRESETS.perfume;
    }

    if (res.wadeal_license_key) {
      licenseKeyEl.value = res.wadeal_license_key;
    }

    if (res.wadeal_backend_url) {
      backendUrlEl.value = res.wadeal_backend_url;
    }

    const backendUrl = res.wadeal_backend_url || 'http://localhost:3000';
    const clientId = res.wadeal_client_id || 'wadeal_user';
    const licenseKey = res.wadeal_license_key || '';

    // Check credits from backend
    fetch(`${backendUrl}/api/v1/user-credits?client_id=${clientId}&license_key=${licenseKey}`)
      .then(r => r.json())
      .then(data => {
        const t = I18N[currentLang];
        if (data.is_pro) {
          statusBadge.textContent = t.badgePro;
          statusBadge.className = 'badge badge-pro';
        } else {
          statusBadge.textContent = `${data.credits_remaining} ${t.badgeCredits}`;
          statusBadge.className = 'badge badge-trial';
        }
      })
      .catch(() => {
        const t = I18N[currentLang];
        if (res.wadeal_is_pro) {
          statusBadge.textContent = t.badgePro;
          statusBadge.className = 'badge badge-pro';
        }
      });
  });

  // Save Context
  saveContextBtn.addEventListener('click', () => {
    const context = contextEl.value.trim();
    const backend = backendUrlEl.value.trim() || 'http://localhost:3000';
    const t = I18N[currentLang];

    chrome.storage.local.set({
      wadeal_business_context: context,
      wadeal_backend_url: backend
    }, () => {
      saveContextBtn.textContent = t.savedToast;
      setTimeout(() => {
        saveContextBtn.textContent = t.saveBtn;
      }, 1500);
    });
  });

  // Activate License Key
  activateBtn.addEventListener('click', async () => {
    const key = licenseKeyEl.value.trim();
    const backend = backendUrlEl.value.trim() || 'http://localhost:3000';
    const t = I18N[currentLang];

    if (!key) {
      licenseFeedback.textContent = currentLang === 'ar' ? 'يرجى إدخال مفتاح الترخيص.' : 'Please enter your license key.';
      licenseFeedback.className = 'feedback-msg feedback-error';
      return;
    }

    activateBtn.textContent = t.verifyingBtn;
    activateBtn.disabled = true;

    try {
      const res = await fetch(`${backend}/api/v1/verify-license`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_key: key })
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        chrome.storage.local.set({
          wadeal_license_key: key,
          wadeal_is_pro: true
        });
        statusBadge.textContent = t.badgePro;
        statusBadge.className = 'badge badge-pro';
        licenseFeedback.textContent = currentLang === 'ar' ? '✨ تم تفعيل الترخيص بنجاح! تم فتح الردود اللامحدودة.' : '✨ License activated! Unlimited deal responses unlocked.';
        licenseFeedback.className = 'feedback-msg feedback-success';
      } else {
        licenseFeedback.textContent = data.message || (currentLang === 'ar' ? 'مفتاح غير صالح.' : 'Invalid license key.');
        licenseFeedback.className = 'feedback-msg feedback-error';
      }
    } catch (e) {
      licenseFeedback.textContent = currentLang === 'ar' ? 'تعذر الاتصال بالخادم.' : 'Could not contact server.';
      licenseFeedback.className = 'feedback-msg feedback-error';
    } finally {
      activateBtn.textContent = t.activateBtn;
      activateBtn.disabled = false;
    }
  });
});
